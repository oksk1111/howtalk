import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePayments } from '@/hooks/usePayments';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Receipt, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PaymentHistory = () => {
  const { userPayments, fetchUserPayments, loading } = usePayments();

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  // 결제 상태에 따른 배지 스타일
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />완료</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />대기중</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />실패</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />취소</Badge>;
      case 'refunded':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />환불</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  // 가격 포맷팅
  const formatPrice = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <CardTitle>결제 내역</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <CardTitle>결제 내역</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUserPayments}>
            새로고침
          </Button>
        </div>
        <CardDescription>
          총 {userPayments.length}건의 결제 내역이 있습니다.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {userPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 결제 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPayments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">
                        주문 #{payment.order_id}
                      </h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>결제 유형: {
                        payment.payment_type === 'one_time' ? '일회성 결제' :
                        payment.payment_type === 'subscription' ? '정기결제' :
                        payment.payment_type === 'subscription_renewal' ? '정기결제 갱신' :
                        '알 수 없음'
                      }</p>
                      
                      {payment.payment_method && (
                        <p>결제 수단: {payment.payment_method}</p>
                      )}
                      
                      <p>요청일: {formatDate(payment.requested_at)}</p>
                      
                      {payment.approved_at && (
                        <p>승인일: {formatDate(payment.approved_at)}</p>
                      )}
                      
                      {payment.cancelled_at && (
                        <p>취소일: {formatDate(payment.cancelled_at)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatPrice(payment.amount, payment.currency || 'KRW')}
                    </p>
                    
                    {payment.payment_key && (
                      <p className="text-xs text-muted-foreground mt-1">
                        결제키: {payment.payment_key.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 메타데이터 표시 (있는 경우) */}
                {payment.metadata && typeof payment.metadata === 'object' && (
                  <div className="mt-3 pt-3 border-t">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        추가 정보 보기
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(payment.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
