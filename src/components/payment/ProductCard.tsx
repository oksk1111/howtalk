import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayments } from '@/hooks/usePayments';
import { useTossPayments } from '@/hooks/useTossPayments';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Check, Zap, Crown } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onPurchase?: (product: Product) => void;
}

const ProductCard = ({ product, onPurchase }: ProductCardProps) => {
  const { user, profile } = useAuth();
  const { createPayment, loading } = usePayments();
  const { requestPayment, loading: tossLoading } = useTossPayments();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  // 가격 포맷팅
  const formatPrice = (price: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // 상품 타입에 따른 아이콘
  const getProductIcon = (productType: string | null) => {
    switch (productType) {
      case 'subscription':
        return <Crown className="h-5 w-5" />;
      case 'one_time':
        return <Zap className="h-5 w-5" />;
      default:
        return <Check className="h-5 w-5" />;
    }
  };

  // 상품 타입에 따른 배지 색상
  const getBadgeVariant = (productType: string | null) => {
    switch (productType) {
      case 'subscription':
        return 'default';
      case 'one_time':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // 구매 처리
  const handlePurchase = async () => {
    if (!product.is_active) {
      toast({
        title: "구매 불가",
        description: "현재 판매중이지 않은 상품입니다.",
        variant: "destructive"
      });
      return;
    }

    if (!user || !profile) {
      toast({
        title: "로그인 필요",
        description: "결제를 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    
    try {
      // 주문 ID 생성 (타임스탬프 + 랜덤)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 토스페이먼츠 결제 요청
      const success = await requestPayment({
        amount: product.price,
        orderId,
        orderName: product.name,
        customerName: profile.display_name || user.email || '고객',
        customerEmail: user.email || '',
        customerMobilePhone: profile.phone_number || undefined,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      });

      if (success) {
        // 부모 컴포넌트의 구매 핸들러 호출
        if (onPurchase) {
          onPurchase(product);
        }
      }
    } catch (error) {
      console.error('구매 처리 실패:', error);
      toast({
        title: "구매 실패",
        description: "구매 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getProductIcon(product.product_type)}
            <CardTitle className="text-xl">{product.name}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant(product.product_type)}>
            {product.product_type === 'subscription' ? '정기결제' : '일회성'}
          </Badge>
        </div>
        <CardDescription className="text-2xl font-bold text-primary">
          {formatPrice(product.price, product.currency || 'KRW')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground">
          {product.description || '상품 설명이 없습니다.'}
        </p>
        
        {product.product_type === 'subscription' && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Crown className="h-4 w-4" />
              <span>정기결제 상품</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              구독 플랜을 별도로 선택해주세요
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePurchase}
          disabled={!product.is_active || loading || processing || tossLoading}
        >
          {(processing || tossLoading) ? "처리 중..." : (
            product.product_type === 'subscription' ? '구독하기' : '구매하기'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
