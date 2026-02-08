import { 
  Accessibility, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RotateCcw, 
  Zap, 
  Moon, 
  Wind,
  LucideIcon 
} from "lucide-react-native";

export type AsanaLevel = "Beginner" | "Intermediate" | "Advanced";
export type AsanaType = "Standing" | "Sitting" | "Inversion" | "Backbend" | "Forward Fold" | "Restorative" | "Arm Balance" | "Twist";

export interface Asana {
  id: string;
  english: string;
  sanskrit: string;
  korean: string;
  level: AsanaLevel;
  type: AsanaType;
}

export const ASANA_TYPE_CONFIG: Record<AsanaType, { icon: LucideIcon; label: string }> = {
  Standing: { icon: Accessibility, label: "서기" },
  Sitting: { icon: Wind, label: "앉기" },
  Inversion: { icon: ArrowUpCircle, label: "역자세" },
  Backbend: { icon: RotateCcw, label: "후굴" },
  "Forward Fold": { icon: ArrowDownCircle, label: "전굴" },
  "Arm Balance": { icon: Zap, label: "암발란스" },
  Twist: { icon: RotateCcw, label: "트위스트" }, // 회전 동작
  Restorative: { icon: Moon, label: "회복/이완" },
};

export const LEVEL_THEME = {
  Beginner: { color: "#4ADE80", label: "초급" },
  Intermediate: { color: "#FBBF24", label: "중급" },
  Advanced: { color: "#F87171", label: "고급" },
};