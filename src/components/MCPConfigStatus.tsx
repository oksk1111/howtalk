/**
 * MCP 설정 상태 확인 컴포넌트
 * 글로벌 및 프로젝트별 MCP 설정 파일 상태를 표시합니다.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Settings, 
  FolderOpen,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MCPConfig {
  location: string;
  exists: boolean;
  hasSupabaseServer: boolean;
  hasGithubServer: boolean;
  servers: {
    supabase?: {
      serverName: string;
      url: string;
      hasToken: boolean;
    };
    github?: {
      serverName: string;
      hasToken: boolean;
    };
  };
}

export const MCPConfigStatus: React.FC = () => {
  const [globalConfig, setGlobalConfig] = useState<MCPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 설정 파일 상태 확인 (시뮬레이션)
  useEffect(() => {
    checkConfigs();
  }, []);

  const checkConfigs = async () => {
    setIsLoading(true);
    
    // 실제로는 파일 시스템에 접근할 수 없으므로 시뮬레이션
    setTimeout(() => {
      setGlobalConfig({
        location: 'C:\\Users\\oksk1\\.cursor\\mcp.json',
        exists: true,
        hasSupabaseServer: true,
        hasGithubServer: true,
        servers: {
          supabase: {
            serverName: 'supabase',
            url: 'https://jdkornpmgusbxsnxcmub.supabase.co',
            hasToken: true
          },
          github: {
            serverName: 'github',
            hasToken: true
          }
        }
      });

      setIsLoading(false);
    }, 1000);
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({
      title: "경로 복사됨",
      description: `${path} 경로가 클립보드에 복사되었습니다.`,
    });
  };

  const copyConfig = () => {
    const config = {
      "mcpServers": {
        "supabase": {
          "command": "npx",
          "args": [
            "-y",
            "@supabase/mcp-server-supabase@latest",
            "--project-ref=jdkornpmgusbxsnxcmub"
          ],
          "env": {
            "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_ACCESS_TOKEN"
          }
        },
        "github": {
          "command": "npx",
          "args": [
            "-y",
            "@modelcontextprotocol/server-github"
          ],
          "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
          }
        }
      }
    };

    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({
      title: "설정 복사됨",
      description: "Supabase와 GitHub를 포함한 글로벌 MCP 설정이 클립보드에 복사되었습니다.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">글로벌 MCP 설정</h1>
        <p className="text-muted-foreground">
          Cursor IDE의 Model Context Protocol 글로벌 설정을 확인합니다.
        </p>
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-center">
        <Button 
          onClick={checkConfigs}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          설정 상태 새로고침
        </Button>
      </div>

      {/* 글로벌 MCP 설정 카드 */}
      <div className="max-w-2xl mx-auto">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">글로벌 MCP 설정</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Cursor IDE 전체에서 사용하는 MCP 서버 설정
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 파일 경로 */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                파일 경로
              </h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  C:\Users\oksk1\.cursor\mcp.json
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyPath('C:\\Users\\oksk1\\.cursor\\mcp.json')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 설정 상태 */}
            <div>
              <h4 className="font-medium mb-3">설정 상태</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">파일 존재</span>
                  {globalConfig?.exists ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      존재함
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      없음
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase 서버</span>
                  {globalConfig?.hasSupabaseServer ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      설정됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      미설정
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">GitHub 서버</span>
                  {globalConfig?.hasGithubServer ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      설정됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      미설정
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase 토큰</span>
                  {globalConfig?.servers?.supabase?.hasToken ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      설정됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      미설정
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">GitHub 토큰</span>
                  {globalConfig?.servers?.github?.hasToken ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      설정됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      미설정
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 서버 정보 */}
            {(globalConfig?.hasSupabaseServer || globalConfig?.hasGithubServer) && (
              <div>
                <h4 className="font-medium mb-2">서버 정보</h4>
                <div className="space-y-3">
                  {globalConfig?.servers?.supabase && (
                    <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                      <div className="font-medium text-blue-600 dark:text-blue-400 mb-2">🗄️ Supabase MCP 서버</div>
                      <div><strong>서버명:</strong> {globalConfig.servers.supabase.serverName}</div>
                      <div><strong>프로젝트:</strong> jdkornpmgusbxsnxcmub</div>
                      <div><strong>명령어:</strong> npx -y @supabase/mcp-server-supabase@latest --project-ref=jdkornpmgusbxsnxcmub</div>
                    </div>
                  )}
                  
                  {globalConfig?.servers?.github && (
                    <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                      <div className="font-medium text-gray-600 dark:text-gray-400 mb-2">🐙 GitHub MCP 서버</div>
                      <div><strong>서버명:</strong> {globalConfig.servers.github.serverName}</div>
                      <div><strong>플랫폼:</strong> GitHub API</div>
                      <div><strong>명령어:</strong> npx -y @modelcontextprotocol/server-github</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 설정 복사 버튼 */}
            <Button
              onClick={copyConfig}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              설정 JSON 복사
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 설정 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 글로벌 MCP 설정 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>글로벌 설정:</strong> 한 번 설정으로 모든 Cursor 프로젝트에서 Supabase와 GitHub MCP 서버에 접근할 수 있습니다.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ 글로벌 설정의 장점</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>모든 Cursor 프로젝트에서 사용 가능</li>
                <li>한 번 설정으로 계속 사용</li>
                <li>Cursor 재시작 후 자동 적용</li>
                <li>중앙 집중식 관리</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 설정 요구사항</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Node.js 및 npm 설치 필요</li>
                <li>@supabase/mcp-server 패키지 자동 설치</li>
                <li>@modelcontextprotocol/server-github 패키지 자동 설치</li>
                <li>Supabase Access Token 필요</li>
                <li>GitHub Personal Access Token 필요</li>
                <li>Cursor IDE 재시작 필요</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-2">📝 설정 적용 방법</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>위의 "설정 JSON 복사" 버튼으로 설정을 복사</li>
              <li><code>C:\Users\oksk1\.cursor\mcp.json</code> 파일 생성</li>
              <li>복사한 JSON 내용을 파일에 붙여넣기</li>
              <li>Cursor IDE 완전 재시작</li>
              <li>Cursor 채팅에서 Supabase 데이터 접근 테스트</li>
            </ol>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h4 className="font-medium mb-2">💡 사용 팁</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2 text-blue-600 dark:text-blue-400">🗄️ Supabase MCP</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>"Supabase 데이터베이스의 테이블 목록을 보여줘"</li>
                  <li>데이터베이스 스키마, 데이터 조회, 분석</li>
                  <li>SQL 쿼리 생성 및 실행 도움</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 text-gray-600 dark:text-gray-400">🐙 GitHub MCP</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>"내 GitHub 저장소 목록을 보여줘"</li>
                  <li>이슈, PR, 커밋 히스토리 조회</li>
                  <li>코드 분석 및 저장소 관리</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
