import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

// 토스페이먼츠 SDK 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

interface TossPaymentConfig {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
  customerMobilePhone?: string;
}

interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface UseTossPaymentsReturn {
  loading: boolean;
  error: string | null;
  
  // 결제 요청 (일회성)
  requestPayment: (config: TossPaymentConfig) => Promise<boolean>;
  
  // 정기결제 (빌링키 발급)
  requestBillingAuth: (customerKey: string, successUrl: string, failUrl: string) => Promise<boolean>;
  
  // 빌링키로 결제
  requestBillingPayment: (billingKey: string, config: Omit<TossPaymentConfig, 'successUrl' | 'failUrl'>) => Promise<boolean>;
  
  // 결제 승인
  confirmPayment: (paymentKey: string, orderId: string, amount: number) => Promise<TossPaymentResult | null>;
  
  // 결제 취소
  cancelPayment: (paymentKey: string, cancelReason: string) => Promise<boolean>;
}

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export const useTossPayments = (): UseTossPaymentsReturn => {
  const { user, profile } = useAuth();
  const { createPayment, updatePaymentStatus } = usePayments();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tossPaymentsRef = useRef<any>(null);

  // 토스페이먼츠 SDK 초기화
  const initTossPayments = useCallback(() => {
    if (!window.TossPayments) {
      throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.');
    }
    
    if (!tossPaymentsRef.current) {
      tossPaymentsRef.current = window.TossPayments(TOSS_CLIENT_KEY);
    }
    
    return tossPaymentsRef.current;
  }, []);

  // 에러 핸들링
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error?.message || defaultMessage;
    setError(errorMessage);
    console.error(defaultMessage, error);
    
    toast({
      title: "결제 오류",
      description: errorMessage,
      variant: "destructive"
    });
  }, [toast]);

  // 일회성 결제 요청
  const requestPayment = useCallback(async (config: TossPaymentConfig): Promise<boolean> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // 결제 정보 DB에 저장
      const paymentData = {
        order_id: config.orderId,
        amount: config.amount,
        currency: 'KRW',
        payment_type: 'one_time' as const,
        status: 'pending' as const,
        metadata: {
          orderName: config.orderName,
          customerName: config.customerName,
          customerEmail: config.customerEmail
        }
      };

      const payment = await createPayment(paymentData);
      if (!payment) {
        throw new Error('결제 정보 생성에 실패했습니다.');
      }

      // 토스페이먼츠 SDK 초기화
      const tossPayments = initTossPayments();

      // 결제 요청
      await tossPayments.requestPayment('카드', {
        amount: config.amount,
        orderId: config.orderId,
        orderName: config.orderName,
        customerName: config.customerName,
        customerEmail: config.customerEmail,
        customerMobilePhone: config.customerMobilePhone,
        successUrl: config.successUrl,
        failUrl: config.failUrl
      });

      return true;
    } catch (err: any) {
      handleError(err, '결제 요청에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, createPayment, initTossPayments, handleError]);

  // 정기결제 빌링키 발급
  const requestBillingAuth = useCallback(async (
    customerKey: string, 
    successUrl: string, 
    failUrl: string
  ): Promise<boolean> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const tossPayments = initTossPayments();

      // 빌링키 발급 요청
      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl,
        failUrl
      });

      return true;
    } catch (err: any) {
      handleError(err, '빌링키 발급 요청에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, initTossPayments, handleError]);

  // 빌링키로 결제
  const requestBillingPayment = useCallback(async (
    billingKey: string, 
    config: Omit<TossPaymentConfig, 'successUrl' | 'failUrl'>
  ): Promise<boolean> => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // 결제 정보 DB에 저장
      const paymentData = {
        order_id: config.orderId,
        amount: config.amount,
        currency: 'KRW',
        payment_type: 'subscription' as const,
        status: 'pending' as const,
        metadata: {
          orderName: config.orderName,
          customerName: config.customerName,
          customerEmail: config.customerEmail,
          billingKey
        }
      };

      const payment = await createPayment(paymentData);
      if (!payment) {
        throw new Error('결제 정보 생성에 실패했습니다.');
      }

      // 실제 빌링 결제는 서버에서 처리되어야 함
      // 여기서는 구조만 제공
      console.log('빌링 결제 요청:', { billingKey, config });
      
      toast({
        title: "빌링 결제 요청",
        description: "서버에서 빌링 결제가 처리됩니다."
      });

      return true;
    } catch (err: any) {
      handleError(err, '빌링 결제 요청에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, createPayment, handleError, toast]);

  // 결제 승인
  const confirmPayment = useCallback(async (
    paymentKey: string, 
    orderId: string, 
    amount: number
  ): Promise<TossPaymentResult | null> => {
    try {
      setLoading(true);
      setError(null);

      // 실제로는 서버 API를 통해 결제 승인 처리
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('결제 승인에 실패했습니다.');
      }

      const result = await response.json();
      
      // 결제 상태 업데이트
      // orderId로 결제 정보 찾아서 업데이트
      // 실제 구현에서는 paymentKey로 조회하여 업데이트
      
      toast({
        title: "결제 승인 완료",
        description: "결제가 성공적으로 완료되었습니다."
      });

      return {
        paymentKey,
        orderId,
        amount
      };
    } catch (err: any) {
      handleError(err, '결제 승인에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  // 결제 취소
  const cancelPayment = useCallback(async (
    paymentKey: string, 
    cancelReason: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // 실제로는 서버 API를 통해 결제 취소 처리
      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentKey,
          cancelReason
        })
      });

      if (!response.ok) {
        throw new Error('결제 취소에 실패했습니다.');
      }

      toast({
        title: "결제 취소 완료",
        description: "결제가 성공적으로 취소되었습니다."
      });

      return true;
    } catch (err: any) {
      handleError(err, '결제 취소에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  return {
    loading,
    error,
    requestPayment,
    requestBillingAuth,
    requestBillingPayment,
    confirmPayment,
    cancelPayment
  };
};
