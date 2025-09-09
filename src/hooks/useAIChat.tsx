import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  aiPersona?: string;
  isTyping?: boolean;
}

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  aiPersona: string;
  messages: Message[];
  lastActivity: Date;
  unreadCount: number;
}

interface AIChatContextType {
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];
  selectedPersona: AIPersona;
  messages: Message[];
  isTyping: boolean;
  setSelectedPersona: (persona: AIPersona) => void;
  sendMessage: (content: string) => Promise<void>;
  createRoom: (persona: AIPersona) => void;
  switchRoom: (roomId: string) => void;
  clearMessages: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'assistant',
    name: '어시스턴트',
    description: '도움이 되는 일반 AI 어시스턴트',
    icon: '🤖',
    color: '#FC87B2',
    systemPrompt: '당신은 도움이 되고 친절한 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요.'
  },
  {
    id: 'creative',
    name: '크리에이티브',
    description: '창의적이고 영감을 주는 AI',
    icon: '🎨',
    color: '#FF9AE3',
    systemPrompt: '당신은 창의적이고 영감을 주는 AI입니다. 상상력이 풍부하고 혁신적인 아이디어를 제안하며, 예술적이고 창의적인 관점에서 답변하세요.'
  },
  {
    id: 'professional',
    name: '프로페셔널',
    description: '비즈니스 및 업무 전문 AI',
    icon: '💼',
    color: '#E570A0',
    systemPrompt: '당신은 비즈니스 전문가입니다. 전문적이고 체계적인 답변을 제공하며, 효율성과 실용성을 중시하는 관점에서 조언하세요.'
  },
  {
    id: 'friend',
    name: '친구',
    description: '친근하고 편안한 대화 상대',
    icon: '😊',
    color: '#B794F6',
    systemPrompt: '당신은 친근하고 따뜻한 친구입니다. 편안하고 공감적인 톤으로 대화하며, 감정적인 지지와 격려를 제공하세요.'
  },
  {
    id: 'tutor',
    name: '튜터',
    description: '학습과 교육을 도와주는 AI',
    icon: '📚',
    color: '#9F7AEA',
    systemPrompt: '당신은 인내심 있고 지식이 풍부한 튜터입니다. 복잡한 개념을 쉽게 설명하고, 단계별 학습 가이드를 제공하세요.'
  },
  {
    id: 'analyst',
    name: '분석가',
    description: '데이터와 정보를 분석하는 AI',
    icon: '📊',
    color: '#68D391',
    systemPrompt: '당신은 논리적이고 분석적인 사고를 하는 분석가입니다. 데이터 기반의 객관적인 분석과 통찰을 제공하세요.'
  }
];

const generateAIResponse = async (userMessage: string, persona: AIPersona, messageHistory: Message[]): Promise<string> => {
  // Simulate AI thinking time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const responses: Record<string, string[]> = {
    assistant: [
      "네, 도움을 드릴 수 있습니다. 더 자세히 말씀해 주세요.",
      "흥미로운 질문이네요. 이런 관점에서 생각해볼 수 있습니다: " + userMessage,
      "좋은 아이디어입니다! 이를 발전시켜보면 어떨까요?",
      "이해했습니다. 이 문제에 대해 체계적으로 접근해보겠습니다.",
      "궁금한 점이 있으시면 언제든 말씀해 주세요."
    ],
    creative: [
      "✨ 와, 정말 창의적인 생각이에요! 이런 아이디어는 어떠신가요?",
      "🎨 상상력을 자극하는 질문이네요. 함께 브레인스토밍해봐요!",
      "💡 새로운 관점에서 접근해보면 더 흥미로울 것 같아요!",
      "🌟 그 아이디어를 바탕으로 이런 변형도 가능할 것 같아요...",
      "🎭 창의성에는 한계가 없어요! 더 대담하게 생각해봐요!"
    ],
    professional: [
      "비즈니스 관점에서 분석해보면, 다음과 같은 전략을 고려할 수 있습니다.",
      "효율적인 접근 방법을 제안드리겠습니다.",
      "데이터를 기반으로 한 의사결정이 중요합니다.",
      "ROI를 고려했을 때, 우선순위를 이렇게 설정하는 것이 좋겠습니다.",
      "리스크 관리 측면에서 검토가 필요한 부분이 있습니다."
    ],
    friend: [
      "앗, 그거 정말 재밌겠다! 😄 나도 그런 생각 해본 적 있어.",
      "오늘 기분은 어때? 뭔가 특별한 일 있었어?",
      "그래그래! 완전 공감해! 나라면 이렇게 했을 것 같아 🤗",
      "힘든 일이 있었구나... 괜찮아, 다 잘 될 거야! 💪",
      "와 대박! 정말 좋은 소식이네! 축하해! 🎉"
    ],
    tutor: [
      "좋은 질문이네요! 단계별로 설명해드릴게요.",
      "이 개념을 이해하기 위해서는 먼저 기본 원리부터 알아봐야 해요.",
      "예시를 들어 설명해드리면 더 이해하기 쉬울 것 같아요.",
      "혹시 어느 부분이 어려우신가요? 더 자세히 설명해드릴게요.",
      "잘 이해하고 계시네요! 다음 단계로 넘어가볼까요?"
    ],
    analyst: [
      "데이터를 분석해본 결과, 다음과 같은 패턴을 발견할 수 있습니다.",
      "통계적으로 보면, 이러한 경향성을 보입니다.",
      "상관관계를 분석해보니 흥미로운 결과가 나왔습니다.",
      "여러 변수를 고려했을 때, 가장 유의미한 요인은 다음과 같습니다.",
      "트렌드 분석 결과를 바탕으로 예측해보면..."
    ]
  };

  const personaResponses = responses[persona.id] || responses.assistant;
  const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  
  return randomResponse;
};

export const AIChatProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with default room
  useEffect(() => {
    const defaultRoom: ChatRoom = {
      id: 'default',
      name: selectedPersona.name,
      description: selectedPersona.description,
      aiPersona: selectedPersona.id,
      messages: [
        {
          id: '1',
          content: `안녕하세요! 저는 ${selectedPersona.name}입니다. ${selectedPersona.description} 어떤 도움이 필요하신가요?`,
          sender: 'ai',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          aiPersona: selectedPersona.id
        }
      ],
      lastActivity: new Date(),
      unreadCount: 0
    };

    setRooms([defaultRoom]);
    setCurrentRoom(defaultRoom);
  }, []);

  const sendMessage = async (content: string) => {
    if (!currentRoom || !content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === currentRoom.id 
          ? { 
              ...room, 
              messages: [...room.messages, userMessage],
              lastActivity: new Date()
            }
          : room
      )
    );

    setCurrentRoom(prev => 
      prev ? { 
        ...prev, 
        messages: [...prev.messages, userMessage],
        lastActivity: new Date()
      } : null
    );

    // Simulate AI typing
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(content, selectedPersona, currentRoom.messages);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        aiPersona: selectedPersona.id
      };

      // Add AI response
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === currentRoom.id 
            ? { 
                ...room, 
                messages: [...room.messages, userMessage, aiMessage],
                lastActivity: new Date()
              }
            : room
        )
      );

      setCurrentRoom(prev => 
        prev ? { 
          ...prev, 
          messages: [...prev.messages, userMessage, aiMessage],
          lastActivity: new Date()
        } : null
      );

    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const createRoom = (persona: AIPersona) => {
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      name: persona.name,
      description: persona.description,
      aiPersona: persona.id,
      messages: [
        {
          id: '1',
          content: `안녕하세요! 저는 ${persona.name}입니다. ${persona.description} 어떤 도움이 필요하신가요?`,
          sender: 'ai',
          timestamp: new Date(),
          aiPersona: persona.id
        }
      ],
      lastActivity: new Date(),
      unreadCount: 0
    };

    setRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    setSelectedPersona(persona);
  };

  const switchRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      const persona = AI_PERSONAS.find(p => p.id === room.aiPersona);
      if (persona) {
        setSelectedPersona(persona);
      }
      
      // Mark as read
      setRooms(prev => 
        prev.map(r => 
          r.id === roomId ? { ...r, unreadCount: 0 } : r
        )
      );
    }
  };

  const clearMessages = () => {
    if (!currentRoom) return;
    
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === currentRoom.id 
          ? { ...room, messages: [] }
          : room
      )
    );

    setCurrentRoom(prev => 
      prev ? { ...prev, messages: [] } : null
    );
  };

  const value = {
    currentRoom,
    rooms,
    selectedPersona,
    messages: currentRoom?.messages || [],
    isTyping,
    setSelectedPersona,
    sendMessage,
    createRoom,
    switchRoom,
    clearMessages
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};
