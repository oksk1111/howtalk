import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat, AI_PERSONAS } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
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
import styles from '@/styles/variations/vibrant.module.css';

interface AIMessengerProps {
  className?: string;
  variant?: 'source' | 'minimal' | 'professional' | 'vibrant';
}

const AIMessengerVibrant: React.FC<AIMessengerProps> = ({ className, variant = 'vibrant' }) => {
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
            <div className="flex items-center gap-3">
              <div className={styles.brandIcon}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={styles.brandTitle}>AI 메신저</h1>
                <p className={styles.brandSubtitle}>미래형 대화 플랫폼</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={styles.actionButton}>
                <Settings className="h-5 w-5" />
              </button>
              <button className={styles.actionButton} onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-sm ${styles.welcomeText}`}>
              환영합니다, {user?.email?.split('@')[0]}님! ✨
            </p>
          </div>
        </div>

        {/* AI 페르소나 선택 */}
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm ${styles.sectionTitle}`}>🌟 AI 페르소나</h2>
            <button
              className={`${styles.actionButton} text-xs px-3 py-1`}
              onClick={() => setShowPersonaSelector(!showPersonaSelector)}
            >
              {showPersonaSelector ? '간단히' : '전체보기'}
            </button>
          </div>
          
          <div className={styles.personaGrid}>
            {AI_PERSONAS.slice(0, 4).map((persona) => (
              <button
                key={persona.id}
                className={`${styles.personaButton} ${selectedPersona.id === persona.id ? styles.active : ''}`}
                onClick={() => setSelectedPersona(persona)}
              >
                <span className="text-2xl block mb-2 relative z-10">{persona.icon}</span>
                <span className="text-xs font-bold relative z-10">{persona.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-white border-opacity-10">
            <div className="flex items-center justify-between">
              <h2 className={`text-sm ${styles.sectionTitle}`}>💬 활성 대화</h2>
              <button 
                className={styles.actionButton}
                onClick={() => setShowPersonaSelector(true)}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`${styles.chatItem} ${currentRoom?.id === room.id ? styles.active : ''}`}
                  onClick={() => switchRoom(room.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${styles.avatar} flex items-center justify-center text-xl relative z-10`}>
                      {AI_PERSONAS.find(p => p.id === room.aiPersona)?.icon || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm truncate text-white">
                          {room.name}
                        </h3>
                        <span className={styles.timestamp}>
                          {formatDate(room.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs truncate text-white text-opacity-70">
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
      <div className="flex-1 flex flex-col relative z-10">
        {/* 채팅 헤더 */}
        <div className={`${styles.chatHeader} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`${styles.avatar} flex items-center justify-center text-2xl`}>
              {selectedPersona.icon}
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">{selectedPersona.name}</h1>
              <p className="text-sm text-white text-opacity-80">{selectedPersona.description}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={styles.actionButton}>
                <MoreVertical className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-gray-900 bg-opacity-90 backdrop-blur-lg border-white border-opacity-20">
              <DropdownMenuItem onClick={() => {}} className="text-white hover:bg-white hover:bg-opacity-10">
                <RefreshCw className="h-4 w-4 mr-2" />
                대화 새로고침
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearMessages} className="text-white hover:bg-white hover:bg-opacity-10">
                <Trash2 className="h-4 w-4 mr-2" />
                대화 내역 삭제
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white bg-opacity-20" />
              <DropdownMenuItem onClick={() => {}} className="text-white hover:bg-white hover:bg-opacity-10">
                <Settings className="h-4 w-4 mr-2" />
                페르소나 설정
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 메시지 영역 */}
        <ScrollArea className={`${styles.messageArea} flex-1`}>
          <div className="space-y-6">
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-8">
                      <div className={styles.dateHeader}>
                        ✨ {formatDate(message.timestamp)} ✨
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm lg:max-w-lg ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`group relative ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        <div className="absolute -top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2 p-2 rounded-lg bg-black bg-opacity-50 backdrop-blur-lg border border-white border-opacity-20">
                            <button
                              className={styles.actionButton}
                              onClick={() => copyMessageToClipboard(message.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className={`${styles.timestamp} mt-3 px-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === 'ai' && (
                      <div className={`${styles.avatar} mr-4 order-0 flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl">
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
                <div className={`${styles.avatar} mr-4 flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">{selectedPersona.icon}</span>
                </div>
                <div className={styles.typingIndicator}>
                  <div className="flex space-x-2">
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
          <div className="flex items-end gap-4">
            <div className="flex gap-3">
              <button className={styles.actionButton}>
                <Paperclip className="h-6 w-6" />
              </button>
              <button className={styles.actionButton}>
                <Smile className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${selectedPersona.name}에게 마법같은 메시지를 보내보세요... ✨`}
                className={`${styles.messageInput} w-full`}
                disabled={isTyping}
              />
            </div>
            
            <div className="flex gap-3">
              <button className={styles.actionButton}>
                <Mic className="h-6 w-6" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className={styles.sendButton}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessengerVibrant;
