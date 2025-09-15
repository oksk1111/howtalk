import { supabase } from '@/integrations/supabase/client';

/**
 * 개발용 테스트 계정 생성 및 로그인
 */
export const createTestUser = async () => {
  try {
    const testEmail = 'test@howtalk.dev';
    const testPassword = 'testpassword123!';
    
    console.log('테스트 계정 생성 시도...');
    
    // 1. 먼저 기존 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('이미 로그인된 사용자 있음:', session.user.email);
      return { success: true, user: session.user, wasExisting: true };
    }
    
    // 2. 테스트 계정으로 로그인 시도
    console.log('기존 테스트 계정으로 로그인 시도...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInData.user && !signInError) {
      console.log('기존 테스트 계정 로그인 성공');
      return { success: true, user: signInData.user, wasExisting: true };
    }
    
    // 3. 로그인 실패시 새 계정 생성
    console.log('새 테스트 계정 생성 중...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User',
        }
      }
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    console.log('테스트 계정 생성 성공');
    return { 
      success: true, 
      user: signUpData.user, 
      wasExisting: false,
      needsConfirmation: !signUpData.session // 이메일 확인이 필요한 경우
    };
    
  } catch (error: any) {
    console.error('테스트 계정 생성/로그인 실패:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/**
 * 개발 환경 감지
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

/**
 * RLS 정책 우회를 위한 서비스 키 체크 (서버에서만)
 */
export const checkServiceAccess = async () => {
  try {
    // 간단한 프로필 조회로 접근 권한 테스트
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    return { canAccess: !error, error };
  } catch (error: any) {
    return { canAccess: false, error: error.message };
  }
};
