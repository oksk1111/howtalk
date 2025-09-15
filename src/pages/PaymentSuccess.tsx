import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTossPayments } from '@/hooks/useTossPayments';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Home } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPayment, loading } = useTossPayments();
  const { toast } = useToast();
  
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const handlePaymentConfirm = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        toast({
          title: "결제 정보 오류",
          description: "결제 정보가 올바르지 않습니다.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        setConfirming(true);
        
        const result = await confirmPayment(
          paymentKey, 
          orderId, 
          parseInt(amount)
        );

        if (result) {
          setPaymentInfo(result);
          setConfirmed(true);
          
          toast({
            title: "결제 완료",
            description: "결제가 성공적으로 처리되었습니다."
          });
        } else {
          throw new Error('결제 승인에 실패했습니다.');
        }
      } catch (error) {
        console.error('결제 승인 실패:', error);
        toast({
          title: "결제 승인 실패",
          description: "결제 승인 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        navigate('/payment/fail');
      } finally {
        setConfirming(false);
      }
    };

    handlePaymentConfirm();
  }, [searchParams, confirmPayment, toast, navigate]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (confirming || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Clock className="h-16 w-16 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-bold">결제 승인 중</h2>
              <p className="text-muted-foreground">
                결제를 승인하고 있습니다. 잠시만 기다려주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            결제 완료
          </CardTitle>
          <CardDescription>
            결제가 성공적으로 처리되었습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {confirmed && paymentInfo && (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-mono text-sm">
                  {paymentInfo.orderId}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">결제금액</span>
                <span className="font-bold text-lg">
                  {formatPrice(paymentInfo.amount)}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">결제키</span>
                <span className="font-mono text-xs">
                  {paymentInfo.paymentKey.slice(0, 20)}...
                </span>
              </div>
            </div>
          )}
          
          <div className="pt-4 space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/?tab=payment')}
            >
              결제 내역 확인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
