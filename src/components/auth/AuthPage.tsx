import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, Chrome, TestTube } from 'lucide-react';

// 개발 환경 체크 함수
const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// 테스트 사용자 생성/로그인 함수
const createTestUser = async (authContext: any) => {
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  const testDisplayName = 'Test User';
  
  try {
    // 먼저 로그인 시도
    const signInResult = await authContext.signIn(testEmail, testPassword);
    
    if (!signInResult.error) {
      return { success: true, wasExisting: true };
    }
    
    // 로그인 실패시 회원가입 시도
    const signUpResult = await authContext.signUp(testEmail, testPassword, testDisplayName);
    
    if (!signUpResult.error) {
      // 회원가입 후 바로 로그인 시도
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      const postSignUpSignIn = await authContext.signIn(testEmail, testPassword);
      
      if (!postSignUpSignIn.error) {
        return { success: true, wasExisting: false };
      }
    }
    
    return { 
      success: false, 
      error: signUpResult.error?.message || '테스트 계정 생성에 실패했습니다.' 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, loading, session } = useAuth();
  const { toast } = useToast();

  // 세션이 있으면 메인 페이지로 리다이렉트
  React.useEffect(() => {
    if (session) {
      console.log('🔄 AuthPage: 세션 감지됨, 메인 페이지로 이동');
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  // 폼 상태 관리
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  const [signUpForm, setSignUpForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false
  });

  // 로그인 처리
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInForm.email || !signInForm.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signIn(signInForm.email, signInForm.password);
    
    if (error) {
      toast({
        title: "로그인 실패",
        description: error.message === 'Invalid login credentials' 
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "로그인 성공",
        description: "환영합니다!"
      });
      // useEffect에서 세션 감지로 자동 리다이렉트됨
    }
  };

  // 회원가입 처리
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!signUpForm.displayName || !signUpForm.email || !signUpForm.password) {
      toast({
        title: "입력 오류",
        description: "모든 필수 정보를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    if (signUpForm.password.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive"
      });
      return;
    }

    if (!signUpForm.termsAgreed || !signUpForm.privacyAgreed) {
      toast({
        title: "약관 동의 필요",
        description: "이용약관 및 개인정보처리방침에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(
      signUpForm.email, 
      signUpForm.password, 
      signUpForm.displayName
    );
    
    if (error) {
      toast({
        title: "회원가입 실패",
        description: error.message === 'User already registered'
          ? "이미 가입된 이메일입니다."
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "회원가입 성공",
        description: "이메일 인증 후 로그인해주세요."
      });
      // 회원가입 후 로그인 탭으로 이동
      setSignInForm({ email: signUpForm.email, password: '' });
    }
  };

  // 구글 로그인 처리
  const handleGoogleSignIn = async () => {
    console.log('🎯 AuthPage: 구글 로그인 버튼 클릭');
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('❌ AuthPage: 구글 로그인 에러:', error);
        toast({
          title: "구글 로그인 실패",
          description: error.message || "구글 로그인 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        console.log('✅ AuthPage: 구글 로그인 리다이렉트 시작');
        // OAuth 리다이렉트가 시작되므로 추가 처리는 필요없음
      }
    } catch (exception: any) {
      console.error('💥 AuthPage: 구글 로그인 예외:', exception);
      toast({
        title: "구글 로그인 오류",
        description: "예상치 못한 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 테스트 계정 로그인 (개발 환경에서만)
  const handleTestUserLogin = async () => {
    try {
      const result = await createTestUser({ signIn, signUp });
      
      if (result.success) {
        toast({
          title: "테스트 계정 로그인 성공",
          description: result.wasExisting 
            ? "기존 테스트 계정으로 로그인했습니다."
            : "새 테스트 계정을 생성하여 로그인했습니다."
        });
        // useEffect에서 세션 감지로 자동 리다이렉트됨
      } else {
        toast({
          title: "테스트 계정 로그인 실패",
          description: result.error || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "테스트 계정 오류",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">HowTalk</CardTitle>
          <CardDescription>
            AI 메신저와 결제 시스템이 통합된 플랫폼
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            {/* 로그인 탭 */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({ 
                        ...prev, 
                        email: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      className="pl-10"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({ 
                        ...prev, 
                        password: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
              
              <div className="mt-4 space-y-2">
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Google로 로그인
                </Button>
                
                {/* 개발 환경에서만 테스트 계정 버튼 표시 */}
                {isDevelopment() && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleTestUserLogin}
                    disabled={loading}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    테스트 계정으로 로그인
                  </Button>
                )}
              </div>
            </TabsContent>
            
            {/* 회원가입 탭 */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="pl-10"
                      value={signUpForm.displayName}
                      onChange={(e) => setSignUpForm(prev => ({ 
                        ...prev, 
                        displayName: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm(prev => ({ 
                        ...prev, 
                        email: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="비밀번호를 입력하세요 (최소 6자)"
                      className="pl-10"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm(prev => ({ 
                        ...prev, 
                        password: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="pl-10"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                {/* 약관 동의 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms-agreement"
                      checked={signUpForm.termsAgreed}
                      onCheckedChange={(checked) => 
                        setSignUpForm(prev => ({ 
                          ...prev, 
                          termsAgreed: checked as boolean 
                        }))
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="terms-agreement" className="text-sm">
                      <span className="text-destructive">*</span> 이용약관에 동의합니다
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy-agreement"
                      checked={signUpForm.privacyAgreed}
                      onCheckedChange={(checked) => 
                        setSignUpForm(prev => ({ 
                          ...prev, 
                          privacyAgreed: checked as boolean 
                        }))
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="privacy-agreement" className="text-sm">
                      <span className="text-destructive">*</span> 개인정보처리방침에 동의합니다
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing-agreement"
                      checked={signUpForm.marketingAgreed}
                      onCheckedChange={(checked) => 
                        setSignUpForm(prev => ({ 
                          ...prev, 
                          marketingAgreed: checked as boolean 
                        }))
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="marketing-agreement" className="text-sm">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
              
              <div className="mt-4">
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Google로 가입하기
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
