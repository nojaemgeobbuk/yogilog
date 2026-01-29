import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SvgProps } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { ASANA_DB } from "@/constants/AsanaDB";

// 최적화된 SVG 아이콘 매핑 (React Native는 동적 require 불가)
// SVG는 currentColor를 사용하므로 color prop으로 색상 지정 가능
import TadasanaSvg from "@/assets/images/icons-optimized/Tadasana.svg";
import BalasanaSvg from "@/assets/images/icons-optimized/Balasana.svg";
import AdhoMukhaSvanasanaSvg from "@/assets/images/icons-optimized/Adho Mukha Svanasana.svg";
import VirabhadrasanaISvg from "@/assets/images/icons-optimized/Virabhadrasana I.svg";
import VirabhadrasanaIISvg from "@/assets/images/icons-optimized/Virabhadrasana II.svg";
import VrikshasanaSvg from "@/assets/images/icons-optimized/Vrikshasana.svg";
import MarjaryasanaSvg from "@/assets/images/icons-optimized/Marjaryasana.svg";
import BitilasanaSvg from "@/assets/images/icons-optimized/Bitilasana.svg";
import BhujangasanaSvg from "@/assets/images/icons-optimized/Bhujangasana.svg";
import SetuBandhasanaSvg from "@/assets/images/icons-optimized/Setu Bandhasana.svg";
import SukhasanaSvg from "@/assets/images/icons-optimized/Sukhasana.svg";
import ShavasanaSvg from "@/assets/images/icons-optimized/Shavasana.svg";
import PhalakasanaSvg from "@/assets/images/icons-optimized/Phalakasana.svg";
import AnandaBalasanaSvg from "@/assets/images/icons-optimized/Ananda Balasana.svg";
import BaddhaKonasanaSvg from "@/assets/images/icons-optimized/Baddha Konasana.svg";
import VirabhadrasanaIIISvg from "@/assets/images/icons-optimized/Virabhadrasana III.svg";
import TrikonasanaSvg from "@/assets/images/icons-optimized/Trikonasana.svg";
import ArdhaChandrasanaSvg from "@/assets/images/icons-optimized/Ardha Chandrasana.svg";
import BakasanaSvg from "@/assets/images/icons-optimized/Bakasana.svg";
import EkaPadaRajakapotasanaSvg from "@/assets/images/icons-optimized/Eka Pada Rajakapotasana.svg";
import NavasanaSvg from "@/assets/images/icons-optimized/Navasana.svg";
import UstrasanaSvg from "@/assets/images/icons-optimized/Ustrasana.svg";
import GarudasanaSvg from "@/assets/images/icons-optimized/Garudasana.svg";
import UtkatasanaSvg from "@/assets/images/icons-optimized/Utkatasana.svg";
import UtthitaParsvakonasanaSvg from "@/assets/images/icons-optimized/Utthita Parsvakonasana.svg";
import SalambaSarvangasanaSvg from "@/assets/images/icons-optimized/Salamba Sarvangasana.svg";
import HalasanaSvg from "@/assets/images/icons-optimized/Halasana.svg";
import CamatkarasanaSvg from "@/assets/images/icons-optimized/Camatkarasana.svg";
import NatarajasanaSvg from "@/assets/images/icons-optimized/Natarajasana.svg";
import ChaturangaDandasanaSvg from "@/assets/images/icons-optimized/Chaturanga Dandasana.svg";
import MalasanaSvg from "@/assets/images/icons-optimized/Malasana.svg";
import ParivrtttaTrikonasanaSvg from "@/assets/images/icons-optimized/Parivrtta-Trikonasana.svg";
import GomukhasanaSvg from "@/assets/images/icons-optimized/Gomukhasana.svg";
import VirasanaSvg from "@/assets/images/icons-optimized/Virasana.svg";
import DhanurasanaSvg from "@/assets/images/icons-optimized/Dhanurasana.svg";
import SalambaSirsasanaSvg from "@/assets/images/icons-optimized/Salamba Sirsasana.svg";
import UrdhvaDhanurasanaSvg from "@/assets/images/icons-optimized/Urdhva Dhanurasana.svg";
import PinchaMayurasanaSvg from "@/assets/images/icons-optimized/Pincha Mayurasana.svg";
import AdhoMukhaVrksasanaSvg from "@/assets/images/icons-optimized/Adho Mukha Vrksasana.svg";
import AstavakrasanaSvg from "@/assets/images/icons-optimized/Astavakrasana.svg";
import RajakapotasanaSvg from "@/assets/images/icons-optimized/Rajakapotasana.svg";
import TittibhasanaSvg from "@/assets/images/icons-optimized/Tittibhasana.svg";
import VrischikasanaSvg from "@/assets/images/icons-optimized/Vrischikasana.svg";
import ParsvaBakasanaSvg from "@/assets/images/icons-optimized/Parsva-Bakasana.svg";
import HanumanasanaSvg from "@/assets/images/icons-optimized/Hanumanasana.svg";
import MayurasanaSvg from "@/assets/images/icons-optimized/Mayurasana.svg";
import ParivrtttaSuryaYantrasanaSvg from "@/assets/images/icons-optimized/Parivrtta Surya Yantrasana.svg";
import TolasanaSvg from "@/assets/images/icons-optimized/Tolasana.svg";
import EkaPadaGalavasanaSvg from "@/assets/images/icons-optimized/Eka Pada Galavasana.svg";

// SVG 컴포넌트 매핑
const ASANA_ICONS: Record<string, React.FC<SvgProps>> = {
  "Tadasana": TadasanaSvg,
  "Balasana": BalasanaSvg,
  "Adho Mukha Svanasana": AdhoMukhaSvanasanaSvg,
  "Virabhadrasana I": VirabhadrasanaISvg,
  "Virabhadrasana II": VirabhadrasanaIISvg,
  "Vrikshasana": VrikshasanaSvg,
  "Marjaryasana": MarjaryasanaSvg,
  "Bitilasana": BitilasanaSvg,
  "Bhujangasana": BhujangasanaSvg,
  "Setu Bandhasana": SetuBandhasanaSvg,
  "Sukhasana": SukhasanaSvg,
  "Shavasana": ShavasanaSvg,
  "Phalakasana": PhalakasanaSvg,
  "Ananda Balasana": AnandaBalasanaSvg,
  "Baddha Konasana": BaddhaKonasanaSvg,
  "Virabhadrasana III": VirabhadrasanaIIISvg,
  "Trikonasana": TrikonasanaSvg,
  "Ardha Chandrasana": ArdhaChandrasanaSvg,
  "Bakasana": BakasanaSvg,
  "Eka Pada Rajakapotasana": EkaPadaRajakapotasanaSvg,
  "Navasana": NavasanaSvg,
  "Ustrasana": UstrasanaSvg,
  "Garudasana": GarudasanaSvg,
  "Utkatasana": UtkatasanaSvg,
  "Utthita Parsvakonasana": UtthitaParsvakonasanaSvg,
  "Salamba Sarvangasana": SalambaSarvangasanaSvg,
  "Halasana": HalasanaSvg,
  "Camatkarasana": CamatkarasanaSvg,
  "Natarajasana": NatarajasanaSvg,
  "Chaturanga Dandasana": ChaturangaDandasanaSvg,
  "Malasana": MalasanaSvg,
  "Parivrtta Trikonasana": ParivrtttaTrikonasanaSvg,
  "Gomukhasana": GomukhasanaSvg,
  "Virasana": VirasanaSvg,
  "Dhanurasana": DhanurasanaSvg,
  "Salamba Sirsasana": SalambaSirsasanaSvg,
  "Urdhva Dhanurasana": UrdhvaDhanurasanaSvg,
  "Pincha Mayurasana": PinchaMayurasanaSvg,
  "Adho Mukha Vrksasana": AdhoMukhaVrksasanaSvg,
  "Astavakrasana": AstavakrasanaSvg,
  "Rajakapotasana": RajakapotasanaSvg,
  "Tittibhasana": TittibhasanaSvg,
  "Vrischikasana": VrischikasanaSvg,
  "Parsva Bakasana": ParsvaBakasanaSvg,
  "Hanumanasana": HanumanasanaSvg,
  "Mayurasana": MayurasanaSvg,
  "Parivrtta Surya Yantrasana": ParivrtttaSuryaYantrasanaSvg,
  "Tolasana": TolasanaSvg,
  "Eka Pada Galavasana": EkaPadaGalavasanaSvg,
};

// 영어 이름 → 산스크리트 이름 매핑 생성
const ENGLISH_TO_SANSKRIT: Record<string, string> = {};
ASANA_DB.forEach((asana) => {
  ENGLISH_TO_SANSKRIT[asana.english.toLowerCase()] = asana.sanskrit;
});

interface AsanaIconProps {
  /** 아사나 이름 (영어 또는 산스크리트) */
  name: string;
  /** 아이콘 크기 (기본값: 28) */
  size?: number;
  /** Fallback 배경색 (아이콘 없을 때) */
  fallbackBgColor?: string;
  /** Fallback 텍스트 색상 */
  fallbackTextColor?: string;
  /** 아이콘 색상 (SVG fill에 적용) */
  color?: string;
}

export function AsanaIcon({
  name,
  size = 28,
  fallbackBgColor = Colors.secondary,      // Beige for Warm Minimal
  fallbackTextColor = Colors.text,          // Black text for Warm Minimal
  color = Colors.text,                      // Black icon for Warm Minimal
}: AsanaIconProps) {
  // 산스크리트 이름 찾기 (입력이 영어일 수도, 산스크리트일 수도 있음)
  let sanskritName = name;

  // 영어 이름으로 검색
  const mappedSanskrit = ENGLISH_TO_SANSKRIT[name.toLowerCase()];
  if (mappedSanskrit) {
    sanskritName = mappedSanskrit;
  }

  // SVG 컴포넌트 가져오기
  const SvgIcon = ASANA_ICONS[sanskritName];

  if (SvgIcon) {
    // SVG 아이콘 렌더링: currentColor를 통해 색상 제어
    // SVG 파일이 fill="currentColor"를 사용하므로 color prop으로 색상 적용
    return (
      <SvgIcon
        width={size}
        height={size}
        color={color}
      />
    );
  }

  // Fallback: 이름의 첫 글자 표시
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
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
  fallback: {
    justifyContent: "center",
    alignItems: "center",
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
