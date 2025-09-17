import { supabase } from '@/integrations/supabase/client';

export class ManualDatabaseCleanup {
  /**
   * 수동으로 데이터베이스 분석 및 정리
   */
  static async manualCleanup() {
    console.log('🧹 수동 데이터베이스 정리 시작...');
    
    try {
      // 1. 먼저 현재 상태 조회
      console.log('📊 1단계: 현재 데이터베이스 상태 조회');
      
      const profilesResponse = await supabase.from('profiles').select('*');
      const friendshipsResponse = await supabase.from('friendships').select('*');
      const chatRoomsResponse = await supabase.from('chat_rooms').select('*');
      const chatParticipantsResponse = await supabase.from('chat_participants').select('*');
      const messagesResponse = await supabase.from('messages').select('*');
      
      console.log('📈 테이블별 레코드 수:', {
        profiles: profilesResponse.data?.length || 0,
        friendships: friendshipsResponse.data?.length || 0,
        chat_rooms: chatRoomsResponse.data?.length || 0,
        chat_participants: chatParticipantsResponse.data?.length || 0,
        messages: messagesResponse.data?.length || 0
      });
      
      // 2. 고아 레코드 찾기 (외래키 무결성 체크)
      console.log('🔍 2단계: 고아 레코드 검출');
      
      const orphanedResults = await this.findOrphanedRecords();
      console.log('💀 고아 레코드:', orphanedResults);
      
      // 3. 중복 데이터 찾기
      console.log('🔍 3단계: 중복 데이터 검출');
      
      const duplicateResults = await this.findDuplicates();
      console.log('🔄 중복 데이터:', duplicateResults);
      
      // 4. 무효한 데이터 찾기
      console.log('🔍 4단계: 무효한 데이터 검출');
      
      const invalidResults = await this.findInvalidData();
      console.log('❌ 무효한 데이터:', invalidResults);
      
      // 5. 정리 작업 수행
      console.log('🧹 5단계: 실제 정리 작업 수행');
      
      const cleanupResults = await this.performCleanup(orphanedResults, duplicateResults, invalidResults);
      console.log('✅ 정리 완료:', cleanupResults);
      
      return {
        before: {
          profiles: profilesResponse.data?.length || 0,
          friendships: friendshipsResponse.data?.length || 0,
          chat_rooms: chatRoomsResponse.data?.length || 0,
          chat_participants: chatParticipantsResponse.data?.length || 0,
          messages: messagesResponse.data?.length || 0
        },
        orphaned: orphanedResults,
        duplicates: duplicateResults,
        invalid: invalidResults,
        cleanup: cleanupResults
      };
      
    } catch (error) {
      console.error('❌ 수동 정리 실패:', error);
      throw error;
    }
  }
  
  /**
   * 고아 레코드 찾기
   */
  static async findOrphanedRecords() {
    const results: any = {};
    
    try {
      // 존재하지 않는 user_id를 가진 friendships
      const { data: orphanedFriendships } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(id),
          addressee_profile:profiles!friendships_addressee_id_fkey(id)
        `);
      
      results.orphanedFriendships = orphanedFriendships?.filter(f => 
        !f.requester_profile || !f.addressee_profile
      ) || [];
      
      // 존재하지 않는 user_id를 가진 chat_participants
      const { data: orphanedParticipants } = await supabase
        .from('chat_participants')
        .select(`
          *,
          user_profile:profiles!chat_participants_user_id_fkey(id),
          chat_room:chat_rooms!chat_participants_room_id_fkey(id)
        `);
      
      results.orphanedParticipants = orphanedParticipants?.filter(p => 
        !p.user_profile || !p.chat_room
      ) || [];
      
      // 존재하지 않는 room_id나 sender_id를 가진 messages
      const { data: orphanedMessages } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(id),
          chat_room:chat_rooms!messages_room_id_fkey(id)
        `);
      
      results.orphanedMessages = orphanedMessages?.filter(m => 
        !m.sender_profile || !m.chat_room
      ) || [];
      
    } catch (error) {
      console.error('고아 레코드 검출 실패:', error);
      results.error = error;
    }
    
    return results;
  }
  
  /**
   * 중복 데이터 찾기
   */
  static async findDuplicates() {
    const results: any = {};
    
    try {
      // 중복 friendship (같은 사용자 쌍)
      // RPC 함수 사용 시도하지만 실패할 경우 수동 처리
      
      // 수동으로 중복 friendship 찾기
      const { data: allFriendships } = await supabase
        .from('friendships')
        .select('*');
      
      const friendshipPairs = new Map();
      const duplicates: any[] = [];
      
      allFriendships?.forEach(f => {
        const key1 = `${f.requester_id}-${f.addressee_id}`;
        const key2 = `${f.addressee_id}-${f.requester_id}`;
        
        if (friendshipPairs.has(key1) || friendshipPairs.has(key2)) {
          duplicates.push(f);
        } else {
          friendshipPairs.set(key1, f);
        }
      });
      
      results.duplicateFriendships = duplicates;
      
      // 수동으로 중복 participants 찾기
      const { data: allParticipants } = await supabase
        .from('chat_participants')
        .select('*');
      
      const participantKeys = new Map();
      const dupParticipants: any[] = [];
      
      allParticipants?.forEach(p => {
        const key = `${p.room_id}-${p.user_id}`;
        
        if (participantKeys.has(key)) {
          dupParticipants.push(p);
        } else {
          participantKeys.set(key, p);
        }
      });
      
      results.duplicateParticipants = dupParticipants;
      
    } catch (error) {
      console.error('중복 데이터 검출 실패:', error);
      results.error = error;
    }
    
    return results;
  }
  
  /**
   * 무효한 데이터 찾기
   */
  static async findInvalidData() {
    const results: any[] = [];
    
    try {
      // 무효한 이메일 형식의 profiles
      const { data: invalidEmails } = await supabase
        .from('profiles')
        .select('*')
        .or('email.is.null,email.eq.""');
      
      if (invalidEmails && invalidEmails.length > 0) {
        results.push({
          table: 'profiles',
          issue: 'invalid_email',
          count: invalidEmails.length,
          data: invalidEmails
        });
      }
      
      // 자기 자신과의 friendship
      const { data: selfFriendships } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', 'addressee_id');
      
      if (selfFriendships && selfFriendships.length > 0) {
        results.push({
          table: 'friendships',
          issue: 'self_friendship',
          count: selfFriendships.length,
          data: selfFriendships
        });
      }
      
      // 빈 메시지
      const { data: emptyMessages } = await supabase
        .from('messages')
        .select('*')
        .or('content.is.null,content.eq.""');
      
      if (emptyMessages && emptyMessages.length > 0) {
        results.push({
          table: 'messages',
          issue: 'empty_content',
          count: emptyMessages.length,
          data: emptyMessages
        });
      }
      
      // 참여자가 없는 채팅방
      const { data: emptyChatRooms } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          participants:chat_participants(count)
        `);
      
      const roomsWithoutParticipants = emptyChatRooms?.filter(room => 
        !room.participants || room.participants.length === 0
      ) || [];
      
      if (roomsWithoutParticipants.length > 0) {
        results.push({
          table: 'chat_rooms',
          issue: 'no_participants',
          count: roomsWithoutParticipants.length,
          data: roomsWithoutParticipants
        });
      }
      
    } catch (error) {
      console.error('무효한 데이터 검출 실패:', error);
      results.push({
        table: 'error',
        issue: 'detection_failed',
        count: 0,
        data: error
      });
    }
    
    return results;
  }
  
  /**
   * 실제 정리 작업 수행
   */
  static async performCleanup(orphaned: any, duplicates: any, invalid: any[]) {
    const results: any = {
      deleted: {
        orphanedFriendships: 0,
        orphanedParticipants: 0,
        orphanedMessages: 0,
        duplicateFriendships: 0,
        duplicateParticipants: 0,
        invalidData: 0
      },
      errors: []
    };
    
    try {
      // 고아 레코드 삭제
      if (orphaned.orphanedFriendships?.length > 0) {
        const ids = orphaned.orphanedFriendships.map((f: any) => f.id);
        const { error } = await supabase
          .from('friendships')
          .delete()
          .in('id', ids);
        
        if (error) {
          results.errors.push({ table: 'friendships', error });
        } else {
          results.deleted.orphanedFriendships = ids.length;
        }
      }
      
      if (orphaned.orphanedParticipants?.length > 0) {
        const ids = orphaned.orphanedParticipants.map((p: any) => p.id);
        const { error } = await supabase
          .from('chat_participants')
          .delete()
          .in('id', ids);
        
        if (error) {
          results.errors.push({ table: 'chat_participants', error });
        } else {
          results.deleted.orphanedParticipants = ids.length;
        }
      }
      
      if (orphaned.orphanedMessages?.length > 0) {
        const ids = orphaned.orphanedMessages.map((m: any) => m.id);
        const { error } = await supabase
          .from('messages')
          .delete()
          .in('id', ids);
        
        if (error) {
          results.errors.push({ table: 'messages', error });
        } else {
          results.deleted.orphanedMessages = ids.length;
        }
      }
      
      // 중복 데이터 삭제 (최신 것만 남기고)
      if (duplicates.duplicateFriendships?.length > 0) {
        const ids = duplicates.duplicateFriendships.map((f: any) => f.id);
        const { error } = await supabase
          .from('friendships')
          .delete()
          .in('id', ids);
        
        if (error) {
          results.errors.push({ table: 'duplicated_friendships', error });
        } else {
          results.deleted.duplicateFriendships = ids.length;
        }
      }
      
      if (duplicates.duplicateParticipants?.length > 0) {
        const ids = duplicates.duplicateParticipants.map((p: any) => p.id);
        const { error } = await supabase
          .from('chat_participants')
          .delete()
          .in('id', ids);
        
        if (error) {
          results.errors.push({ table: 'duplicated_participants', error });
        } else {
          results.deleted.duplicateParticipants = ids.length;
        }
      }
      
      // 무효한 데이터 삭제
      for (const invalidItem of invalid) {
        if (invalidItem.data && invalidItem.data.length > 0) {
          const ids = invalidItem.data.map((item: any) => item.id);
          const { error } = await supabase
            .from(invalidItem.table)
            .delete()
            .in('id', ids);
          
          if (error) {
            results.errors.push({ table: invalidItem.table, issue: invalidItem.issue, error });
          } else {
            results.deleted.invalidData += ids.length;
          }
        }
      }
      
    } catch (error) {
      console.error('정리 작업 실패:', error);
      results.errors.push({ general: error });
    }
    
    return results;
  }
}

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  (window as any).ManualDatabaseCleanup = ManualDatabaseCleanup;
}
