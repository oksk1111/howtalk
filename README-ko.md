# HowTalk AI 메신저

**🌍 Language / 언어**: [English](README.md) | [한국어](README-ko.md)

인공지능 기반 실시간 메신저 애플리케이션으로, 지능형 대화 지원, 페르소나 기반 채팅 기능, 결제 시스템이 통합된 플랫폼입니다.

## 🚀 주요 기능

### 💬 메신징 시스템
- **실시간 메시징**: WebSocket을 통한 즉시 채팅
- **AI 페르소나 시스템**: 상황에 맞는 AI 어시스턴트와 다양한 성격
- **친구 관리**: 실시간 상태와 함께 친구 추가 및 관리
- **그룹 채팅**: 그룹 대화 생성 및 관리

### 💳 결제 시스템 통합
- **토스페이먼츠 연동**: 안전한 결제 처리
- **단건결제**: 크레딧 및 서비스 일회성 결제
- **정기결제/구독**: 자동 갱신되는 구독 기반 결제
- **결제 내역 관리**: 완전한 결제 히스토리 및 거래 추적
- **환불 시스템**: 자동화된 환불 처리

### 🔐 인증 및 보안
- **Supabase 인증**: 이메일/비밀번호 및 OAuth (Google) 인증
- **프로필 관리**: 결제 정보가 포함된 사용자 프로필
- **행 수준 보안**: 데이터베이스 수준의 접근 제어
- **타입 안전성**: 엄격한 타입 검사가 적용된 완전한 TypeScript 구현

### 🎨 모던 UI/UX
- **반응형 디자인**: 적응형 레이아웃을 가진 모바일 우선 접근법
- **다크/라이트 모드**: 자동 테마 전환 지원
- **shadcn/ui 컴포넌트**: Radix UI 기반의 모던 컴포넌트 라이브러리
- **접근성**: WCAG 준수 인터페이스 컴포넌트

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** - 훅을 사용한 모던 UI 라이브러리
- **TypeScript** - 엄격한 검사가 적용된 타입 안전 JavaScript
- **Vite** - HMR을 지원하는 빠른 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - Radix UI 기반 모던 컴포넌트 라이브러리
- **Lucide React** - 아름다운 SVG 아이콘

### 백엔드 및 데이터베이스
- **Supabase** - PostgreSQL을 사용한 Backend-as-a-Service
- **실시간 구독** - 실시간 데이터 업데이트
- **행 수준 보안** - 안전한 데이터 접근 정책
- **인증** - 이메일/비밀번호 및 OAuth 제공업체

### 결제 시스템
- **토스페이먼츠** - 한국 결제 게이트웨이 통합
- **TossPayments SDK v2** - 최신 결제 위젯 및 API
- **Payment MCP** - 결제 작업을 위한 모델 컨텍스트 프로토콜
- **빌링 시스템** - 구독 및 일회성 결제 지원

### 개발 도구
- **ESLint** - 코드 린팅 및 품질 검사
- **React Query** - 서버 상태 관리
- **React Router** - 클라이언트 사이드 라우팅
- **React Hook Form** - 폼 상태 관리

## 📁 프로젝트 구조

```
howtalk/
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                # shadcn/ui 컴포넌트 (47개 컴포넌트)
│   │   ├── auth/              # 인증 컴포넌트
│   │   │   └── AuthPage.tsx   # 로그인/회원가입 인터페이스
│   │   ├── payment/           # 결제 시스템 컴포넌트
│   │   │   ├── ProductCard.tsx    # 제품 표시 및 구매
│   │   │   ├── PaymentHistory.tsx # 결제 거래 히스토리
│   │   │   └── PaymentSection.tsx # 메인 결제 관리
│   │   └── HowTalkMessenger.tsx   # 메인 메신저 인터페이스
│   ├── hooks/                 # 커스텀 React 훅
│   │   ├── useAuth.tsx        # 결제 정보가 포함된 인증
│   │   ├── usePayments.tsx    # 결제 작업
│   │   ├── useTossPayments.tsx # TossPayments 통합
│   │   ├── use-mobile.tsx     # 모바일 기기 감지
│   │   └── use-toast.ts       # 토스트 알림
│   ├── integrations/          # 외부 서비스 통합
│   │   └── supabase/          # Supabase 클라이언트 및 타입
│   ├── lib/                   # 유틸리티 라이브러리
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── PaymentSuccess.tsx # 결제 성공 처리
│   │   └── PaymentFail.tsx    # 결제 실패 처리
│   └── main.tsx              # 애플리케이션 진입점
├── supabase/                  # 데이터베이스 스키마 및 마이그레이션
└── public/                    # 정적 자산
```

## 🗄️ 데이터베이스 스키마

메시징 및 결제 시스템을 위한 11개의 주요 테이블:

### 메시징 시스템
1. **profiles** - 결제 데이터가 포함된 사용자 프로필 정보
2. **chat_rooms** - 채팅방 (개인/그룹)
3. **chat_participants** - 채팅방 멤버십
4. **messages** - AI 페르소나 지원이 포함된 메시지
5. **friendships** - 친구 관계 관리

### 결제 시스템
6. **products** - 사용 가능한 제품 및 서비스
7. **subscription_plans** - 구독 빌링 플랜
8. **payments** - 결제 거래 (일회성/구독)
9. **subscriptions** - 활성 구독 관리
10. **customer_payment_info** - 고객 빌링 정보
11. **refunds** - 환불 거래 기록

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정 (백엔드용)

### 설치

1. **저장소 클론**
   ```bash
   git clone https://github.com/yourusername/howtalk.git
   cd howtalk
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 설정**
   - Supabase 구성은 클라이언트에 미리 구성되어 있습니다
   - 개발용 TossPayments 테스트 키가 포함되어 있습니다
   - 프로덕션 배포를 위한 `.env` 파일 생성:
   ```bash
   VITE_TOSS_CLIENT_KEY=your_toss_client_key
   TOSS_SECRET_KEY=your_toss_secret_key
   ```

4. **개발 서버 시작**
   ```bash
   npm run dev
   ```

5. **브라우저에서 열기**
   - `http://localhost:8080`로 이동
   - 변경사항을 만들면 앱이 자동으로 다시 로드됩니다

### 프로덕션용 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 위치합니다.

## 🎨 UI 컴포넌트

이 프로젝트는 일관되고 접근 가능한 디자인 시스템을 위해 shadcn/ui 컴포넌트를 사용합니다:

- **47개 UI 컴포넌트** - 버튼, 입력, 대화상자 등
- **접근성 우선** - Radix UI 프리미티브 기반
- **커스터마이징 가능** - Tailwind CSS로 스타일링 완전 제어
- **다크 모드** - 자동 테마 전환 지원

## 🤖 AI 기능

- **대화 어시스턴스** - AI 기반 메시지 제안
- **페르소나 시스템** - 다양한 상황을 위한 AI 성격
- **스마트 응답** - 상황에 맞는 답장 추천
- **자연어** - 인간과 같은 대화 흐름

## 📱 반응형 디자인

- **모바일 우선** - 모바일 기기에 최적화
- **반응형 레이아웃** - 모든 화면 크기에 적응
- **터치 친화적** - 제스처 기반 상호작용
- **PWA 준비** - 프로그레시브 웹 앱 기능

## 🔐 보안

- **행 수준 보안** - 데이터베이스 수준 접근 제어
- **인증** - Supabase Auth를 통한 안전한 사용자 관리
- **타입 안전성** - TypeScript로 런타임 오류 방지
- **입력 검증** - 클라이언트 및 서버 사이드 검증

## 🚀 배포

이 앱은 모든 정적 호스팅 서비스에 배포할 수 있습니다:

- **Vercel** - React 앱에 권장
- **Netlify** - git 통합을 통한 간단한 배포
- **GitHub Pages** - 공개 저장소용 무료 호스팅
- **Supabase Hosting** - 백엔드와 통합

## 🤝 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 오픈 소스이며 [MIT 라이선스](LICENSE) 하에 사용할 수 있습니다.

## 🙏 감사의 말

- **shadcn/ui** - 아름다운 컴포넌트 라이브러리
- **Supabase** - 백엔드 인프라
- **Radix UI** - 접근 가능한 컴포넌트 프리미티브
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Lucide** - 아름다운 아이콘 라이브러리

---

**HowTalk 팀이 ❤️로 제작했습니다**
