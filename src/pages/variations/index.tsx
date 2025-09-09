import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AIChatProvider } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Palette, Monitor, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import all variations
import AIMessengerSource from '@/components/variations/source';
import AIMessengerMinimal from '@/components/variations/design1';
import AIMessengerProfessional from '@/components/variations/design2';
import AIMessengerVibrant from '@/components/variations/design3';

const designVariations = [
  {
    id: 'source',
    name: '원본 디자인',
    description: '기본 design.json 스타일',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-purple-500',
    component: AIMessengerSource,
    features: ['Design.json 완전 준수', '다크 테마', '그라디언트 버튼', '세련된 UI']
  },
  {
    id: 'minimal',
    name: 'Minimal Modern',
    description: '깔끔하고 현대적인 디자인',
    icon: '✨',
    color: 'bg-gradient-to-r from-slate-500 to-slate-600',
    component: AIMessengerMinimal,
    features: ['미니멀 디자인', '라이트 테마', '깔끔한 타이포그래피', '단순한 색상']
  },
  {
    id: 'professional',
    name: 'Dark Professional',
    description: '전문적이고 고급스러운 다크 테마',
    icon: '💼',
    color: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    component: AIMessengerProfessional,
    features: ['프리미엄 다크 테마', '그라디언트 효과', '고급스러운 그림자', '전문적 느낌']
  },
  {
    id: 'vibrant',
    name: 'Vibrant Gradient',
    description: '생동감 있는 그라디언트와 네온 스타일',
    icon: '🌈',
    color: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500',
    component: AIMessengerVibrant,
    features: ['네온 그라디언트', '애니메이션 효과', '미래적 디자인', '화려한 시각 효과']
  }
];

const VariationsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedVariation, setSelectedVariation] = useState(designVariations[0]);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Palette className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const SelectedComponent = selectedVariation.component;

  return (
    <div className="min-h-screen bg-background">
      {!showFullscreen && (
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Palette className="h-6 w-6 text-primary" />
                    디자인 변형 비교
                  </h1>
                  <p className="text-muted-foreground">AI 메신저의 다양한 디자인 스타일을 비교해보세요</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  {designVariations.length}개 변형
                </Badge>
                <Button
                  variant={showFullscreen ? "default" : "outline"}
                  onClick={() => setShowFullscreen(!showFullscreen)}
                >
                  {showFullscreen ? "비교 모드" : "전체 화면"}
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex h-screen">
        {/* 사이드바 - 디자인 선택 */}
        {!showFullscreen && (
          <aside className="w-80 border-r bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/30">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                디자인 변형
              </h2>
              <div className="space-y-4">
                {designVariations.map((variation) => (
                  <Card 
                    key={variation.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedVariation.id === variation.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedVariation(variation)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${variation.color} flex items-center justify-center text-2xl`}>
                          {variation.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{variation.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {variation.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          주요 특징
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {variation.features.map((feature, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">💡 사용 팁</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 각 변형을 클릭하여 미리보기</li>
                  <li>• 전체 화면으로 실제 경험 확인</li>
                  <li>• 모든 기능은 동일하게 작동</li>
                  <li>• 디자인만 다르게 적용됨</li>
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* 메인 미리보기 영역 */}
        <main className="flex-1 bg-background">
          {!showFullscreen && (
            <div className="p-6 border-b bg-card/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {selectedVariation.icon} {selectedVariation.name}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedVariation.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedVariation.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 실제 컴포넌트 렌더링 */}
          <div className={showFullscreen ? "h-screen" : "h-[calc(100vh-140px)]"}>
            <AIChatProvider>
              <SelectedComponent 
                variant={selectedVariation.id}
                className={showFullscreen ? "" : "h-full"}
              />
            </AIChatProvider>
          </div>
        </main>
      </div>

      {showFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowFullscreen(false)}
            className="bg-black/50 backdrop-blur text-white hover:bg-black/70"
          >
            비교 모드로 돌아가기
          </Button>
        </div>
      )}
    </div>
  );
};

export default VariationsPage;
