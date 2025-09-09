import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat, AI_PERSONAS } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Settings,
  LogOut,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  Sparkles,
  Trash2,
  Edit3,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const EnhancedAIMessenger = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    currentRoom, 
    rooms, 
    selectedPersona, 
    messages, 
    isTyping,
    setSelectedPersona,
    sendMessage,
    createRoom,
    switchRoom,
    clearMessages
  } = useAIChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = (persona: any) => {
    createRoom(persona);
    setShowPersonaSelector(false);
    toast({
      title: "새 대화 시작",
      description: `${persona.name}와의 새로운 대화를 시작했습니다.`
    });
  };

  const handleClearMessages = () => {
    clearMessages();
    toast({
      title: "대화 내역 삭제",
      description: "모든 메시지가 삭제되었습니다."
    });
  };

  const copyMessageToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "복사 완료",
      description: "메시지가 클립보드에 복사되었습니다."
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR');
    }
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
                style={{ 
                  background: 'hsl(var(--avatar-bg))',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <Sparkles className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: 'hsl(var(--text-headline))' }}>
                  AI 메신저
                </h1>
                <p className="text-xs" style={{ color: 'hsl(var(--text-meta))' }}>
                  지능형 대화 플랫폼
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
              환영합니다, {user?.email?.split('@')[0]}님!
            </p>
          </div>
        </div>

        {/* AI 페르소나 선택 */}
        <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: 'hsl(var(--text-body))' }}>
              AI 페르소나
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowPersonaSelector(!showPersonaSelector)}
            >
              {showPersonaSelector ? '간단히' : '전체보기'}
            </Button>
          </div>
          
          {showPersonaSelector ? (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {AI_PERSONAS.map((persona) => (
                <Button
                  key={persona.id}
                  variant="ghost"
                  className="h-auto p-3 flex items-center gap-3 justify-start"
                  onClick={() => handleCreateRoom(persona)}
                  style={{
                    background: selectedPersona.id === persona.id 
                      ? 'hsl(var(--card))' 
                      : 'transparent'
                  }}
                >
                  <span className="text-lg">{persona.icon}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm" style={{ color: 'hsl(var(--text-body))' }}>
                      {persona.name}
                    </div>
                    <div className="text-xs" style={{ color: 'hsl(var(--text-meta))' }}>
                      {persona.description}
                    </div>
                  </div>
                  <Plus className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {AI_PERSONAS.slice(0, 4).map((persona) => (
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
          )}
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1">
          <div className="p-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium" style={{ color: 'hsl(var(--text-body))' }}>
                대화 목록
              </h2>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => setShowPersonaSelector(true)}
              >
                <Plus className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200`}
                  style={{
                    background: currentRoom?.id === room.id 
                      ? 'hsl(var(--card))' 
                      : 'transparent',
                    boxShadow: currentRoom?.id === room.id 
                      ? 'var(--shadow-card)' 
                      : 'none'
                  }}
                  onClick={() => switchRoom(room.id)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                      style={{ 
                        background: 'hsl(var(--avatar-bg))',
                        borderColor: 'hsl(var(--avatar-border))'
                      }}
                    >
                      {AI_PERSONAS.find(p => p.id === room.aiPersona)?.icon || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate" style={{ color: 'hsl(var(--text-body))' }}>
                          {room.name}
                        </h3>
                        <span className="text-xs" style={{ color: 'hsl(var(--text-meta))' }}>
                          {formatDate(room.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--text-secondary))' }}>
                          {room.messages[room.messages.length - 1]?.content || '새 대화를 시작하세요'}
                        </p>
                        {room.unreadCount > 0 && (
                          <Badge 
                            className="h-5 w-5 p-0 rounded-full text-xs"
                            style={{ 
                              background: 'hsl(var(--primary))',
                              color: 'hsl(var(--primary-foreground))'
                            }}
                          >
                            {room.unreadCount}
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
          style={{ 
            borderColor: 'hsl(var(--border))',
            background: 'hsl(var(--card))',
            boxShadow: 'var(--shadow-card)'
          }}
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {}}>
                <RefreshCw className="h-4 w-4 mr-2" />
                대화 새로고침
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearMessages}>
                <Trash2 className="h-4 w-4 mr-2" />
                대화 내역 삭제
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="h-4 w-4 mr-2" />
                페르소나 설정
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 메시지 영역 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div 
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ 
                          background: 'hsl(var(--muted))',
                          color: 'hsl(var(--text-meta))'
                        }}
                      >
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className="px-4 py-2 rounded-2xl group relative"
                        style={{
                          background: message.sender === 'user' 
                            ? 'linear-gradient(90deg, #FC87B2 0%, #FF9AE3 100%)'
                            : 'hsl(var(--chat-other-bg))',
                          color: message.sender === 'user'
                            ? 'hsl(var(--chat-user-text))'
                            : 'hsl(var(--chat-other-text))',
                          borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          boxShadow: 'var(--shadow-card)'
                        }}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* 메시지 액션 버튼 */}
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div 
                            className="flex gap-1 p-1 rounded-lg"
                            style={{ background: 'hsl(var(--card))' }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyMessageToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
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
                          {AI_PERSONAS.find(p => p.id === message.aiPersona)?.icon || selectedPersona.icon}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
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
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: 'var(--shadow-card)'
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
          style={{ 
            borderColor: 'hsl(var(--border))',
            background: 'hsl(var(--card))'
          }}
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
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${selectedPersona.name}에게 메시지를 입력하세요...`}
                className="rounded-xl border-0 resize-none min-h-[44px] px-4"
                style={{
                  background: 'hsl(var(--input))',
                  color: 'hsl(var(--foreground))'
                }}
                disabled={isTyping}
              />
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Mic className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="h-9 w-9 rounded-xl transition-all duration-200"
                style={{
                  background: newMessage.trim() && !isTyping
                    ? 'linear-gradient(92deg, #FC87B2 0%, #FF9AE3 100%)'
                    : 'hsl(var(--muted))',
                  color: newMessage.trim() && !isTyping
                    ? 'hsl(var(--primary-foreground))'
                    : 'hsl(var(--muted-foreground))',
                  transform: newMessage.trim() && !isTyping ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: newMessage.trim() && !isTyping ? 'var(--shadow-card)' : 'none'
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

export default EnhancedAIMessenger;
