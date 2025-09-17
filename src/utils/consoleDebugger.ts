// 브라우저 콘솔에서 직접 실행할 수 있는 데이터베이스 디버깅 명령어들

// 타입 확장
declare global {
  interface Window {
    supabase: any;
    checkDatabaseStatus: () => Promise<any>;
    checkMyFriends: () => Promise<any>;
    checkMyChatRooms: () => Promise<any>;
    findDuplicateData: () => Promise<any>;
  }
}

// 간단한 데이터베이스 현황 조회
async function checkDatabaseStatus() {
  console.log('🔍 데이터베이스 현황 조회 중...');
  
  try {
    const { supabase } = window as any;
    if (!supabase) {
      console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
      return;
    }
    
    // 각 테이블별 레코드 수 조회
    const tables = ['profiles', 'friendships', 'chat_rooms', 'chat_participants', 'messages'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error(`❌ ${table} 테이블 조회 실패:`, error);
          results[table] = { error: error.message };
        } else {
          results[table] = { count };
        }
      } catch (err) {
        console.error(`❌ ${table} 테이블 조회 예외:`, err);
        results[table] = { error: err.message };
      }
    }
    
    console.log('📊 데이터베이스 현황:', results);
    return results;
    
  } catch (error) {
    console.error('❌ 데이터베이스 현황 조회 실패:', error);
  }
}

// 현재 사용자의 친구 목록 조회
async function checkMyFriends() {
  console.log('👥 현재 사용자 친구 목록 조회 중...');
  
  try {
    const { supabase } = window as any;
    if (!supabase) {
      console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
      return;
    }
    
    // 현재 사용자 정보 가져오기
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      console.error('❌ 로그인된 사용자가 없습니다.');
      return;
    }
    
    console.log('👤 현재 사용자:', user.user.email);
    
    // 친구 목록 조회
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester_profile:profiles!friendships_requester_id_fkey(id, email, display_name),
        addressee_profile:profiles!friendships_addressee_id_fkey(id, email, display_name)
      `)
      .or(`requester_id.eq.${user.user.id},addressee_id.eq.${user.user.id}`)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('❌ 친구 목록 조회 실패:', error);
      return;
    }
    
    console.log('📋 친구 관계 원시 데이터:', friendships);
    
    // 친구 목록 정리
    const friends = friendships?.map(friendship => {
      const iAmRequester = friendship.requester_id === user.user.id;
      const friend = iAmRequester ? friendship.addressee_profile : friendship.requester_profile;
      
      return {
        id: friend?.id,
        email: friend?.email,
        display_name: friend?.display_name,
        friendship_id: friendship.id,
        friendship_status: friendship.status,
        created_at: friendship.created_at
      };
    }) || [];
    
    console.log('👥 정리된 친구 목록:', friends);
    return friends;
    
  } catch (error) {
    console.error('❌ 친구 목록 조회 실패:', error);
  }
}

// 현재 사용자의 채팅방 목록 조회
async function checkMyChatRooms() {
  console.log('💬 현재 사용자 채팅방 목록 조회 중...');
  
  try {
    const { supabase } = window as any;
    if (!supabase) {
      console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
      return;
    }
    
    // 현재 사용자 정보 가져오기
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      console.error('❌ 로그인된 사용자가 없습니다.');
      return;
    }
    
    console.log('👤 현재 사용자:', user.user.email);
    
    // 참여 중인 채팅방 목록 조회
    const { data: chatRooms, error } = await supabase
      .from('chat_participants')
      .select(`
        *,
        chat_room:chat_rooms!chat_participants_room_id_fkey(
          id,
          name,
          is_group,
          created_at
        )
      `)
      .eq('user_id', user.user.id);
    
    if (error) {
      console.error('❌ 채팅방 목록 조회 실패:', error);
      return;
    }
    
    console.log('📋 채팅방 참여 원시 데이터:', chatRooms);
    
    // 채팅방 목록 정리
    const rooms = chatRooms?.map(participant => ({
      room_id: participant.chat_room?.id,
      room_name: participant.chat_room?.name,
      is_group: participant.chat_room?.is_group,
      joined_at: participant.joined_at,
      room_created_at: participant.chat_room?.created_at
    })) || [];
    
    console.log('💬 정리된 채팅방 목록:', rooms);
    return rooms;
    
  } catch (error) {
    console.error('❌ 채팅방 목록 조회 실패:', error);
  }
}

// 중복 데이터 찾기
async function findDuplicateData() {
  console.log('🔍 중복 데이터 검색 중...');
  
  try {
    const { supabase } = window as any;
    if (!supabase) {
      console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
      return;
    }
    
    // 중복 friendship 찾기
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*');
    
    const friendshipPairs = new Map();
    const duplicateFriendships = [];
    
    friendships?.forEach(f => {
      const key1 = `${f.requester_id}-${f.addressee_id}`;
      const key2 = `${f.addressee_id}-${f.requester_id}`;
      
      if (friendshipPairs.has(key1) || friendshipPairs.has(key2)) {
        duplicateFriendships.push(f);
      } else {
        friendshipPairs.set(key1, f);
      }
    });
    
    // 중복 chat_participants 찾기
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('*');
    
    const participantKeys = new Map();
    const duplicateParticipants = [];
    
    participants?.forEach(p => {
      const key = `${p.room_id}-${p.user_id}`;
      
      if (participantKeys.has(key)) {
        duplicateParticipants.push(p);
      } else {
        participantKeys.set(key, p);
      }
    });
    
    const results = {
      duplicateFriendships,
      duplicateParticipants
    };
    
    console.log('🔄 중복 데이터 검색 결과:', results);
    return results;
    
  } catch (error) {
    console.error('❌ 중복 데이터 검색 실패:', error);
  }
}

// 전역 함수로 설정
if (typeof window !== 'undefined') {
  window.checkDatabaseStatus = checkDatabaseStatus;
  window.checkMyFriends = checkMyFriends;
  window.checkMyChatRooms = checkMyChatRooms;
  window.findDuplicateData = findDuplicateData;
  
  console.log(`
🔧 데이터베이스 디버깅 도구가 준비되었습니다!

사용 가능한 명령어:
- checkDatabaseStatus() : 전체 데이터베이스 현황 조회
- checkMyFriends() : 현재 사용자의 친구 목록 조회
- checkMyChatRooms() : 현재 사용자의 채팅방 목록 조회
- findDuplicateData() : 중복 데이터 검색

예시:
await checkDatabaseStatus();
await checkMyFriends();
  `);
}

export { checkDatabaseStatus, checkMyFriends, checkMyChatRooms, findDuplicateData };
