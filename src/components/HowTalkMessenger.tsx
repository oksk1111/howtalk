import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PersonaSelector } from './PersonaSelector';

// 친구 목록 더미 데이터
const friends = [
  { id: 1, name: '김민수', status: '온라인', avatar: '/placeholder.svg', relationshipType: '소개팅' },
  { id: 2, name: '이지영', status: '자리비움', avatar: '/placeholder.svg', relationshipType: '친구' },
  { id: 3, name: '박준호', status: '온라인', avatar: '/placeholder.svg', relationshipType: '친구' },
];

// 메시지 더미 데이터
const messages = [
  { id: 1, sender: 'other', content: '안녕하세요! 만나서 반갑습니다 😊', timestamp: '오후 2:30' },
  { id: 2, sender: 'me', content: '네, 저도 반갑습니다!', timestamp: '오후 2:32' },
  { id: 3, sender: 'other', content: '오늘 날씨가 정말 좋네요. 어떻게 지내고 계세요?', timestamp: '오후 2:35' },
];

// AI 제안 메시지
const aiSuggestions = [
  '네, 저도 반갑습니다!',
  '오늘 어떻게 지내셨어요?',
  '날씨가 정말 좋네요',
  '취미가 무엇인지 궁금해요',
];

export const HowTalkMessenger = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'friends' | 'chats'>('friends');
  const [selectedFriend, setSelectedFriend] = useState(friends[0]);
  const [messageInput, setMessageInput] = useState('');
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('소개팅');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다."
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    toast({
      title: "메시지 전송됨",
      description: messageInput,
    });
    setMessageInput('');
  };

  const handleAISuggestion = (suggestion: string) => {
    setMessageInput(suggestion);
  };

  const handleAIHelp = () => {
    setShowPersonaSelector(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 좌측 사이드바 */}
      <div className="w-80 bg-gray-100 flex flex-col">
        {/* 사이드바 헤더 */}
        <div className="bg-white p-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">HowTalk</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* 탭 버튼 */}
        <div className="bg-white p-1 m-4 rounded-lg flex gap-1">
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            className="flex-1 rounded-md"
            onClick={() => setActiveTab('friends')}
          >
            친구
          </Button>
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            className="flex-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={() => setActiveTab('chats')}
          >
            채팅
          </Button>
        </div>

        {/* 친구 목록 */}
        <div className="flex-1 bg-white mx-4 mb-4 rounded-lg p-4 overflow-y-auto">
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFriend.id === friend.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {friend.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">
                      {friend.name}
                    </div>
                    <div className={`text-xs ${
                      friend.status === '온라인' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {friend.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 채팅 헤더 */}
        <div className="bg-gray-50 border-b p-4 flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={selectedFriend.avatar} />
            <AvatarFallback className="bg-purple-500 text-white">
              {selectedFriend.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800">{selectedFriend.name}</div>
            <div className="text-sm text-gray-600">
              {selectedFriend.relationshipType} (온라인)
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 bg-blue-50 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'other' && (
                  <Avatar className="w-8 h-8 mr-3 mt-1">
                    <AvatarImage src={selectedFriend.avatar} />
                    <AvatarFallback className="bg-purple-500 text-white text-sm">
                      {selectedFriend.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs p-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 제안 및 입력 영역 */}
        <div className="bg-blue-50 border-t p-6">
          {/* AI 제안 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 font-semibold text-sm">💡 AI 제안:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 rounded-full"
                  onClick={() => handleAISuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* 메시지 입력창 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 border-none shadow-none focus-visible:ring-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
              onClick={handleAIHelp}
            >
              <Bot className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 rounded-lg"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI 페르소나 선택 모달 */}
      {showPersonaSelector && (
        <PersonaSelector
          isOpen={showPersonaSelector}
          onClose={() => setShowPersonaSelector(false)}
          currentPersona={currentPersona}
          onPersonaChange={setCurrentPersona}
        />
      )}
    </div>
  );
};
