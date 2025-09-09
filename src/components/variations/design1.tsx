import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat, AI_PERSONAS } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import styles from '@/styles/variations/minimal.module.css';

interface AIMessengerProps {
  className?: string;
  variant?: 'source' | 'minimal' | 'professional' | 'vibrant';
}

const AIMessengerMinimal: React.FC<AIMessengerProps> = ({ className, variant = 'minimal' }) => {
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
    <div className={`${styles.container} h-screen flex ${className}`}>
      {/* 사이드바 */}
      <div className={styles.sidebar}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={styles.brandIcon}>
                <Sparkles className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h1 className={styles.brandTitle}>AI 메신저</h1>
                <p className={styles.brandSubtitle}>깔끔한 대화 플랫폼</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${styles.actionButton}`}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${styles.actionButton}`} onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-slate-600">
              안녕하세요, {user?.email?.split('@')[0]}님!
            </p>
          </div>
        </div>

        {/* AI 페르소나 선택 */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">AI 페르소나</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-slate-600"
              onClick={() => setShowPersonaSelector(!showPersonaSelector)}
            >
              {showPersonaSelector ? '간단히' : '전체보기'}
            </Button>
          </div>
          
          <div className={styles.personaGrid}>
            {AI_PERSONAS.slice(0, 4).map((persona) => (
              <button
                key={persona.id}
                className={`${styles.personaButton} ${selectedPersona.id === persona.id ? styles.active : ''}`}
                onClick={() => setSelectedPersona(persona)}
              >
                <span className="text-lg block mb-1">{persona.icon}</span>
                <span className="text-xs font-medium">{persona.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-700">대화 목록</h2>
              <Button 
                size="sm" 
                variant="ghost" 
                className={`h-6 w-6 p-0 ${styles.actionButton}`}
                onClick={() => setShowPersonaSelector(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`${styles.chatItem} ${currentRoom?.id === room.id ? styles.active : ''}`}
                  onClick={() => switchRoom(room.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${styles.avatar} flex items-center justify-center text-lg`}>
                      {AI_PERSONAS.find(p => p.id === room.aiPersona)?.icon || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate text-slate-800">
                          {room.name}
                        </h3>
                        <span className={styles.timestamp}>
                          {formatDate(room.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs truncate text-slate-600">
                          {room.messages[room.messages.length - 1]?.content || '새 대화를 시작하세요'}
                        </p>
                        {room.unreadCount > 0 && (
                          <span className={`${styles.badge} flex items-center justify-center`}>
                            {room.unreadCount}
                          </span>
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
        <div className={`${styles.chatHeader} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`${styles.avatar} flex items-center justify-center text-lg`}>
              {selectedPersona.icon}
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">{selectedPersona.name}</h1>
              <p className="text-sm text-slate-600">{selectedPersona.description}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={styles.actionButton}>
                <MoreVertical className="h-4 w-4" />
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
        <ScrollArea className={`${styles.messageArea} flex-1`}>
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className={styles.dateHeader}>
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`group relative ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1 p-1 rounded-lg bg-white shadow-sm border border-slate-200">
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
                      <p className={`${styles.timestamp} mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === 'ai' && (
                      <div className={`${styles.avatar} mr-2 order-0 flex items-center justify-center`}>
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
                <div className={`${styles.avatar} mr-2 flex items-center justify-center`}>
                  <span className="text-sm">{selectedPersona.icon}</span>
                </div>
                <div className={styles.typingIndicator}>
                  <div className="flex space-x-1">
                    <div className={`${styles.typingDot} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`${styles.typingDot} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`${styles.typingDot} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 메시지 입력 영역 */}
        <div className={styles.inputArea}>
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className={`h-9 w-9 ${styles.actionButton}`}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className={`h-9 w-9 ${styles.actionButton}`}>
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${selectedPersona.name}에게 메시지를 입력하세요...`}
                className={styles.messageInput}
                disabled={isTyping}
              />
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className={`h-9 w-9 ${styles.actionButton}`}>
                <Mic className="h-4 w-4" />
              </Button>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className={`${styles.sendButton} ${!newMessage.trim() || isTyping ? 'opacity-50' : ''}`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessengerMinimal;
