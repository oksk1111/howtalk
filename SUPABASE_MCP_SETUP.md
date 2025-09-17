# Supabase MCP 설정 가이드

## 현재 MCP 설정

프로젝트에 설정된 Supabase MCP 정보:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=ufmymlvaqzfgasblvnaa"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_9593f4f2bf4d028a08796374774881191f124974"
      }
    }
  }
}
```

## 프로젝트 정보

- **Project Reference**: `ufmymlvaqzfgasblvnaa`
- **Supabase URL**: `https://ufmymlvaqzfgasblvnaa.supabase.co`
- **Access Token**: `sbp_9593f4f2bf4d028a08796374774881191f124974`

## 빠른 접근 링크

- [Supabase 대시보드](https://supabase.com/dashboard/project/ufmymlvaqzfgasblvnaa)
- [SQL 에디터](https://supabase.com/dashboard/project/ufmymlvaqzfgasblvnaa/sql/new)
- [테이블 에디터](https://supabase.com/dashboard/project/ufmymlvaqzfgasblvnaa/editor)

## 데이터베이스 재구성 작업 순서

### 1. 현재 상태 확인
웹앱의 "DB 디버그" 탭에서 "현재 테이블 확인" 버튼을 클릭하여 기존 테이블 구조를 확인합니다.

### 2. 기존 테이블 삭제
Supabase SQL 에디터에서 삭제 SQL을 실행하여 모든 기존 테이블을 제거합니다.

### 3. 새로운 테이블 생성
메신저 앱에 최적화된 새로운 테이블 스키마를 생성합니다.

### 4. 웹앱 테스트
친구 추가 기능 등이 정상적으로 작동하는지 확인합니다.

## 주의사항

- 모든 작업은 Supabase API를 통해 실행됩니다 (Docker 불필요)
- 테이블 삭제 작업은 되돌릴 수 없습니다
- RLS 정책은 개발 단계에서 모든 접근을 허용하도록 설정되어 있습니다
- 프로덕션 환경에서는 보안 정책을 강화해야 합니다
