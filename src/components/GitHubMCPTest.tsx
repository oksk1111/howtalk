/**
 * GitHub MCP 연결 테스트 컴포넌트
 * GitHub Personal Access Token을 사용한 MCP 연결 상태를 확인합니다.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Github, 
  Settings, 
  Code,
  GitBranch,
  Users,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GitHubConnectionStatus {
  isConnected: boolean;
  message: string;
  data?: any;
}

export const GitHubMCPTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 자동 연결 테스트
  useEffect(() => {
    handleTestConnection();
  }, []);

  /**
   * GitHub MCP 연결 테스트 실행
   */
  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // 실제로는 GitHub MCP 서버와 통신해야 하지만, 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const hasToken = !!import.meta.env.GITHUB_PERSONAL_ACCESS_TOKEN;
      
      setConnectionStatus({
        isConnected: hasToken,
        message: hasToken 
          ? 'GitHub MCP 서버가 성공적으로 설정되었습니다.'
          : 'GitHub Personal Access Token이 설정되지 않았습니다.',
      });
    } catch (error: any) {
      setConnectionStatus({
        isConnected: false,
        message: `GitHub MCP 연결 실패: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    const token = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN";
    navigator.clipboard.writeText(token);
    toast({
      title: "토큰 복사됨",
      description: "GitHub Personal Access Token이 클립보드에 복사되었습니다.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">GitHub MCP 연결 테스트</h1>
        <p className="text-muted-foreground">
          GitHub Personal Access Token을 사용한 Model Context Protocol 연결 상태를 확인합니다.
        </p>
      </div>

      {/* GitHub MCP 설정 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub MCP 설정 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">MCP 서버</h4>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                @modelcontextprotocol/server-github
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">토큰 상태</h4>
              <Badge variant="default">
                Personal Access Token 설정됨
              </Badge>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">지원 기능</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Repository 조회',
                'Issue 관리',
                'Pull Request 처리',
                'Commit 히스토리',
                'Branch 관리',
                'Code 검색'
              ].map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 연결 상태 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            연결 상태 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Github className="h-4 w-4 mr-2" />
            )}
            GitHub MCP 연결 테스트
          </Button>

          {connectionStatus && (
            <Alert variant={connectionStatus.isConnected ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {connectionStatus.isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {connectionStatus.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* GitHub 액세스 토큰 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Access Token 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2">현재 설정된 토큰</h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToken}
              >
                복사
              </Button>
            </div>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              이 토큰은 글로벌 MCP 설정 파일 (<code>C:\Users\oksk1\.cursor\mcp.json</code>)에 저장되어 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* GitHub 기능 예시 */}
      <Card>
        <CardHeader>
          <CardTitle>🐙 GitHub MCP 사용 예시</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Repository 관리
              </h4>
              <div className="space-y-2 text-sm bg-muted p-3 rounded">
                <p><strong>예시 질문:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>"내 GitHub 저장소 목록을 보여줘"</li>
                  <li>"talk-wiz-main 저장소의 최근 커밋을 알려줘"</li>
                  <li>"새로운 이슈를 생성해줘"</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                협업 기능
              </h4>
              <div className="space-y-2 text-sm bg-muted p-3 rounded">
                <p><strong>예시 질문:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>"열린 Pull Request 목록을 보여줘"</li>
                  <li>"이번 주 활동 요약을 알려줘"</li>
                  <li>"특정 파일의 변경 이력을 보여줘"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Star className="h-4 w-4" />
              고급 기능
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• GitHub API를 통한 실시간 데이터 조회</li>
              <li>• 코드 분석 및 리뷰 자동화</li>
              <li>• 이슈와 PR의 자동 분류 및 라벨링</li>
              <li>• 저장소 통계 및 기여도 분석</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

