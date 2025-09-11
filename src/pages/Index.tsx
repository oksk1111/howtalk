import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TalkWizMessenger } from '@/components/TalkWizMessenger';
import EnhancedAIMessenger from '@/components/EnhancedAIMessenger';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles } from 'lucide-react';

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
          <p className="text-lg text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <MessageSquare className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">AI 메신저</h1>
          <p className="text-xl text-muted-foreground">AI가 도와주는 스마트한 메신저</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            시작하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="talkwiz" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="talkwiz" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            TalkWiz
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Enhanced AI
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="talkwiz" className="mt-0">
          <TalkWizMessenger />
        </TabsContent>
        
        <TabsContent value="enhanced" className="mt-0">
          <EnhancedAIMessenger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
