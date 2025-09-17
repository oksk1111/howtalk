import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessenger } from '@/hooks/useMessenger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { MessageSquare, Users, Send, Clock, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MessengerApp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [newMessage, setNewMessage] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메신저 훅 사용
  const {
    chatRooms,
    messages,
    friends,
    loading: messengerLoading,
    selectedRoomId,
    setSelectedRoomId,
    sendMessage,
    createChatRoom,
    sendFriendRequest,
    addFriendSimple
  } = useMessenger();

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!selectedRoomId || !newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage, selectedRoomId);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 친구와 채팅 시작
  const handleStartChat = async (friendId: string) => {
    const roomId = await createChatRoom([friendId], false);
    if (roomId) {
      setSelectedRoomId(roomId);
      setActiveTab('chats');
    }
  };

  // 친구 추가
  const handleAddFriend = async () => {
    if (!friendEmail.trim() || addingFriend) return;

    setAddingFriend(true);
    try {
      const success = await addFriendSimple(friendEmail);
      
      if (success) {
        setFriendEmail('');
        setShowFriendDialog(false);
        toast({
          title: "친구 추가 완료",
          description: "새로운 친구가 추가되었습니다!"
        });
      } else {
        // 간단한 방법이 실패하면 원래 방법으로 시도
        const fallbackSuccess = await sendFriendRequest(friendEmail);
        
        if (fallbackSuccess) {
          setFriendEmail('');
          setShowFriendDialog(false);
        }
      }
    } catch (error) {
      toast({
        title: "친구 추가 실패",
        description: "친구 추가 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setAddingFriend(false);
    }
  };

  // 선택된 채팅방 정보 가져오기
  const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);
  
  // 채팅방 이름 생성 (1:1 채팅의 경우 상대방 이름)
  const getRoomDisplayName = (room: typeof chatRooms[0]) => {
    if (room.is_group) {
      return room.name || '그룹 채팅';
    }
    
    const otherParticipant = room.participants?.find(
      p => p.user_id !== user?.id
    );
    return otherParticipant?.profiles?.display_name || 
           otherParticipant?.profiles?.email?.split('@')[0] || 
           '알 수 없는 사용자';
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 메시지 목록이 변경될 때 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 로딩 상태 확인
  if (user && messengerLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg text-muted-foreground">메신저 로딩 중...</p>
          <p className="text-sm text-muted-foreground mt-2">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* 사이드바 */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">실시간 메신저</h1>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              안녕하세요, {user?.email?.split('@')[0]}님!
            </p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b">
          <Button
            variant={activeTab === 'chats' ? 'secondary' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            채팅 ({chatRooms.length})
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'secondary' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setActiveTab('friends')}
          >
            <Users className="h-4 w-4 mr-2" />
            친구 ({friends.length})
          </Button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium">채팅방</h2>
              </div>
              
              {chatRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 채팅방이 없습니다</p>
                  <p className="text-sm">친구와 대화를 시작해보세요!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatRooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={selectedRoomId === room.id ? "secondary" : "ghost"}
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {getRoomDisplayName(room).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">
                            {getRoomDisplayName(room)}
                          </div>
                          {room.last_message && (
                            <div className="text-xs text-muted-foreground truncate">
                              {room.last_message.content}
                            </div>
                          )}
                        </div>
                        {room.last_message && (
                          <div className="text-xs text-muted-foreground">
                            {formatTime(room.last_message.created_at)}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium">친구 목록</h2>
                <Dialog open={showFriendDialog} onOpenChange={setShowFriendDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      친구 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>친구 추가</DialogTitle>
                      <DialogDescription>
                        이메일 주소를 입력하여 새로운 친구를 추가하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">이메일 주소</label>
                        <Input
                          type="email"
                          placeholder="friend@example.com"
                          value={friendEmail}
                          onChange={(e) => setFriendEmail(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !addingFriend && handleAddFriend()}
                          disabled={addingFriend}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddFriend}
                          className="flex-1"
                          disabled={!friendEmail.trim() || addingFriend}
                        >
                          {addingFriend ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                              친구 추가 중...
                            </>
                          ) : (
                            '친구 추가'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 친구가 없습니다</p>
                  <p className="text-sm">이메일로 친구를 초대해보세요!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {friends.map((friend) => (
                    <div key={friend.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={friend.avatar_url || ""} />
                          <AvatarFallback>
                            {(friend.display_name || friend.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {friend.display_name || friend.email.split('@')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {friend.status === 'online' ? '온라인' : '오프라인'}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartChat(friend.user_id)}
                      >
                        채팅
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId && selectedRoom ? (
          <>
            {/* 채팅방 헤더 */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getRoomDisplayName(selectedRoom).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getRoomDisplayName(selectedRoom)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.is_group 
                      ? `${selectedRoom.participants?.length || 0}명 참여` 
                      : '1:1 채팅'}
                  </p>
                </div>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>대화를 시작해보세요!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex",
                      message.sender_id === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[70%] p-3 rounded-lg",
                        message.sender_id === user?.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      {message.sender_id !== user?.id && (
                        <div className="text-xs text-muted-foreground mb-1">
                          {message.profiles?.display_name || 
                           message.profiles?.email?.split('@')[0] || 
                           '알 수 없는 사용자'}
                        </div>
                      )}
                      <div className="break-words">{message.content}</div>
                      <div className={cn(
                        "text-xs mt-1 flex items-center gap-1",
                        message.sender_id === user?.id 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 영역 */}
            <div className="p-4 border-t bg-card">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  className="flex-1 resize-none"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">실시간 메신저</h3>
              <p className="text-muted-foreground mb-6">
                친구를 추가하고 실시간으로 대화를 나눠보세요!
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✨ 실시간 메시지 전송</p>
                <p>👥 친구 관리 기능</p>
                <p>💬 1:1 및 그룹 채팅</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerApp;
