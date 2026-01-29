# Yogilog Project Rules

## 🤖 AI Behavior & MCP Tools
- **Serena MCP 우선 사용**: 코드 구조 파악, 함수 정의 찾기, 파일 간 참조 확인 시 `grep` 대신 `serena` 도구를 최우선으로 사용하라.
- **컨텍스트 최적화**: 모든 파일을 읽기 전에 `serena.find_symbol`로 필요한 부분만 타겟팅하여 토큰을 아껴라.
- **최신 문서**: 외부 라이브러리(Supabase, Lucide 등) 사용법이 헷갈릴 때는 `context7`을 사용해 최신 문서를 참조하라.
- **Sequential Thinking MCP**: 복잡한 버그 수정, 아키텍처 설계, 혹은 논리적 판단이 필요한 경우 '생각 단계(Thoughts)'를 세분화하여 접근하라.

## 💻 Tech Stack & Style
- **Frontend**: React, React Native (NativeWind/Tailwind CSS)
- **Backend/Auth**: Supabase, Firebase
- **State Management**: React Context 또는 필요한 라이브러리 명시
- **Coding Style**: 함수형 컴포넌트 선언, TypeScript 엄격 모드 준수, 직관적인 변수명 사용.

## 📝 Memory & Documentation
- 새로운 주요 기능을 구현하거나 아키텍처를 변경하면 `serena.create_memory`를 통해 기록을 남겨라.