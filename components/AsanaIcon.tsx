import { ASANA_DB } from "@/constants/AsanaDB";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// ============================================================
// PNG 아이콘 임포트 (배경 제거된 아이콘) - 공백 없는 파일명
// ============================================================
import AdhoMukhaSvanasanaPng from "@/assets/images/asana-icons/AdhoMukhaSvanasana.png";
import AdhoMukhaVrikshasanaPng from "@/assets/images/asana-icons/AdhoMukhaVrikshasana.png";
import AnjaneyasanaPng from "@/assets/images/asana-icons/Anjaneyasana.png";
import ApanasanaPng from "@/assets/images/asana-icons/Apanasana.png";
import ArdhaChandrasanaPng from "@/assets/images/asana-icons/ArdhaChandrasana.png";
import ArdhaKapotasanaPng from "@/assets/images/asana-icons/ArdhaKapotasana.png";
import ArdhaPinchaMayurasanaPng from "@/assets/images/asana-icons/ArdhaPinchaMayurasana.png";
import ArdhaUttanasanaPng from "@/assets/images/asana-icons/ArdhaUttanasana.png";
import AshtaChandrasanaPng from "@/assets/images/asana-icons/AshtaChandrasana.png";
import AshvaSanchalanasanaPng from "@/assets/images/asana-icons/AshvaSanchalanasana.png";
import BaddhaKonasanaPng from "@/assets/images/asana-icons/BaddhaKonasana.png";
import BakasanaPng from "@/assets/images/asana-icons/Bakasana.png";
import BalasanaPng from "@/assets/images/asana-icons/Balasana.png";
import BitilasanaPng from "@/assets/images/asana-icons/Bitilasana.png";
import ChaturangaDandasanaPng from "@/assets/images/asana-icons/ChaturangaDandasana.png";
import DandasanaPng from "@/assets/images/asana-icons/Dandasana.png";
import DandayamanaDhanurasanaPng from "@/assets/images/asana-icons/DandayamanaDhanurasana.png";
import DhanurasanaPng from "@/assets/images/asana-icons/Dhanurasana.png";
import DurvasanaPng from "@/assets/images/asana-icons/Durvasana.png";
import EkaPadaAdhoMukhaShvanasanaPng from "@/assets/images/asana-icons/EkaPadaAdhoMukhaShvanasana.png";
import EkaPadaKoundinyasanaPng from "@/assets/images/asana-icons/EkaPadaKoundinyasana.png";
import EkaPadaRajaKapotasanaPng from "@/assets/images/asana-icons/EkaPadaRajaKapotasana.png";
import EkaPadaSarvangasanaPng from "@/assets/images/asana-icons/EkaPadaSarvangasana.png";
import EkaPadaSirsasanaPng from "@/assets/images/asana-icons/EkaPadaSirsasana.png";
import EkaPadaUrdhvaDhanurasanaPng from "@/assets/images/asana-icons/EkaPadaUrdhvaDhanurasana.png";
import GarudasanaPng from "@/assets/images/asana-icons/Garudasana.png";
import GomukhasanaPng from "@/assets/images/asana-icons/Gomukhasana.png";
import HalasanaPng from "@/assets/images/asana-icons/Halasana.png";
import HanumanasanaPng from "@/assets/images/asana-icons/Hanumanasana.png";
import KapotasanaPng from "@/assets/images/asana-icons/Kapotasana.png";
import KarnapidasanaPng from "@/assets/images/asana-icons/Karnapidasana.png";
import KraunchasanaPng from "@/assets/images/asana-icons/Kraunchasana.png";
import KukkutasanaPng from "@/assets/images/asana-icons/Kukkutasana.png";
import MalasanaPng from "@/assets/images/asana-icons/Malasana.png";
import MarjariasanaPng from "@/assets/images/asana-icons/Marjariasana.png";
import MatsyasanaPng from "@/assets/images/asana-icons/Matsyasana.png";
import NavasanaPng from "@/assets/images/asana-icons/Navasana.png";
import PadmaSirsasanaPng from "@/assets/images/asana-icons/PadmaSirsasana.png";
import PadmasanaPng from "@/assets/images/asana-icons/Padmasana.png";
import ParivrttaHastaPadangusthasanaPng from "@/assets/images/asana-icons/ParivrttaHastaPadangusthasana.png";
import ParivrttaJanuShirshasanaPng from "@/assets/images/asana-icons/ParivrttaJanuShirshasana.png";
import ParshvottanasanaPng from "@/assets/images/asana-icons/Parshvottanasana.png";
import PaschimottanasanaPng from "@/assets/images/asana-icons/Paschimottanasana.png";
import PhalakasanaPng from "@/assets/images/asana-icons/Phalakasana.png";
import PinchaMayurasanaPng from "@/assets/images/asana-icons/PinchaMayurasana.png";
import PindasanaPng from "@/assets/images/asana-icons/Pindasana.png";
import PrasaritaPadottanasanaPng from "@/assets/images/asana-icons/PrasaritaPadottanasana.png";
import PurvottanasanaPng from "@/assets/images/asana-icons/Purvottanasana.png";
import SalambaBhujangasanaPng from "@/assets/images/asana-icons/SalambaBhujangasana.png";
import SalambaSarvangasanaPng from "@/assets/images/asana-icons/SalambaSarvangasana.png";
import SalambaSirsasanaPng from "@/assets/images/asana-icons/SalambaSirsasana.png";
import SamakonasanaPng from "@/assets/images/asana-icons/Samakonasana.png";
import SarpasanaPng from "@/assets/images/asana-icons/Sarpasana.png";
import SetuBandhasanaPng from "@/assets/images/asana-icons/SetuBandhasana.png";
import ShalabhasanaPng from "@/assets/images/asana-icons/Shalabhasana.png";
import ShavasanaPng from "@/assets/images/asana-icons/Shavasana.png";
import SkandasanaPng from "@/assets/images/asana-icons/Skandasana.png";
import SuptaKonasanaPng from "@/assets/images/asana-icons/SuptaKonasana.png";
import SuptaPadangusthasanaPng from "@/assets/images/asana-icons/SuptaPadangusthasana.png";
import SuptaVirasanaPng from "@/assets/images/asana-icons/SuptaVirasana.png";
import SvargaDvijasanaPng from "@/assets/images/asana-icons/SvargaDvijasana.png";
import TadasanaPng from "@/assets/images/asana-icons/Tadasana.png";
import UpavisthaKonasanaPng from "@/assets/images/asana-icons/UpavisthaKonasana.png";
import UrdhvaDhanurasanaPng from "@/assets/images/asana-icons/UrdhvaDhanurasana.png";
import UrdhvaHastasanaPng from "@/assets/images/asana-icons/UrdhvaHastasana.png";
import UrdhvaPadmasanaPng from "@/assets/images/asana-icons/UrdhvaPadmasana.png";
import UrdhvaPrasaritaEkaPadasanaPng from "@/assets/images/asana-icons/UrdhvaPrasaritaEkaPadasana.png";
import UshtrasanaPng from "@/assets/images/asana-icons/Ushtrasana.png";
import UtkataKonasanaPng from "@/assets/images/asana-icons/UtkataKonasana.png";
import UtkatasanaPng from "@/assets/images/asana-icons/Utkatasana.png";
import UttanaShishosanaPng from "@/assets/images/asana-icons/UttanaShishosana.png";
import UtthitaHastaPadangusthasanaPng from "@/assets/images/asana-icons/UtthitaHastaPadangusthasana.png";
import UtthitaPadmasanaPng from "@/assets/images/asana-icons/UtthitaPadmasana.png";
import UtthitaTrikonasanaPng from "@/assets/images/asana-icons/UtthitaTrikonasana.png";
import VajrasanaPng from "@/assets/images/asana-icons/Vajrasana.png";
import ViparitaDandasanaPng from "@/assets/images/asana-icons/ViparitaDandasana.png";
import VirabhadrasanaIPng from "@/assets/images/asana-icons/VirabhadrasanaI.png";
import VirabhadrasanaIIPng from "@/assets/images/asana-icons/VirabhadrasanaII.png";
import VirabhadrasanaIIIPng from "@/assets/images/asana-icons/VirabhadrasanaIII.png";
import VirasanaPng from "@/assets/images/asana-icons/Virasana.png";
import VrikshasanaPng from "@/assets/images/asana-icons/Vrikshasana.png";
import VrischikasanaPng from "@/assets/images/asana-icons/Vrischikasana.png";

// ============================================================
// PNG 아이콘 매핑
// ============================================================
const ASANA_ICONS: Record<string, number> = {
  // Standing poses
  "Tadasana": TadasanaPng,
  "Urdhva Hastasana": UrdhvaHastasanaPng,
  "Utkatasana": UtkatasanaPng,
  "Ardha Uttanasana": ArdhaUttanasanaPng,
  "Ashta Chandrasana": AshtaChandrasanaPng,
  "Anjaneyasana": AnjaneyasanaPng,
  "Ashva Sanchalanasana": AshvaSanchalanasanaPng,
  "Ardha Chandrasana": ArdhaChandrasanaPng,
  "Virabhadrasana I": VirabhadrasanaIPng,
  "Virabhadrasana II": VirabhadrasanaIIPng,
  "Virabhadrasana III": VirabhadrasanaIIIPng,
  "Utthita Trikonasana": UtthitaTrikonasanaPng,
  "Trikonasana": UtthitaTrikonasanaPng,
  "Utthita Hasta Padangusthasana": UtthitaHastaPadangusthasanaPng,
  "Parshvottanasana": ParshvottanasanaPng,
  "Urdhva Prasarita Eka Padasana": UrdhvaPrasaritaEkaPadasanaPng,
  "Vrikshasana": VrikshasanaPng,
  "Garudasana": GarudasanaPng,
  "Dandayamana Dhanurasana": DandayamanaDhanurasanaPng,
  "Svarga Dvijasana": SvargaDvijasanaPng,
  "Durvasana": DurvasanaPng,
  "Prasarita Padottanasana": PrasaritaPadottanasanaPng,
  "Malasana": MalasanaPng,
  "Utkata Konasana": UtkataKonasanaPng,
  "Skandasana": SkandasanaPng,

  // Sitting poses
  "Padmasana": PadmasanaPng,
  "Baddha Konasana": BaddhaKonasanaPng,
  "Virasana": VirasanaPng,
  "Vajrasana": VajrasanaPng,
  "Gomukhasana": GomukhasanaPng,
  "Paschimottanasana": PaschimottanasanaPng,
  "Parivrtta Janu Shirshasana": ParivrttaJanuShirshasanaPng,
  "Navasana": NavasanaPng,
  "Upavistha Konasana": UpavisthaKonasanaPng,
  "Parivrtta Hasta Padangusthasana": ParivrttaHastaPadangusthasanaPng,
  "Kraunchasana": KraunchasanaPng,
  "Ardha Kapotasana": ArdhaKapotasanaPng,
  "Eka Pada Raja Kapotasana": EkaPadaRajaKapotasanaPng,
  "Eka Pada Rajakapotasana": EkaPadaRajaKapotasanaPng,
  "Hanumanasana": HanumanasanaPng,
  "Samakonasana": SamakonasanaPng,
  "Dandasana": DandasanaPng,
  "Kukkutasana": KukkutasanaPng,
  "Utthita Padmasana": UtthitaPadmasanaPng,

  // Restorative poses
  "Balasana": BalasanaPng,
  "Uttana Shishosana": UttanaShishosanaPng,
  "Shavasana": ShavasanaPng,

  // Backbend poses
  "Shalabhasana": ShalabhasanaPng,
  "Sarpasana": SarpasanaPng,
  "Salamba Bhujangasana": SalambaBhujangasanaPng,
  "Bhujangasana": SalambaBhujangasanaPng,
  "Dhanurasana": DhanurasanaPng,
  "Ushtrasana": UshtrasanaPng,
  "Ustrasana": UshtrasanaPng,
  "Kapotasana": KapotasanaPng,
  "Setu Bandhasana": SetuBandhasanaPng,
  "Urdhva Dhanurasana": UrdhvaDhanurasanaPng,
  "Purvottanasana": PurvottanasanaPng,
  "Viparita Dandasana": ViparitaDandasanaPng,
  "Eka Pada Urdhva Dhanurasana": EkaPadaUrdhvaDhanurasanaPng,
  "Matsyasana": MatsyasanaPng,

  // Supine poses
  "Supta Padangusthasana": SuptaPadangusthasanaPng,
  "Apanasana": ApanasanaPng,
  "Supta Virasana": SuptaVirasanaPng,

  // All fours poses
  "Marjariasana": MarjariasanaPng,
  "Marjaryasana": MarjariasanaPng,
  "Bitilasana": BitilasanaPng,
  "Adho Mukha Svanasana": AdhoMukhaSvanasanaPng,
  "Eka Pada Adho Mukha Svanasana": EkaPadaAdhoMukhaShvanasanaPng,
  "Eka Pada Adho Mukha Shvanasana": EkaPadaAdhoMukhaShvanasanaPng,
  "Ardha Pincha Mayurasana": ArdhaPinchaMayurasanaPng,

  // Arm Balance poses
  "Phalakasana": PhalakasanaPng,
  "Chaturanga Dandasana": ChaturangaDandasanaPng,
  "Bakasana": BakasanaPng,
  "Eka Pada Koundinyasana": EkaPadaKoundinyasanaPng,

  // Inversion poses
  "Salamba Sarvangasana": SalambaSarvangasanaPng,
  "Eka Pada Sarvangasana": EkaPadaSarvangasanaPng,
  "Halasana": HalasanaPng,
  "Urdhva Padmasana": UrdhvaPadmasanaPng,
  "Supta Konasana": SuptaKonasanaPng,
  "Karnapidasana": KarnapidasanaPng,
  "Pindasana": PindasanaPng,
  "Salamba Sirsasana": SalambaSirsasanaPng,
  "Eka Pada Sirsasana": EkaPadaSirsasanaPng,
  "Padma Sirsasana": PadmaSirsasanaPng,
  "Pincha Mayurasana": PinchaMayurasanaPng,
  "Adho Mukha Vrikshasana": AdhoMukhaVrikshasanaPng,
  "Adho Mukha Vrksasana": AdhoMukhaVrikshasanaPng,
  "Vrischikasana": VrischikasanaPng,
};

// 영어 이름 → 산스크리트 이름 매핑 생성
const ENGLISH_TO_SANSKRIT: Record<string, string> = {};
ASANA_DB.forEach((asana) => {
  ENGLISH_TO_SANSKRIT[asana.english.toLowerCase()] = asana.sanskrit;
});

// 아이콘 내부 여백 비율 (컨테이너 대비 아이콘이 차지하는 비율)
const ICON_FILL_RATIO = 0.88; // 88% - 안전 영역 12%

interface AsanaIconProps {
  /** 아사나 이름 (영어 또는 산스크리트) */
  name: string;
  /** 컨테이너 크기 (기본값: 32) - 정사각형 */
  size?: number;
  /** Fallback 배경색 (아이콘 없을 때) */
  fallbackBgColor?: string;
  /** Fallback 텍스트 색상 */
  fallbackTextColor?: string;
  /** 아이콘 색상 (PNG에는 적용 안됨, 호환성 유지용) */
  color?: string;
  /** 컨테이너 배경색 (기본: 투명) */
  containerBgColor?: string;
}

export function AsanaIcon({
  name,
  size = 32,
  fallbackBgColor = Colors.secondary,
  fallbackTextColor = Colors.text,
  containerBgColor = "transparent",
}: AsanaIconProps) {
  // 산스크리트 이름 찾기 (입력이 영어일 수도, 산스크리트일 수도 있음)
  let sanskritName = name;

  // 영어 이름으로 검색
  const mappedSanskrit = ENGLISH_TO_SANSKRIT[name.toLowerCase()];
  if (mappedSanskrit) {
    sanskritName = mappedSanskrit;
  }

  // PNG 아이콘 확인
  const pngIcon = ASANA_ICONS[sanskritName];
  if (pngIcon) {
    // 아이콘이 컨테이너의 88%를 차지하도록 계산
    const iconSize = Math.round(size * ICON_FILL_RATIO);

    return (
      <View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            backgroundColor: containerBgColor,
          },
        ]}
      >
        <Image
          source={pngIcon}
          style={{
            width: iconSize,
            height: iconSize,
          }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Fallback: 이름의 첫 글자 표시
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.iconContainer,
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: fallbackBgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.fallbackText,
          { fontSize: size * 0.5, color: fallbackTextColor },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fallback: {
    // 추가 fallback 스타일 (필요시)
  },
  fallbackText: {
    fontWeight: "bold",
  },
});

// 아이콘이 있는지 확인하는 유틸 함수
export function hasAsanaIcon(name: string): boolean {
  const mappedSanskrit = ENGLISH_TO_SANSKRIT[name.toLowerCase()];
  const sanskritName = mappedSanskrit || name;
  return sanskritName in ASANA_ICONS;
}

// 영어 이름으로 산스크리트 이름 가져오기
export function getSanskritName(englishName: string): string | null {
  return ENGLISH_TO_SANSKRIT[englishName.toLowerCase()] || null;
}

// 영어 이름으로 아사나 정보 가져오기
export function getAsanaInfo(name: string) {
  const asana = ASANA_DB.find(
    (a) => a.english.toLowerCase() === name.toLowerCase() ||
           a.sanskrit.toLowerCase() === name.toLowerCase()
  );
  return asana || null;
}
