import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// 타입 정의
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 프로필 가져오기
  const fetchUserData = async (userId: string) => {
    try {
      console.log('사용자 데이터 가져오기 시작:', userId);
      
      // 프로필 정보 가져오기
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('프로필 가져오기 실패:', profileError);
        // 프로필이 없는 경우는 정상적인 상황일 수 있음 (새 사용자)
        if (profileError.code !== 'PGRST116') {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        console.log('프로필 로드 완료:', profileData);
      }
    } catch (error) {
      console.error('사용자 데이터 가져오기 실패:', error);
      // 에러가 발생해도 로딩 상태는 해제해야 함
    }
  };

  // 사용자 데이터 새로고침
  const refreshUserData = async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initializationComplete = false;
    
    console.log('🔧 useAuth 초기화 시작');

    // 페이지 로드 시 즉시 세션 확인 (OAuth 콜백 처리를 위해)
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ 초기 세션 확인 실패:', error);
        } else if (session) {
          console.log('✅ 초기 세션 발견:', session.user.id);
          setSession(session);
          setUser(session.user);
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error('❌ 초기 세션 확인 예외:', error);
      }
    };
    
    // OAuth 콜백이 있는 경우 즉시 세션 확인
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = window.location.hash;
    const hasOAuthCallback = urlParams.get('access_token') || 
                            fragment.includes('access_token') ||
                            urlParams.get('code') ||
                            fragment.includes('code');
    
    if (hasOAuthCallback) {
      console.log('🚀 OAuth 콜백 감지 - 반복적으로 세션 확인 시작');
      
      // OAuth 토큰이 있을 때 반복적으로 세션 확인 (최대 10초)
      let attempts = 0;
      const maxAttempts = 20; // 500ms * 20 = 10초
      
      const checkSessionRepeatedly = async () => {
        attempts++;
        console.log(`🔍 세션 확인 시도 ${attempts}/${maxAttempts}`);
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && session.user) {
            console.log('✅ OAuth 세션 확인 성공:', session.user.id);
            setSession(session);
            setUser(session.user);
            await fetchUserData(session.user.id);
            return true; // 성공
          } else if (error) {
            console.error('❌ 세션 확인 에러:', error);
          } else {
            console.log('⏳ 세션 아직 없음, 계속 시도...');
          }
        } catch (error) {
          console.error('❌ 세션 확인 예외:', error);
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkSessionRepeatedly, 500);
        } else {
          console.log('⏰ 세션 확인 최대 시도 횟수 초과');
        }
        return false;
      };
      
      checkSessionRepeatedly();
    }

    // 인증 상태 변경 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 인증 상태 변경:', event, session?.user?.id);
        
        if (!isMounted) return;
        
        // 첫 번째 이벤트에서만 로딩 해제
        if (!initializationComplete) {
          setLoading(false);
          initializationComplete = true;
          console.log('✅ 첫 인증 이벤트로 초기화 완료');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('📊 사용자 데이터 로드:', session.user.id);
          await fetchUserData(session.user.id);
          
          // Google 로그인 등 OAuth 로그인 시 프로필이 없으면 생성
          if (event === 'SIGNED_IN' && session.user) {
            try {
              console.log('🔍 OAuth 프로필 확인 중...', session.user.user_metadata);
              
              const { data: existingProfile, error: checkError } = await supabase
                .from('profiles')
                .select('id, user_id')
                .eq('user_id', session.user.id as any)
                .maybeSingle();
              
              console.log('📋 기존 프로필 조회 결과:', { existingProfile, checkError });
              
              if (!existingProfile && !checkError) {
                console.log('🆕 OAuth 로그인 - 새 프로필 생성 시작');
                
                const displayName = session.user.user_metadata?.full_name || 
                                  session.user.user_metadata?.name || 
                                  session.user.user_metadata?.display_name ||
                                  session.user.email?.split('@')[0] || 
                                  'Google 사용자';
                
                const profileData = {
                  user_id: session.user.id,
                  email: session.user.email || '',
                  display_name: displayName,
                  avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
                  status: 'active'
                };
                
                console.log('📝 생성할 프로필 데이터:', profileData);
                
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert(profileData as any);
                
                if (profileError) {
                  console.error('❌ 프로필 생성 실패:', profileError);
                } else {
                  console.log('✅ OAuth 프로필 생성 완료');
                  // 프로필 생성 후 다시 로드
                  setTimeout(() => fetchUserData(session.user.id), 500);
                }
              } else if (existingProfile) {
                console.log('✅ 기존 프로필 발견:', existingProfile.id);
              }
            } catch (error) {
              console.error('❌ OAuth 프로필 처리 실패:', error);
            }
          }
        } else {
          console.log('📝 세션 없음');
          setProfile(null);
        }
        
        // 로그아웃 감지 시 리다이렉트
        if (event === 'SIGNED_OUT') {
          console.log('🔒 useAuth: 로그아웃 감지, 인증 페이지로 리다이렉트');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        
        // 로그인 성공 시 메인 페이지로 리다이렉트 (모든 로그인 유형)
        if (event === 'SIGNED_IN' && session?.user) {
          const currentPath = window.location.pathname;
          console.log('🔍 useAuth: 로그인 후 현재 경로 확인:', { currentPath, event, userId: session.user.id });
          
          if (currentPath === '/auth') {
            console.log('🏠 useAuth: 로그인 성공, 메인 페이지로 이동');
            setTimeout(() => {
              window.location.href = '/';
            }, 500); // 프로필 생성 완료를 위한 약간의 대기
          } else {
            console.log('🚫 useAuth: 현재 경로가 /auth가 아니므로 리다이렉트하지 않음');
          }
        }
      }
    );

    // 3초 후에도 초기화가 안 되었다면 강제로 로딩 해제
    const fallbackTimeout = setTimeout(() => {
      if (!initializationComplete && isMounted) {
        console.log('⏰ 타임아웃으로 인한 강제 초기화 완료');
        setLoading(false);
        initializationComplete = true;
      }
    }, 3000);

    return () => {
      isMounted = false;
      initializationComplete = true;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || ''
        }
      }
    });

    // 회원가입 성공 시 프로필 정보 업데이트 (간소화됨)
    if (!error && data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: displayName || ''
          } as any)
          .eq('user_id', data.user.id as any);

        if (profileError) {
          console.error('프로필 업데이트 실패:', profileError);
        }
      } catch (updateError) {
        console.error('회원가입 후 프로필 설정 실패:', updateError);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Google 로그인 시작...');
      const redirectUrl = `${window.location.origin}/`;
      console.log('🔄 리다이렉트 URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('📡 Google OAuth 응답:', { data, error });
      
      if (error) {
        console.error('❌ Google 로그인 실패:', error);
      } else {
        console.log('✅ Google OAuth 리다이렉트 시작:', data);
      }
      
      return { error };
    } catch (exception: any) {
      console.error('💥 Google 로그인 예외:', exception);
      return { error: exception };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔒 useAuth: 로그아웃 시작...');
      
      // 타임아웃 설정 (10초)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('로그아웃 요청 시간 초과')), 10000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      
      console.log('🔄 useAuth: Supabase signOut 호출 중...');
      const { error } = await Promise.race([signOutPromise, timeoutPromise]);
      
      console.log('📡 useAuth: Supabase signOut 응답 받음', { error });
      
      // 에러가 있어도 상태는 초기화 (강제 로그아웃)
      console.log('🧹 useAuth: 상태 초기화 시작...');
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // 로컬스토리지도 정리
      try {
        localStorage.removeItem('supabase.auth.token');
        console.log('🗑️ useAuth: 로컬스토리지 정리 완료');
      } catch (storageError) {
        console.warn('⚠️ useAuth: 로컬스토리지 정리 실패:', storageError);
      }
      
      if (!error) {
        console.log('✅ useAuth: 로그아웃 성공, 상태 초기화 완료');
      } else {
        console.warn('⚠️ useAuth: 서버 로그아웃 실패하지만 로컬 상태는 초기화:', error);
      }
      
      return { error: null }; // 로컬 상태 초기화가 완료되었으므로 성공으로 처리
    } catch (error: any) {
      console.error('❌ useAuth: 로그아웃 예외:', error);
      
      // 예외가 발생해도 강제로 상태 초기화
      console.log('🚨 useAuth: 예외 발생으로 강제 상태 초기화');
      setProfile(null);
      setUser(null);
      setSession(null);
      
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (storageError) {
        console.warn('⚠️ useAuth: 예외 시 로컬스토리지 정리 실패:', storageError);
      }
      
      return { error: null }; // 강제 로그아웃이므로 성공으로 처리
    }
  };

  // 프로필 업데이트 함수
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', user.id as any);

      if (!error) {
        // 성공적으로 업데이트되면 로컬 상태도 업데이트
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
