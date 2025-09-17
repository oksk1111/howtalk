import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// 데이터베이스 타입 추출
type Profile = Database['public']['Tables']['profiles']['Row'];
type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type ChatParticipant = Database['public']['Tables']['chat_participants']['Row'];
type Friendship = Database['public']['Tables']['friendships']['Row'];

// 확장된 타입 정의
interface ExtendedChatRoom extends ChatRoom {
  participants?: (ChatParticipant & {
    profiles?: Profile;
  })[];
  last_message?: Message;
  unread_count?: number;
}

interface ExtendedMessage extends Message {
  profiles?: Profile;
}

interface ExtendedProfile extends Profile {
  friendship_status?: 'none' | 'pending' | 'accepted' | 'blocked';
}

export const useMessenger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // 상태 관리
  const [chatRooms, setChatRooms] = useState<ExtendedChatRoom[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [friends, setFriends] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 타임아웃으로 로딩 상태 보호 (3초후 강제 해제)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // 채팅방 목록 조회 (현재 사용자가 참여하는 채팅방만)
  const fetchChatRooms = useCallback(async () => {
    if (!user) {
      setChatRooms([]);
      return;
    }

    try {
      // 1. 먼저 사용자가 참여하는 채팅방 ID들을 조회
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', user.id);

      if (participantError) {
        throw participantError;
      }

      if (!participantData || participantData.length === 0) {
        setChatRooms([]);
        return;
      }

      const roomIds = participantData.map(p => p.room_id);

      // 2. 해당 채팅방들의 상세 정보 조회
      const { data: roomsData, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id, 
          name, 
          is_group, 
          created_at, 
          updated_at, 
          created_by,
          chat_participants (
            user_id,
            profiles (
              user_id,
              display_name,
              avatar_url,
              email
            )
          )
        `)
        .in('id', roomIds)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (roomsError) {
        throw roomsError;
      }

      if (!roomsData || roomsData.length === 0) {
        setChatRooms([]);
        return;
      }

      // 채팅방 데이터 가공
      const processedRooms = roomsData.map(room => {
        const participants = room.chat_participants?.map((cp: any) => ({
          ...cp,
          profiles: cp.profiles
        })) || [];

        // 1:1 채팅방이고 이름이 없는 경우, 상대방 이름으로 설정
        let displayName = room.name;
        if (!room.is_group && !displayName && participants.length > 0) {
          const otherParticipant = participants.find((p: any) => p.user_id !== user.id);
          if (otherParticipant?.profiles) {
            displayName = otherParticipant.profiles.display_name || otherParticipant.profiles.email;
          }
        }

        return {
          ...room,
          name: displayName || room.name,
          participants,
          last_message: undefined
        };
      });

      setChatRooms(processedRooms);
      
    } catch (error: any) {
      console.error('채팅방 조회 실패:', error);
      setChatRooms([]);
      
      toast({
        title: "채팅방 조회 실패",
        description: "채팅방 목록을 불러오는데 문제가 있습니다.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // 친구 목록 조회 (완전 단순화)
  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      return;
    }

    try {
      console.log('Starting to fetch friends for user:', user.id);

      // 1단계: 친구 관계 조회
      const { data: friendshipData, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id, status')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .limit(50);

      if (error) {
        console.error('Friendship query error:', error);
        throw error;
      }

      console.log('Friendship data:', friendshipData);

      if (!friendshipData || friendshipData.length === 0) {
        console.log('No friendships found');
        setFriends([]);
        return;
      }

      // 2단계: 친구 ID 추출
      const friendIds = friendshipData.map(friendship => 
        friendship.requester_id === user.id 
          ? friendship.addressee_id 
          : friendship.requester_id
      );

      console.log('Friend IDs:', friendIds);

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // 3단계: 친구 프로필 조회
      const { data: friendProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, status, email')
        .in('user_id', friendIds)
        .limit(50);

      if (profileError) {
        console.error('Profile query error:', profileError);
        throw profileError;
      }

      console.log('Friend profiles:', friendProfiles);

      const friendsWithStatus = friendProfiles?.map(friend => ({
        ...friend,
        friendship_status: 'accepted' as const
      } as ExtendedProfile)) || [];

      console.log('Final friends with status:', friendsWithStatus);
      setFriends(friendsWithStatus);
      
    } catch (error: any) {
      console.error('친구 목록 조회 실패:', error);
      setFriends([]);
      
      toast({
        title: "친구 목록 조회 실패",
        description: `친구 목록을 불러오는데 문제가 있습니다: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // 메시지 목록 조회
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      // 1단계: 메시지 조회
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // 2단계: 발신자 정보 조회
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', senderIds);

      // 3단계: 메시지와 프로필 정보 결합
      const messagesWithProfiles = messagesData.map(message => ({
        ...message,
        profiles: profiles?.find(profile => profile.user_id === message.sender_id) || undefined
      })) as ExtendedMessage[];

      setMessages(messagesWithProfiles);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: "메시지 조회 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [toast]);

  // 메시지 전송
  const sendMessage = useCallback(async (
    content: string, 
    roomId: string,
    messageType: string = 'text',
    aiPersona?: string
  ): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      // 메시지 데이터 준비
      const messageData = {
        content: content.trim(),
        room_id: roomId,
        sender_id: user.id,
        message_type: messageType,
        ai_persona: aiPersona,
        created_at: new Date().toISOString()
      };

      // 1. 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      const tempMessage: ExtendedMessage = {
        id: `temp-${Date.now()}`,
        ...messageData,
        updated_at: messageData.created_at,
        profiles: {
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'You',
          email: user.email || '',
          avatar_url: null,
          status: 'online',
          id: 'temp-profile',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      setMessages(prev => [...prev, tempMessage]);

      // 2. 서버에 메시지 전송
      const { data: savedMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        // 에러 발생시 임시 메시지 제거
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        throw error;
      }

      // 3. 임시 메시지를 실제 메시지로 교체
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...savedMessage, profiles: tempMessage.profiles }
            : msg
        )
      );

      // 4. 채팅방 업데이트 시간 갱신
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      return true;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: "메시지 전송 실패",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // 친구 추가 (단순화된 버전)
  const addFriendSimple = useCallback(async (email: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Adding friend:', email);

      // 1. 사용자 찾기
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError || !targetUser) {
        throw new Error('사용자를 찾을 수 없습니다');
      }

      if (targetUser.user_id === user.id) {
        throw new Error('본인은 추가할 수 없습니다');
      }

      console.log('Target user found:', targetUser);

      // 2. 중복 확인
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.user_id}),and(requester_id.eq.${targetUser.user_id},addressee_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      if (existingFriendship) {
        throw new Error('이미 친구입니다');
      }

      console.log('No existing friendship found');

      // 3. 친구 추가
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUser.user_id,
          status: 'accepted'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.code === '23505') {
          throw new Error('이미 친구 요청이 존재합니다');
        }
        throw new Error(`친구 추가 실패: ${insertError.message}`);
      }

      console.log('Friend added successfully');

      // 4. 로컬 상태 업데이트
      const newFriend = {
        ...targetUser,
        friendship_status: 'accepted' as const,
        avatar_url: null,
        status: 'offline'
      } as ExtendedProfile;
      
      setFriends(prev => [...prev, newFriend]);

      // 5. 친구 목록 새로고침
      await fetchFriends();

      toast({
        title: "친구 추가 완료",
        description: `친구가 성공적으로 추가되었습니다`
      });

      return true;

    } catch (error: any) {
      console.error('친구 추가 실패:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('duplicate key')) {
        errorMessage = '이미 친구로 추가된 사용자입니다.';
      }
      
      toast({
        title: "친구 추가 실패",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast, fetchFriends]);

  // 채팅방 나가기
  const leaveChatRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    // 에러 발생시 롤백을 위해 현재 채팅방 정보 백업
    const currentChatRooms = chatRooms;
    const currentSelectedRoom = selectedRoomId;
    const currentMessages = messages;

    try {
      console.log('🚪 채팅방 나가기 시작:', { roomId, userId: user.id });

      // 0. 즉시 로컬 상태에서 채팅방 제거 (낙관적 업데이트)
      setChatRooms(prev => prev.filter(room => room.id !== roomId));
      
      // 현재 선택된 채팅방이면 선택 해제
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
      }

      // 1. 해당 채팅방의 참여자 정보 확인
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('room_id', roomId);

      if (participantError) {
        throw participantError;
      }

      // 2. 현재 사용자를 참여자에서 제거
      const { error: removeError } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (removeError) {
        throw removeError;
      }

      console.log('✅ 채팅방 참여자에서 제거됨');

      // 3. 남은 참여자가 있는지 확인
      const remainingParticipants = participantData?.filter(p => p.user_id !== user.id) || [];
      
      // 4. 남은 참여자가 없으면 채팅방과 메시지들을 완전히 삭제
      if (remainingParticipants.length === 0) {
        console.log('🗑️ 마지막 참여자였으므로 채팅방 완전 삭제');
        
        // 메시지 먼저 삭제
        const { error: messagesDeleteError } = await supabase
          .from('messages')
          .delete()
          .eq('room_id', roomId);

        if (messagesDeleteError) {
          console.warn('메시지 삭제 중 오류:', messagesDeleteError);
        }

        // 채팅방 삭제
        const { error: roomDeleteError } = await supabase
          .from('chat_rooms')
          .delete()
          .eq('id', roomId);

        if (roomDeleteError) {
          throw roomDeleteError;
        }

        console.log('✅ 채팅방 완전 삭제됨');
      } else {
        // 남은 참여자가 있는 경우에도 나간 사용자에게는 채팅방이 보이지 않아야 함
        console.log('✅ 채팅방에서 나가기 완료 (다른 참여자 존재)');
      }

      // 5. 채팅방 목록 새로고침 (서버 상태와 동기화)
      setTimeout(() => {
        fetchChatRooms();
      }, 500);

      toast({
        title: "채팅방 나가기 완료",
        description: remainingParticipants.length === 0 
          ? "채팅방이 완전히 삭제되었습니다." 
          : "채팅방에서 나갔습니다."
      });

      return true;

    } catch (error: any) {
      console.error('채팅방 나가기 실패:', error);
      
      // 에러 발생시 상태 롤백
      setChatRooms(currentChatRooms);
      if (currentSelectedRoom === roomId) {
        setSelectedRoomId(currentSelectedRoom);
        setMessages(currentMessages);
      }
      
      toast({
        title: "채팅방 나가기 실패",
        description: `채팅방을 나가는데 문제가 발생했습니다: ${error.message}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [user, toast, selectedRoomId, fetchChatRooms, chatRooms, messages]);

  // 채팅방 생성
  const createChatRoom = useCallback(async (
    participantIds: string[],
    isGroup: boolean = false,
    name?: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      // 새 채팅방 생성
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          created_by: user.id,
          is_group: isGroup,
          name: name || null
        })
        .select()
        .single();

      if (roomError) {
        throw roomError;
      }

      // 참여자 추가 (본인 포함)
      const allParticipants = [user.id, ...participantIds];
      const participants = allParticipants.map(userId => ({
        room_id: room.id,
        user_id: userId
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) {
        throw participantsError;
      }

      // 채팅방 목록 새로고침
      await fetchChatRooms();

      toast({
        title: "채팅방 생성 완료",
        description: isGroup ? "그룹 채팅방이 생성되었습니다" : "새로운 채팅이 시작됩니다."
      });

      return room.id;
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      
      toast({
        title: "채팅방 생성 실패",
        description: `채팅방을 생성하는데 문제가 발생했습니다: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchChatRooms]);

  // 실시간 구독 설정
  useEffect(() => {
    if (!user) return;

    console.log('🔔 실시간 구독 설정 시작', { userId: user.id, selectedRoomId });

    // 새 메시지 구독
    const messageChannel = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('📨 새 메시지 수신:', payload.new);
          const newMessage = payload.new as Message;
          
          // 자신이 보낸 메시지가 아닌 경우에만 처리 (낙관적 업데이트로 이미 추가됨)
          if (newMessage.sender_id !== user.id) {
            // 현재 선택된 채팅방의 메시지인 경우 실시간 업데이트
            if (selectedRoomId && newMessage.room_id === selectedRoomId) {
              try {
                // 발신자 정보 조회
                const { data: senderProfile } = await supabase
                  .from('profiles')
                  .select('user_id, display_name, avatar_url, email')
                  .eq('user_id', newMessage.sender_id)
                  .maybeSingle();

                console.log('➕ 메시지 로컬 상태에 추가:', newMessage.id);
                setMessages(prev => {
                  // 중복 방지
                  const exists = prev.some(msg => msg.id === newMessage.id);
                  if (exists) return prev;
                  
                  return [...prev, {
                    ...newMessage,
                    profiles: senderProfile || undefined
                  } as ExtendedMessage];
                });
              } catch (error) {
                console.error('발신자 프로필 조회 실패:', error);
                // 프로필 정보 없이도 메시지는 표시
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === newMessage.id);
                  if (exists) return prev;
                  
                  return [...prev, {
                    ...newMessage,
                    profiles: undefined
                  } as ExtendedMessage];
                });
              }
            }
          }

          // 채팅방 목록 업데이트
          setChatRooms(prev => prev.map(room => 
            room.id === newMessage.room_id 
              ? { ...room, last_message: newMessage, updated_at: newMessage.created_at }
              : room
          ));
        }
      )
      .subscribe((status) => {
        console.log('📡 실시간 구독 상태:', status);
      });

    // 정리 함수
    return () => {
      console.log('🔕 실시간 구독 해제');
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, selectedRoomId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      const loadInitialData = async () => {
        setLoading(true);
        
        try {
          // 친구 목록과 채팅방을 병렬로 로드
          await Promise.allSettled([
            fetchFriends(),
            fetchChatRooms()
          ]);
        } catch (error) {
          console.error('초기 데이터 로딩 실패:', error);
        } finally {
          setLoading(false);
        }
      };

      // 약간의 지연을 두어 인증 완료 후 데이터 로드
      const timer = setTimeout(loadInitialData, 100);
      return () => clearTimeout(timer);
    } else {
      // user가 없으면 즉시 상태 초기화
      setChatRooms([]);
      setFriends([]);
      setMessages([]);
      setLoading(false);
    }
  }, [user?.id, fetchFriends, fetchChatRooms]);

  // 선택된 채팅방 변경시 메시지 로드
  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId);
    } else {
      setMessages([]);
    }
  }, [selectedRoomId, fetchMessages]);

  return {
    // 상태
    chatRooms,
    messages,
    friends,
    loading,
    selectedRoomId,
    setSelectedRoomId,
    
    // 함수
    sendMessage,
    createChatRoom,
    leaveChatRoom,
    sendFriendRequest: addFriendSimple, // sendFriendRequest를 addFriendSimple로 매핑
    addFriendSimple,
    fetchChatRooms,
    fetchMessages,
    fetchFriends
  };
};