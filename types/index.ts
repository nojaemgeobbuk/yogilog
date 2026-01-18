export interface YogaSession {
  id: string;
  title: string;
  images: string[];
  note: string;
  date: string;
  duration: number;
  intensity: number;
  hashtags: string[];
  asanas: string[];
}

export interface YogaStore {
  sessions: YogaSession[];
  addSession: (session: Omit<YogaSession, "id">) => void;
  updateSession: (id: string, session: Partial<YogaSession>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => YogaSession | undefined;
}
