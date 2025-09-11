# PowerShell 스크립트: Supabase 환경 변수 설정
# 사용법: .\scripts\setup-env.ps1

Write-Host "=== Supabase 환경 변수 설정 ===" -ForegroundColor Green

# 환경 변수 설정
$env:VITE_SUPABASE_URL = "YOUR_SUPABASE_URL"
$env:VITE_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
$env:SUPABASE_ACCESS_TOKEN = "YOUR_SUPABASE_ACCESS_TOKEN"

Write-Host "환경 변수가 설정되었습니다:" -ForegroundColor Yellow
Write-Host "- VITE_SUPABASE_URL: $env:VITE_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "- VITE_SUPABASE_ANON_KEY: $($env:VITE_SUPABASE_ANON_KEY.Substring(0,20))..." -ForegroundColor Cyan
Write-Host "- SUPABASE_ACCESS_TOKEN: $($env:SUPABASE_ACCESS_TOKEN.Substring(0,10))..." -ForegroundColor Cyan

Write-Host "`n이제 다음 명령어로 개발 서버를 실행하세요:" -ForegroundColor Green
Write-Host "npm run dev" -ForegroundColor White

# 선택적으로 개발 서버 자동 실행
$autoStart = Read-Host "`n개발 서버를 자동으로 시작하시겠습니까? (y/n)"
if ($autoStart -eq "y" -or $autoStart -eq "Y") {
    Write-Host "개발 서버를 시작합니다..." -ForegroundColor Green
    npm run dev
}

