import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import { parse, parseISO, isValid } from 'date-fns';
import {
  database,
  practiceLogsCollection,
  practiceLogAsanasCollection,
  practiceLogPhotosCollection,
  PracticeLog,
} from '@/database';
import { Q } from '@nozbe/watermelondb';

interface ParsedPracticeLog {
  title: string;
  date: string;
  duration: number;
  intensity: number;
  note?: string;
  location?: string;
  asanas: ParsedAsana[];
  photoFileNames: string[];
}

interface ParsedAsana {
  name: string;
  status?: string;
  note?: string;
}

interface ImportProgress {
  stage: 'reading' | 'parsing' | 'importing' | 'copying_photos' | 'done';
  current: number;
  total: number;
}

type ProgressCallback = (progress: ImportProgress) => void;

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Markdown 파일에서 메타데이터 파싱
 */
function parseMarkdownContent(content: string): ParsedPracticeLog | null {
  try {
    const lines = content.split('\n');

    // 제목 추출 (# 으로 시작하는 첫 줄)
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine ? titleLine.replace('# ', '').trim() : 'Untitled';

    // 메타데이터 추출
    let date = new Date().toISOString();
    let duration = 60;
    let intensity = 3;
    let location: string | undefined;
    let note: string | undefined;
    const asanas: ParsedAsana[] = [];
    const photoFileNames: string[] = [];

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Date 파싱
      if (trimmed.startsWith('**Date:**')) {
        const dateStr = trimmed.replace('**Date:**', '').trim();
        // "MMMM d, yyyy" 형식 파싱
        const parsedDate = parse(dateStr, 'MMMM d, yyyy', new Date());
        if (isValid(parsedDate)) {
          date = parsedDate.toISOString();
        }
      }

      // Duration 파싱 (예: "1h 30m" 또는 "45m")
      if (trimmed.startsWith('**Duration:**')) {
        const durationStr = trimmed.replace('**Duration:**', '').trim();
        const hourMatch = durationStr.match(/(\d+)h/);
        const minMatch = durationStr.match(/(\d+)m/);
        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
        duration = hours * 60 + mins;
      }

      // Intensity 파싱 (별 개수 카운트)
      if (trimmed.startsWith('**Intensity:**')) {
        const intensityStr = trimmed.replace('**Intensity:**', '').trim();
        const starCount = (intensityStr.match(/★/g) || []).length;
        intensity = Math.max(1, Math.min(5, starCount));
      }

      // Location 파싱
      if (trimmed.startsWith('**Location:**')) {
        location = trimmed.replace('**Location:**', '').trim();
      }

      // 섹션 감지
      if (trimmed.startsWith('## ')) {
        currentSection = trimmed.replace('## ', '').trim().toLowerCase();
        continue;
      }

      // Asanas 섹션 파싱
      if (currentSection === 'asanas' && /^\d+\.\s+\*\*/.test(trimmed)) {
        // "1. **Adho Mukha Svanasana** (attempted)" 형식
        const asanaMatch = trimmed.match(/^\d+\.\s+\*\*([^*]+)\*\*(?:\s+\(([^)]+)\))?/);
        if (asanaMatch) {
          asanas.push({
            name: asanaMatch[1].trim(),
            status: asanaMatch[2]?.trim(),
          });
        }
      }

      // Asana 노트 파싱
      if (currentSection === 'asanas' && trimmed.startsWith('- ') && asanas.length > 0) {
        asanas[asanas.length - 1].note = trimmed.replace('- ', '').trim();
      }

      // Notes 섹션 파싱
      if (currentSection === 'notes' && trimmed && !trimmed.startsWith('---')) {
        note = (note ? note + '\n' : '') + trimmed;
      }

      // Photos 섹션 파싱
      if (currentSection === 'photos' && trimmed.startsWith('![')) {
        const photoMatch = trimmed.match(/!\[.*?\]\(\.\.\/Photos\/([^)]+)\)/);
        if (photoMatch) {
          photoFileNames.push(photoMatch[1]);
        }
      }
    }

    return {
      title,
      date,
      duration,
      intensity,
      note: note?.trim(),
      location,
      asanas,
      photoFileNames,
    };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return null;
  }
}

/**
 * ZIP 파일에서 수련 기록 가져오기
 */
export async function importPracticeLogsFromZip(
  onProgress?: ProgressCallback
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. 파일 선택
    const docResult = await DocumentPicker.getDocumentAsync({
      type: 'application/zip',
      copyToCacheDirectory: true,
    });

    if (docResult.canceled || !docResult.assets?.[0]) {
      throw new Error('파일 선택이 취소되었습니다.');
    }

    const fileUri = docResult.assets[0].uri;

    // 2. ZIP 파일 읽기
    onProgress?.({ stage: 'reading', current: 0, total: 1 });

    const zipBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    const zip = await JSZip.loadAsync(zipBase64, { base64: true });

    // 3. Markdown 파일 목록 가져오기
    const mdFiles: string[] = [];
    zip.forEach((relativePath, file) => {
      if (relativePath.endsWith('.md') && relativePath.includes('Yoga_Logs/')) {
        mdFiles.push(relativePath);
      }
    });

    if (mdFiles.length === 0) {
      throw new Error('ZIP 파일에 수련 기록이 없습니다.');
    }

    // 4. 각 Markdown 파일 파싱
    onProgress?.({ stage: 'parsing', current: 0, total: mdFiles.length });

    const parsedLogs: ParsedPracticeLog[] = [];

    for (let i = 0; i < mdFiles.length; i++) {
      const mdPath = mdFiles[i];
      const mdContent = await zip.file(mdPath)?.async('string');

      if (mdContent) {
        const parsed = parseMarkdownContent(mdContent);
        if (parsed) {
          parsedLogs.push(parsed);
        }
      }

      onProgress?.({ stage: 'parsing', current: i + 1, total: mdFiles.length });
    }

    // 5. DB 트랜잭션으로 가져오기
    onProgress?.({ stage: 'importing', current: 0, total: parsedLogs.length });

    // Photos 폴더의 파일들을 메모리에 로드
    const photoFiles: Map<string, string> = new Map();
    zip.forEach((relativePath, file) => {
      if (relativePath.includes('Photos/') && !file.dir) {
        const fileName = relativePath.split('/').pop();
        if (fileName) {
          photoFiles.set(fileName, relativePath);
        }
      }
    });

    // 앱 내부 사진 저장 경로
    const appPhotosDir = `${FileSystem.documentDirectory}photos/`;

    // 폴더 생성
    const dirInfo = await FileSystem.getInfoAsync(appPhotosDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appPhotosDir, { intermediates: true });
    }

    await database.write(async () => {
      for (let i = 0; i < parsedLogs.length; i++) {
        const log = parsedLogs[i];

        try {
          // 중복 체크 (같은 날짜 + 같은 제목)
          const datePrefix = log.date.split('T')[0];
          const existingLogs = await practiceLogsCollection
            .query(
              Q.where('title', log.title),
              Q.where('date', Q.like(`${datePrefix}%`))
            )
            .fetch();

          if (existingLogs.length > 0) {
            // 중복 - 건너뛰기
            result.skipped++;
            onProgress?.({ stage: 'importing', current: i + 1, total: parsedLogs.length });
            continue;
          }

          // PracticeLog 생성
          const practiceLog = await practiceLogsCollection.create((record: any) => {
            record.title = log.title;
            record.date = log.date;
            record.duration = log.duration;
            record.intensity = log.intensity;
            record.note = log.note || '';
            record.location = log.location || '';
            record.isFavorite = false;
          });

          // Asanas 생성
          for (let j = 0; j < log.asanas.length; j++) {
            const asana = log.asanas[j];
            await practiceLogAsanasCollection.create((record: any) => {
              record.practiceLogId = practiceLog.id;
              record.asanaName = asana.name;
              record.position = j;
              record.note = asana.note || '';
              record.status = asana.status || '';
            });
          }

          // Photos 복사 및 생성
          for (let k = 0; k < log.photoFileNames.length; k++) {
            const photoFileName = log.photoFileNames[k];
            const zipPath = photoFiles.get(photoFileName);

            if (zipPath) {
              try {
                // ZIP에서 사진 데이터 읽기
                const photoBase64 = await zip.file(zipPath)?.async('base64');

                if (photoBase64) {
                  // 새 파일명 생성 (충돌 방지)
                  const newFileName = `${practiceLog.id}_${k}_${Date.now()}.jpg`;
                  const newPhotoPath = `${appPhotosDir}${newFileName}`;

                  // 파일 저장
                  await FileSystem.writeAsStringAsync(newPhotoPath, photoBase64, {
                    encoding: 'base64',
                  });

                  // DB 레코드 생성
                  await practiceLogPhotosCollection.create((record: any) => {
                    record.practiceLogId = practiceLog.id;
                    record.photoPath = newPhotoPath;
                    record.position = k;
                  });
                }
              } catch (photoError) {
                console.warn(`Failed to import photo ${photoFileName}:`, photoError);
              }
            }
          }

          result.imported++;
        } catch (logError) {
          console.error(`Failed to import log ${log.title}:`, logError);
          result.errors.push(`${log.title}: ${logError instanceof Error ? logError.message : 'Unknown error'}`);
        }

        onProgress?.({ stage: 'importing', current: i + 1, total: parsedLogs.length });
      }
    });

    // 6. 임시 파일 정리
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}

    onProgress?.({ stage: 'done', current: 1, total: 1 });

    return result;

  } catch (error) {
    if (error instanceof Error && error.message === '파일 선택이 취소되었습니다.') {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : '가져오기 중 오류가 발생했습니다.');
  }
}
