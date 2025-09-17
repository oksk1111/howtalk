import { useToast } from '@/hooks/use-toast';

export const createLogoutHandler = (signOut: () => Promise<{ error: any }>) => {
  const { toast } = useToast();
  
  return async () => {
    try {
      console.log('🔒 로그아웃 시작...');
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ 로그아웃 실패:', error);
        toast({
          title: "로그아웃 실패",
          description: error.message || "로그아웃 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        console.log('✅ 로그아웃 성공');
        toast({
          title: "로그아웃 완료",
          description: "안전하게 로그아웃되었습니다."
        });
        
        // 잠시 대기 후 인증 페이지로 이동
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      }
    } catch (error: any) {
      console.error('❌ 로그아웃 예외 발생:', error);
      toast({
        title: "로그아웃 오류",
        description: "로그아웃 처리 중 문제가 발생했습니다.",
        variant: "destructive"
      });
      
      // 오류가 발생해도 강제로 인증 페이지로 이동
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
  };
};
