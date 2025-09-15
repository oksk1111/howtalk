import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HowTalkMessenger } from '@/components/HowTalkMessenger';
import EnhancedAIMessenger from '@/components/EnhancedAIMessenger';
import PaymentSection from '@/components/payment/PaymentSection';
import ConnectionTest from '@/components/ConnectionTest';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles, CreditCard } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
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
      <Tabs defaultValue="talkwiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="talkwiz" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            HowTalk
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Enhanced AI
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            결제 관리
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="talkwiz" className="mt-0">
          <HowTalkMessenger />
        </TabsContent>
        
        <TabsContent value="enhanced" className="mt-0">
          <EnhancedAIMessenger />
        </TabsContent>
        
        <TabsContent value="payment" className="mt-0">
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
