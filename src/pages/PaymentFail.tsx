import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RotateCcw } from 'lucide-react';

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // 결제 실패 로그 기록
    console.error('결제 실패:', {
      errorCode,
      errorMessage,
      orderId,
      timestamp: new Date().toISOString()
    });
  }, [errorCode, errorMessage, orderId]);

  // 에러 메시지 개선
  const getDisplayMessage = (code: string | null, message: string | null) => {
    if (!code && !message) {
      return '알 수 없는 오류가 발생했습니다.';
    }

    // 토스페이먼츠 공통 에러 코드 처리
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 오류가 발생했습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다. 다른 카드를 사용해주세요.';
      case 'REJECT_CARD_AMOUNT':
        return '카드 한도가 부족합니다.';
      case 'INVALID_CARD_EXPIRATION':
        return '카드 유효기간이 만료되었습니다.';
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다.';
      case 'EXCEED_MAX_AUTH_COUNT':
        return '일일 결제 한도를 초과했습니다.';
      case 'INVALID_CARD_INSTALLMENT':
        return '할부가 지원되지 않는 카드입니다.';
      case 'NOT_SUPPORTED_INSTALLMENT':
        return '해당 할부 개월은 지원하지 않습니다.';
      case 'INVALID_CARD_BIN':
        return '등록되지 않은 카드입니다.';
      case 'NOT_AVAILABLE_BANK':
        return '은행 서비스 시간이 아닙니다.';
      default:
        return message || '결제 처리 중 오류가 발생했습니다.';
    }
  };

  const displayMessage = getDisplayMessage(errorCode, errorMessage);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            결제 실패
          </CardTitle>
          <CardDescription>
            결제 처리 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800 text-sm">
              {displayMessage}
            </p>
            
            {errorCode && (
              <p className="text-red-600 text-xs mt-2 font-mono">
                오류 코드: {errorCode}
              </p>
            )}
            
            {orderId && (
              <p className="text-red-600 text-xs mt-1 font-mono">
                주문번호: {orderId}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/?tab=payment')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              다시 시도하기
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">문제가 계속 발생하나요?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 카드 정보를 다시 확인해주세요</li>
              <li>• 다른 결제 수단을 시도해보세요</li>
              <li>• 카드사 한도를 확인해주세요</li>
              <li>• 고객센터에 문의해주세요</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFail;
