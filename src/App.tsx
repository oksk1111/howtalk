import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AIChatProvider } from "@/hooks/useAIChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import NotFound from "./pages/NotFound";
import VariationsPage from "./pages/variations/index";
import FixRLSPolicies from "./components/FixRLSPolicies";

const queryClient = new QueryClient();

// Auth Guard 컴포넌트
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [oauthProcessing, setOauthProcessing] = React.useState(false);
  
  // 세션 상태 변화 로깅
  React.useEffect(() => {
    console.log('🛡️ AuthGuard: 상태 변화', { hasSession: !!session, loading, oauthProcessing });
  }, [session, loading, oauthProcessing]);
  
  React.useEffect(() => {
    // OAuth 콜백 확인
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = window.location.hash;
    const hasOAuthCallback = urlParams.get('access_token') || 
                            fragment.includes('access_token') ||
                            urlParams.get('code') ||
                            fragment.includes('code');
    
    if (hasOAuthCallback && !session) {
      console.log('🔗 AuthGuard: OAuth 콜백 감지, 처리 대기 중...');
      setOauthProcessing(true);
      
      // 10초 후에도 세션이 없으면 OAuth 처리 완료로 간주
      const timeout = setTimeout(() => {
        console.log('⏰ AuthGuard: OAuth 처리 타임아웃');
        setOauthProcessing(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    } else if (session && oauthProcessing) {
      // 세션이 설정되면 즉시 OAuth 처리 완료
      console.log('✅ AuthGuard: 세션 확인됨, OAuth 처리 완료');
      setOauthProcessing(false);
    } else {
      setOauthProcessing(false);
    }
  }, [session, oauthProcessing]);
  
  // OAuth 콜백 처리 중이거나 로딩 중
  if (loading || oauthProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{oauthProcessing ? 'Google 로그인 처리 중...' : '로딩 중...'}</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    console.log('🚫 AuthGuard: 세션 없음, /auth로 리다이렉트');
    return <Navigate to="/auth" replace />;
  }
  
  console.log('✅ AuthGuard: 세션 확인됨, 보호된 컨텐츠 표시');
  return <>{children}</>;
};

// 메인 라우터 컴포넌트
const AppRouter = () => {
  const { session, loading } = useAuth();
  
  useEffect(() => {
    console.log('🔍 App: 세션 상태 확인', { session: !!session, loading });
    
    // OAuth 콜백 확인 및 처리
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const fragment = window.location.hash;
      
      if (accessToken || fragment.includes('access_token')) {
        console.log('🔗 App: OAuth 콜백 감지됨', { 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          fragment,
          url: window.location.href 
        });
        
        // Supabase가 토큰을 처리할 시간을 충분히 준 후 URL 정리
        setTimeout(() => {
          if (window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            console.log('🧹 App: URL 정리 (지연됨)', { from: window.location.href, to: cleanUrl });
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }, 2000); // 2초 후에 URL 정리
      }
    };
    
    handleOAuthCallback();
  }, [session, loading]);
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />
      <Route path="/fix-rls" element={<FixRLSPolicies />} />
      
      {/* 인증이 필요한 페이지들 */}
      <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
      <Route path="/variations" element={<AuthGuard><VariationsPage /></AuthGuard>} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AIChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </AIChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
