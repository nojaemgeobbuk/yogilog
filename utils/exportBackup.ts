import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { database, PracticeLog, PracticeLogAsana, PracticeLogPhoto } from '@/database';
import { Q } from '@nozbe/watermelondb';

interface ExportProgress {
  stage: 'preparing' | 'creating_files' | 'copying_photos' | 'zipping' | 'done';
  current: number;
  total: number;
}

type ProgressCallback = (progress: ExportProgress) => void;

/**
 * practice_log를 Markdown 형식으로 변환
 */
function practiceLogToMarkdown(
  log: PracticeLog,
  asanas: PracticeLogAsana[],
  photos: PracticeLogPhoto[]
): string {
  const dateFormatted = format(new Date(log.date), 'yyyy-MM-dd');
  const dateReadable = format(new Date(log.date), 'MMMM d, yyyy');

  let md = `# ${log.title}\n\n`;
  md += `**Date:** ${dateReadable}\n`;
  md += `**Duration:** ${Math.floor(log.duration / 60)}h ${log.duration % 60}m\n`;
  md += `**Intensity:** ${'★'.repeat(log.intensity)}${'☆'.repeat(5 - log.intensity)}\n`;

  if (log.location) {
    md += `**Location:** ${log.location}\n`;
  }

  md += `\n---\n\n`;

  // Asanas section
  if (asanas.length > 0) {
    md += `## Asanas\n\n`;
    asanas.forEach((asana, index) => {
      md += `${index + 1}. **${asana.asanaName}**`;
      if (asana.status) {
        md += ` (${asana.status})`;
      }
      md += `\n`;
      if (asana.note) {
        md += `   - ${asana.note}\n`;
      }
    });
    md += `\n`;
  }

  // Notes section
  if (log.note) {
    md += `## Notes\n\n`;
    // HTML을 간단히 텍스트로 변환 (기본적인 태그 제거)
    const noteText = log.note
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    md += `${noteText}\n\n`;
  }

  // Photos section
  if (photos.length > 0) {
    md += `## Photos\n\n`;
    photos.forEach((photo, index) => {
      const photoFileName = `${dateFormatted}_${log.id}_${index + 1}.jpg`;
      md += `![Photo ${index + 1}](../Photos/${photoFileName})\n`;
    });
    md += `\n`;
  }

  md += `---\n`;
  md += `*Exported from Yogilog*\n`;

  return md;
}

/**
 * 모든 수련 기록을 ZIP 파일로 내보내기
 */
export async function exportPracticeLogsToZip(
  onProgress?: ProgressCallback
): Promise<string> {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const zipPath = `${FileSystem.cacheDirectory}Yogilog_Backup_${timestamp}.zip`;

  try {
    // 1. JSZip 인스턴스 생성
    onProgress?.({ stage: 'preparing', current: 0, total: 1 });
    const zip = new JSZip();
    const logsFolder = zip.folder('Yoga_Logs');
    const photosFolder = zip.folder('Photos');

    if (!logsFolder || !photosFolder) {
      throw new Error('ZIP 폴더 생성 실패');
    }

    // 2. 모든 practice_logs 가져오기
    const practiceLogsCollection = database.get<PracticeLog>('practice_logs');
    const allLogs = await practiceLogsCollection
      .query(Q.sortBy('date', Q.desc))
      .fetch();

    if (allLogs.length === 0) {
      throw new Error('내보낼 수련 기록이 없습니다.');
    }

    // 3. 각 로그를 MD 파일로 생성
    onProgress?.({ stage: 'creating_files', current: 0, total: allLogs.length });

    const photoTasks: { source: string; fileName: string }[] = [];

    for (let i = 0; i < allLogs.length; i++) {
      const log = allLogs[i];
      const asanas = await log.asanasOrdered.fetch();
      const photos = await log.photosOrdered.fetch();

      // MD 파일 생성
      const dateFormatted = format(new Date(log.date), 'yyyy-MM-dd');
      const safeTitle = log.title
        .replace(/[<>:"/\\|?*]/g, '_')
        .substring(0, 50);
      const mdFileName = `${dateFormatted}_${safeTitle}.md`;
      const mdContent = practiceLogToMarkdown(log, asanas, photos);

      logsFolder.file(mdFileName, mdContent);

      // 사진 복사 태스크 수집
      photos.forEach((photo, index) => {
        const photoFileName = `${dateFormatted}_${log.id}_${index + 1}.jpg`;
        photoTasks.push({
          source: photo.photoPath,
          fileName: photoFileName,
        });
      });

      onProgress?.({ stage: 'creating_files', current: i + 1, total: allLogs.length });
    }

    // 4. 사진 추가
    if (photoTasks.length > 0) {
      onProgress?.({ stage: 'copying_photos', current: 0, total: photoTasks.length });

      for (let i = 0; i < photoTasks.length; i++) {
        const { source, fileName } = photoTasks[i];
        try {
          // 파일이 존재하는지 확인
          const fileInfo = await FileSystem.getInfoAsync(source);
          if (fileInfo.exists) {
            // Base64로 읽어서 ZIP에 추가
            const base64Data = await FileSystem.readAsStringAsync(source, {
              encoding: 'base64',
            });
            photosFolder.file(fileName, base64Data, { base64: true });
          }
        } catch (error) {
          console.warn(`Failed to add photo: ${source}`, error);
          // 사진 추가 실패해도 계속 진행
        }
        onProgress?.({ stage: 'copying_photos', current: i + 1, total: photoTasks.length });
      }
    }

    // 5. README 파일 생성
    const readmeContent = `# Yogilog Backup

Exported on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}

## Contents
- **Yoga_Logs/**: ${allLogs.length} practice log(s) in Markdown format
- **Photos/**: ${photoTasks.length} photo(s)

## How to Use
- Import the Markdown files into Notion, Obsidian, or any other note-taking app
- Photos are linked using relative paths (../Photos/filename.jpg)

---
*Generated by Yogilog*
`;

    zip.file('README.md', readmeContent);

    // 6. ZIP 생성 및 파일로 저장
    onProgress?.({ stage: 'zipping', current: 0, total: 1 });

    const zipBase64 = await zip.generateAsync({ type: 'base64' });
    await FileSystem.writeAsStringAsync(zipPath, zipBase64, {
      encoding: 'base64',
    });

    onProgress?.({ stage: 'done', current: 1, total: 1 });

    return zipPath;

  } catch (error) {
    throw error;
  }
}

/**
 * ZIP 파일을 시스템 공유 시트로 공유
 */
export async function shareZipFile(zipPath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('이 기기에서는 공유 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(zipPath, {
    mimeType: 'application/zip',
    dialogTitle: 'Yogilog 백업 파일 저장',
    UTI: 'public.zip-archive',
  });

  // 공유 후 임시 파일 정리
  try {
    await FileSystem.deleteAsync(zipPath, { idempotent: true });
  } catch {}
}
