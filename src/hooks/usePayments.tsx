import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

// 타입 정의
type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type Product = Database['public']['Tables']['products']['Row'];
type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface PaymentHookReturn {
  // 상태
  loading: boolean;
  error: string | null;
  
  // 상품 관련
  products: Product[];
  subscriptionPlans: SubscriptionPlan[];
  
  // 결제 관련
  userPayments: Payment[];
  userSubscriptions: Subscription[];
  
  // 함수
  fetchProducts: () => Promise<void>;
  fetchSubscriptionPlans: () => Promise<void>;
  fetchUserPayments: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  createPayment: (paymentData: Omit<PaymentInsert, 'user_id'>) => Promise<Payment | null>;
  updatePaymentStatus: (paymentId: string, status: string, metadata?: any) => Promise<boolean>;
  
  // 토스페이먼츠 관련 (향후 구현)
  initiateTossPayment: (amount: number, orderId: string, orderName: string) => Promise<any>;
  verifyTossPayment: (paymentKey: string, orderId: string, amount: number) => Promise<boolean>;
}

export const usePayments = (): PaymentHookReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 상태 관리
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);

  // 에러 처리 헬퍼
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error?.message || defaultMessage;
    setError(errorMessage);
    console.error(defaultMessage, error);
  }, []);

  // 상품 목록 가져오기
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      handleError(err, '상품 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 정기결제 플랜 가져오기
  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select(`
          *,
          products (
            name,
            description,
            product_type
          )
        `)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (fetchError) throw fetchError;
      setSubscriptionPlans(data || []);
    } catch (err) {
      handleError(err, '정기결제 플랜을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 사용자 결제 내역 가져오기
  const fetchUserPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          products (
            name,
            description
          ),
          subscription_plans (
            name,
            billing_interval
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUserPayments(data || []);
    } catch (err) {
      handleError(err, '결제 내역을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  // 사용자 구독 정보 가져오기
  const fetchUserSubscriptions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            *,
            products (
              name,
              description
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUserSubscriptions(data || []);
    } catch (err) {
      handleError(err, '구독 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  // 결제 생성
  const createPayment = useCallback(async (paymentData: Omit<PaymentInsert, 'user_id'>): Promise<Payment | null> => {
    if (!user?.id) {
      setError('로그인이 필요합니다.');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          user_id: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      handleError(err, '결제 생성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  // 결제 상태 업데이트
  const updatePaymentStatus = useCallback(async (
    paymentId: string, 
    status: string, 
    metadata?: any
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'cancelled' || status === 'failed') {
        updateData.cancelled_at = new Date().toISOString();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error: updateError } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (updateError) throw updateError;
      
      // 로컬 상태 업데이트
      setUserPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, ...updateData }
            : payment
        )
      );

      return true;
    } catch (err) {
      handleError(err, '결제 상태 업데이트에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 토스페이먼츠 결제 시작 (향후 구현)
  const initiateTossPayment = useCallback(async (
    amount: number, 
    orderId: string, 
    orderName: string
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      // 여기에 토스페이먼츠 MCP 호출 로직 구현
      // 현재는 기본 구조만 제공
      console.log('토스페이먼츠 결제 시작:', { amount, orderId, orderName });
      
      // TODO: 토스페이먼츠 MCP 연동
      return {
        success: false,
        message: '토스페이먼츠 연동이 아직 구현되지 않았습니다.'
      };
    } catch (err) {
      handleError(err, '토스페이먼츠 결제 시작에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 토스페이먼츠 결제 검증 (향후 구현)
  const verifyTossPayment = useCallback(async (
    paymentKey: string, 
    orderId: string, 
    amount: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // 여기에 토스페이먼츠 결제 검증 로직 구현
      console.log('토스페이먼츠 결제 검증:', { paymentKey, orderId, amount });
      
      // TODO: 토스페이먼츠 MCP로 결제 검증
      return false;
    } catch (err) {
      handleError(err, '토스페이먼츠 결제 검증에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    // 상태
    loading,
    error,
    
    // 데이터
    products,
    subscriptionPlans,
    userPayments,
    userSubscriptions,
    
    // 함수
    fetchProducts,
    fetchSubscriptionPlans,
    fetchUserPayments,
    fetchUserSubscriptions,
    createPayment,
    updatePaymentStatus,
    
    // 토스페이먼츠 관련
    initiateTossPayment,
    verifyTossPayment
  };
};
