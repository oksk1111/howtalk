import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Plus, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MessengerApp = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다."
      });
    }
  };

  return (
    <div className="h-screen bg-background flex">
      {/* 사이드바 */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">AI 메신저</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              안녕하세요, {user?.email?.split('@')[0]}님!
            </p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b">
          <Button
            variant={activeTab === 'chats' ? 'secondary' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            채팅
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'secondary' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('friends')}
          >
            <Users className="h-4 w-4 mr-2" />
            친구
          </Button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'chats' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">채팅방</h2>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  새 채팅
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 채팅방이 없습니다</p>
                <p className="text-sm">친구와 대화를 시작해보세요!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">친구 목록</h2>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  친구 추가
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 친구가 없습니다</p>
                <p className="text-sm">이메일로 친구를 초대해보세요!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI 메신저에 오신 것을 환영합니다!</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              AI가 도와주는 스마트한 메신저입니다.<br />
              친구를 추가하고 대화를 시작해보세요.
            </p>
            <div className="space-y-3">
              <Card className="max-w-md mx-auto text-left">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🤖 AI 기능
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 대화 상황에 맞는 답변 제안</li>
                    <li>• 상황별 페르소나 설정</li>
                    <li>• 자연스러운 대화 도우미</li>
                  </ul>
                </CardContent>
              </Card>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary">소개팅 모드</Badge>
                <Badge variant="secondary">친구 모드</Badge>
                <Badge variant="secondary">비즈니스 모드</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessengerApp;