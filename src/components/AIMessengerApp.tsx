import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Send, 
  Bot,
  User,
  Sparkles,
  Settings,
  LogOut,
  Smile,
  Paperclip,
  Mic,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  aiPersona?: string;
}

interface AIPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const AI_PERSONAS: AIPersona[] = [
  {
    id: 'assistant',
    name: '어시스턴트',
    description: '도움이 되는 일반 AI 어시스턴트',
    icon: '🤖',
    color: '#FC87B2'
  },
  {
    id: 'creative',
    name: '크리에이티브',
    description: '창의적이고 영감을 주는 AI',
    icon: '🎨',
    color: '#FF9AE3'
  },
  {
    id: 'professional',
    name: '프로페셔널',
    description: '비즈니스 및 업무 전문 AI',
    icon: '💼',
    color: '#E570A0'
  },
  {
    id: 'friend',
    name: '친구',
    description: '친근하고 편안한 대화 상대',
    icon: '😊',
    color: '#B794F6'
  }
];

const MOCK_CHATS = [
  {
    id: '1',
    name: 'AI 어시스턴트',
    lastMessage: '어떤 도움이 필요하신가요?',
    timestamp: '방금 전',
    unread: 0,
    type: 'ai',
    avatar: '🤖'
  },
  {
    id: '2',
    name: '크리에이티브 AI',
    lastMessage: '새로운 아이디어를 함께 만들어봐요!',
    timestamp: '5분 전',
    unread: 2,
    type: 'ai',
    avatar: '🎨'
  }
];

const AIMessengerApp = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! 저는 당신의 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      aiPersona: 'assistant'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      assistant: [
        "네, 도움을 드릴 수 있습니다. 더 자세히 말씀해 주세요.",
        "흥미로운 질문이네요. 이런 관점에서 생각해볼 수 있습니다.",
        "좋은 아이디어입니다! 이를 발전시켜보면 어떨까요?"
      ],
      creative: [
        "✨ 와, 정말 창의적인 생각이에요! 이런 아이디어는 어떠신가요?",
        "🎨 상상력을 자극하는 질문이네요. 함께 브레인스토밍해봐요!",
        "💡 새로운 관점에서 접근해보면 더 흥미로울 것 같아요!"
      ],
      professional: [
        "비즈니스 관점에서 분석해보면, 다음과 같은 전략을 고려할 수 있습니다.",
        "효율적인 접근 방법을 제안드리겠습니다.",
        "데이터를 기반으로 한 의사결정이 중요합니다."
      ],
      friend: [
        "앗, 그거 정말 재밌겠다! 😄 나도 그런 생각 해본 적 있어.",
        "오늘 기분은 어때? 뭔가 특별한 일 있었어?",
        "그래그래! 완전 공감해! 나라면 이렇게 했을 것 같아 🤗"
      ]
    };

    const personaResponses = responses[selectedPersona.id as keyof typeof responses] || responses.assistant;
    const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
      aiPersona: selectedPersona.id
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    await simulateAIResponse(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex" style={{ background: 'hsl(var(--background))' }}>
      {/* 사이드바 */}
      <div 
        className="w-80 flex flex-col border-r"
        style={{ 
          background: 'hsl(var(--side-panel))',
          borderColor: 'hsl(var(--border))'
        }}
      >
        {/* 헤더 */}
        <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-xl"
                style={{ background: 'hsl(var(--avatar-bg))' }}
              >
                <Sparkles className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'hsl(var(--text-headline))' }}>
                  AI 메신저
                </h1>
                <p className="text-xs" style={{ color: 'hsl(var(--text-meta))' }}>
                  지능형 대화 도우미
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
              안녕하세요, {user?.email?.split('@')[0]}님!
            </p>
          </div>
        </div>

        {/* AI 페르소나 선택 */}
        <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: 'hsl(var(--text-body))' }}>
            AI 페르소나
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {AI_PERSONAS.map((persona) => (
              <Button
                key={persona.id}
                variant={selectedPersona.id === persona.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-1"
                onClick={() => setSelectedPersona(persona)}
                style={{
                  background: selectedPersona.id === persona.id 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--card))',
                  color: selectedPersona.id === persona.id 
                    ? 'hsl(var(--primary-foreground))' 
                    : 'hsl(var(--text-body))',
                  borderColor: 'hsl(var(--border))'
                }}
              >
                <span className="text-lg">{persona.icon}</span>
                <span className="text-xs font-medium">{persona.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1">
          <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium" style={{ color: 'hsl(var(--text-body))' }}>
                대화
              </h2>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {MOCK_CHATS.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-xl mb-2 cursor-pointer transition-colors`}
                  style={{
                    background: activeChat.id === chat.id 
                      ? 'hsl(var(--card))' 
                      : 'transparent'
                  }}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                      style={{ 
                        background: 'hsl(var(--avatar-bg))',
                        borderColor: 'hsl(var(--avatar-border))'
                      }}
                    >
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate" style={{ color: 'hsl(var(--text-body))' }}>
                          {chat.name}
                        </h3>
                        <span className="text-xs" style={{ color: 'hsl(var(--text-meta))' }}>
                          {chat.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--text-secondary))' }}>
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <Badge 
                            className="h-5 w-5 p-0 rounded-full text-xs"
                            style={{ 
                              background: 'hsl(var(--primary))',
                              color: 'hsl(var(--primary-foreground))'
                            }}
                          >
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 채팅 헤더 */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
              style={{ 
                background: 'hsl(var(--avatar-bg))',
                borderColor: 'hsl(var(--avatar-border))'
              }}
            >
              {selectedPersona.icon}
            </div>
            <div>
              <h1 className="font-semibold" style={{ color: 'hsl(var(--text-headline))' }}>
                {selectedPersona.name}
              </h1>
              <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
                {selectedPersona.description}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          </Button>
        </div>

        {/* 메시지 영역 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className="px-4 py-2 rounded-2xl"
                    style={{
                      background: message.sender === 'user' 
                        ? 'linear-gradient(90deg, #FC87B2 0%, #FF9AE3 100%)'
                        : 'hsl(var(--chat-other-bg))',
                      color: message.sender === 'user'
                        ? 'hsl(var(--chat-user-text))'
                        : 'hsl(var(--chat-other-text))',
                      borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                    }}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p 
                    className="text-xs mt-1 px-2"
                    style={{ 
                      color: 'hsl(var(--chat-timestamp))',
                      textAlign: message.sender === 'user' ? 'right' : 'left'
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'ai' && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 order-0"
                    style={{ 
                      background: 'hsl(var(--avatar-bg))',
                      border: '2px solid hsl(var(--avatar-border))'
                    }}
                  >
                    <span className="text-sm">
                      {AI_PERSONAS.find(p => p.id === message.aiPersona)?.icon || '🤖'}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                  style={{ 
                    background: 'hsl(var(--avatar-bg))',
                    border: '2px solid hsl(var(--avatar-border))'
                  }}
                >
                  <span className="text-sm">{selectedPersona.icon}</span>
                </div>
                <div 
                  className="px-4 py-2 rounded-2xl max-w-xs"
                  style={{
                    background: 'hsl(var(--chat-other-bg))',
                    borderRadius: '18px 18px 18px 4px'
                  }}
                >
                  <div className="flex space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: 'hsl(var(--chat-other-text))',
                        animationDelay: '0ms'
                      }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: 'hsl(var(--chat-other-text))',
                        animationDelay: '150ms'
                      }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: 'hsl(var(--chat-other-text))',
                        animationDelay: '300ms'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 메시지 입력 영역 */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Paperclip className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Smile className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </div>
            
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${selectedPersona.name}에게 메시지를 입력하세요...`}
                className="rounded-xl border-0 resize-none min-h-[44px] px-4"
                style={{
                  background: 'hsl(var(--input))',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Mic className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="h-9 w-9 rounded-xl"
                style={{
                  background: newMessage.trim() 
                    ? 'linear-gradient(92deg, #FC87B2 0%, #FF9AE3 100%)'
                    : 'hsl(var(--muted))',
                  color: newMessage.trim() 
                    ? 'hsl(var(--primary-foreground))'
                    : 'hsl(var(--muted-foreground))'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessengerApp;
