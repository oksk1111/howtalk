import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    console.log('🔒 Index: 로그아웃 버튼 클릭됨');
    try {
      console.log('🔄 Index: 직접 Supabase 로그아웃 호출...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Index: 직접 로그아웃 실패:', error);
        toast({
          title: "로그아웃 실패",
          description: error.message || "로그아웃 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Index: 직접 로그아웃 성공 - 리다이렉트 처리');
        // 성공 시 바로 인증 페이지로 이동
        window.location.href = '/auth';
      }
    } catch (error: any) {
      console.error('❌ Index: 로그아웃 예외:', error);
      // 예외 발생 시에도 강제 리다이렉트
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    console.log('🏠 Index: 상태 변경', { 
      loading, 
      hasUser: !!user, 
      hasProfile: !!profile 
    });
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  안녕하세요, {profile?.display_name || user?.email?.split('@')[0] || '사용자'}님!
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 메인 탭 네비게이션 */}
        <Tabs defaultValue="messenger" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="messenger" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              메신저
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              결제
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              친구 관리
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              디버그
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messenger" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm">
              <MessengerApp />
            </div>
          </TabsContent>

          <TabsContent value="payment" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm">
              <PaymentSection />
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-0">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">친구 추가</h2>
                <SimpleFriendAdd />
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">친구 추가 테스트</h2>
                <SimpleFriendAddTest />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="mt-0">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">연결 테스트</h2>
                <ConnectionTest />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Supabase 디버그</h2>
                <DebugSupabase />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">데이터베이스 스키마</h2>
                <DatabaseSchemaChecker />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">데이터베이스 관리</h2>
                <DatabaseManager />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Supabase 빠른 액세스</h2>
                <SupabaseQuickAccess />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
