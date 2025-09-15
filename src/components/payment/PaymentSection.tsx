import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import PaymentHistory from './PaymentHistory';
import { CreditCard, Package, Receipt, User, LogOut } from 'lucide-react';

const PaymentSection = () => {
  const { user, profile, signOut } = useAuth();
  const { products, fetchProducts, loading } = usePayments();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">결제 관리</h1>
          <p className="text-muted-foreground">
            상품 구매 및 결제 내역을 관리하세요
          </p>
        </div>
        
        {/* 사용자 정보 */}
        <Card className="w-80">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {profile?.display_name || user?.email || '사용자'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            상품 구매
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            결제 내역
          </TabsTrigger>
        </TabsList>
        
        {/* 상품 구매 탭 */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                이용 가능한 상품
              </CardTitle>
              <CardDescription>
                필요한 상품을 선택하여 구매하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-muted animate-pulse rounded-lg h-80"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>현재 이용 가능한 상품이 없습니다.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={fetchProducts}
                  >
                    새로고침
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPurchase={(product) => {
                        console.log('구매 요청:', product);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 결제 내역 탭 */}
        <TabsContent value="history">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSection;
