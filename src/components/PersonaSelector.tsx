import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: string;
  onPersonaChange: (persona: string) => void;
}

// 페르소나 정의
const personas = [
  {
    id: 'dating',
    name: '소개팅',
    icon: '💕',
    description: '정중하고 친근한 톤으로 첫 만남에 적합한 대화를 제안해드립니다.',
    color: 'from-pink-50 to-purple-50',
    borderColor: 'border-pink-200',
    examples: [
      '처음 뵙겠습니다. 반갑습니다!',
      '취미가 무엇인지 궁금해요',
      '오늘 날씨가 정말 좋네요'
    ]
  },
  {
    id: 'friend',
    name: '친구',
    icon: '👫',
    description: '편안하고 자연스러운 톤으로 친구 사이의 대화를 제안해드립니다.',
    color: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    examples: [
      '야! 뭐해?',
      '오늘 진짜 힘들었어',
      '같이 영화 볼래?'
    ]
  },
  {
    id: 'business',
    name: '비즈니스',
    icon: '🏢',
    description: '공식적이고 예의바른 톤으로 업무 관련 대화를 제안해드립니다.',
    color: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200',
    examples: [
      '안녕하세요. 문의드릴 게 있습니다.',
      '회의 일정을 확인해주세요.',
      '자료를 검토해보겠습니다.'
    ]
  },
  {
    id: 'customer',
    name: '고객센터',
    icon: '📞',
    description: '정중하고 도움이 되는 톤으로 고객 서비스 대화를 제안해드립니다.',
    color: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    examples: [
      '문의사항이 있으신가요?',
      '도움이 필요하시면 말씀해주세요.',
      '문제를 해결해드리겠습니다.'
    ]
  }
];

export const PersonaSelector = ({ 
  isOpen, 
  onClose, 
  currentPersona, 
  onPersonaChange 
}: PersonaSelectorProps) => {
  const handlePersonaSelect = (personaId: string) => {
    onPersonaChange(personaId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">대화 스타일 선택</DialogTitle>
          <DialogDescription>
            AI가 상황에 맞는 메시지를 제안해드립니다. 대화 스타일을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentPersona === persona.id 
                  ? `${persona.borderColor} border-2 shadow-sm` 
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePersonaSelect(persona.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="text-2xl">{persona.icon}</span>
                  <span>{persona.name}</span>
                  {currentPersona === persona.id && (
                    <Badge variant="secondary" className="ml-auto">
                      선택됨
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {persona.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">예시 메시지:</p>
                  <div className="space-y-1">
                    {persona.examples.map((example, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 rounded px-2 py-1 text-gray-700"
                      >
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
