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

    // 인증 상태 변경 리스너만 설정 (세션 확인 로직 제거)
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
        } else {
          console.log('📝 세션 없음');
          setProfile(null);
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
          })
          .eq('user_id', data.user.id);

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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // 로그아웃 시 상태 초기화
    if (!error) {
      setProfile(null);
    }
    return { error };
  };

  // 프로필 업데이트 함수
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

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
