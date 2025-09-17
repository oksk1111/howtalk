import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase';
import MessengerApp from '@/components/MessengerApp';
import PaymentSection from '@/components/payment/PaymentSection';
import ConnectionTest from '@/components/ConnectionTest';
import { SimpleFriendAdd } from '@/components/SimpleFriendAdd';
import { SimpleFriendAddTest } from '@/components/SimpleFriendAddTest';
import { DebugSupabase } from '@/components/DebugSupabase';
import { DatabaseSchemaChecker } from '@/components/DatabaseSchemaChecker';
import { DatabaseManager } from '@/components/DatabaseManager';
import { SupabaseQuickAccess } from '@/components/SupabaseQuickAccess';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CreditCard, UserPlus, Bug, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    console.log('🔒 Index: 로그아웃 버튼 클릭됨');
    try {
      console.log('� Index: Supabase 로그아웃 호출...');
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ Index: 로그아웃 실패:', error);
        toast({
          title: "로그아웃 실패",
          description: error.message || "로그아웃 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Index: 로그아웃 성공 - useAuth에서 자동 리다이렉트 처리됨');
      }
    } catch (error: any) {
      console.error('❌ Index: 로그아웃 예외:', error);
      // 예외 발생 시 강제 리다이렉트
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    console.log('🏠 Index: 상태 변경', { 
      loading, 
      hasUser: !!user, 
      userId: user?.id 
    });
    
    if (!loading && !user) {
      console.log('🔄 Index: 인증 페이지로 리다이렉트');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg text-muted-foreground">연결 중...</p>
          <p className="text-sm text-muted-foreground mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <MessageSquare className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">HowTalk</h1>
          <p className="text-xl text-muted-foreground">AI 메신저와 결제 시스템이 통합된 플랫폼</p>
          
          {/* 네트워크 상태 확인 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="text-yellow-800">
              ⚠️ 현재 Supabase 서버에 연결할 수 없습니다.<br/>
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
              로그인 페이지로 이동
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="lg" 
              className="w-full"
            >
              새로고침
            </Button>
          </div>
          
          {/* 연결 테스트 컴포넌트 */}
          <div className="mt-6">
            <ConnectionTest />
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>오프라인 모드에서는 일부 기능이 제한될 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 헤더 */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">HowTalk</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">
                {profile?.display_name || user?.email?.split('@')[0] || '사용자'}님
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="messenger" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messenger" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            메신저
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            친구 테스트
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            DB 디버그
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            결제
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messenger" className="mt-0">
          <MessengerApp />
        </TabsContent>
        
        <TabsContent value="test" className="mt-0 p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">친구 추가 테스트</h2>
            <div className="grid gap-6">
              <SimpleFriendAddTest />
              <SimpleFriendAdd />
            </div>
            <div className="mt-6">
              <ConnectionTest />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="debug" className="mt-0 p-4">
          <div className="space-y-6">
            <SupabaseQuickAccess />
            <DatabaseManager />
            <DatabaseSchemaChecker />
            <DebugSupabase />
          </div>
        </TabsContent>
        
        <TabsContent value="payment" className="mt-0">
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
