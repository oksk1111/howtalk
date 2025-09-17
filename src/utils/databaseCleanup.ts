import { supabase } from '@/integrations/supabase/client';

// 데이터베이스 정리 및 검토 유틸리티
export class DatabaseCleanup {
  
  // 1. 모든 테이블의 데이터 현황 조회
  static async getAllTableStatus() {
    try {
      console.log('📊 데이터베이스 테이블 현황 조회 시작...');
      
      const results = {
        profiles: await this.getTableInfo('profiles'),
        friendships: await this.getTableInfo('friendships'),
        chat_rooms: await this.getTableInfo('chat_rooms'),
        chat_participants: await this.getTableInfo('chat_participants'),
        messages: await this.getTableInfo('messages')
      };
      
      console.log('📊 전체 테이블 현황:', results);
      return results;
    } catch (error) {
      console.error('❌ 테이블 현황 조회 실패:', error);
      return null;
    }
  }
  
  // 특정 테이블 정보 조회
  static async getTableInfo(tableName: 'profiles' | 'friendships' | 'chat_rooms' | 'chat_participants' | 'messages') {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(5); // 샘플 데이터만 가져오기
        
      if (error) throw error;
      
      return {
        name: tableName,
        totalCount: count,
        sampleData: data,
        status: 'success'
      };
    } catch (error) {
      return {
        name: tableName,
        totalCount: 0,
        sampleData: [],
        status: 'error',
        error: error
      };
    }
  }
  
  // 2. 중복 데이터 검출
  static async findDuplicateData() {
    try {
      console.log('🔍 중복 데이터 검출 시작...');
      
      // 친구관계 중복 검사
      const { data: duplicateFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id, status, created_at')
        .order('requester_id, addressee_id, created_at');
      
      // 채팅 참여자 중복 검사
      const { data: duplicateParticipants } = await supabase
        .from('chat_participants')
        .select('room_id, user_id, created_at')
        .order('room_id, user_id, created_at');
      
      const duplicates = {
        friendships: this.findDuplicatesInArray(duplicateFriendships || [], ['requester_id', 'addressee_id']),
        participants: this.findDuplicatesInArray(duplicateParticipants || [], ['room_id', 'user_id'])
      };
      
      console.log('🔍 중복 데이터 검출 결과:', duplicates);
      return duplicates;
    } catch (error) {
      console.error('❌ 중복 데이터 검출 실패:', error);
      return null;
    }
  }
  
  // 배열에서 중복 데이터 찾기
  static findDuplicatesInArray(data: any[], keys: string[]) {
    const seen = new Map();
    const duplicates = [];
    
    for (const item of data) {
      const key = keys.map(k => item[k]).join('|');
      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: item });
      } else {
        seen.set(key, item);
      }
    }
    
    return duplicates;
  }
  
  // 3. 잘못된 데이터 검출
  static async findInvalidData() {
    try {
      console.log('⚠️ 잘못된 데이터 검출 시작...');
      
      const issues = [];
      
      // 프로필 데이터 검증
      const { data: invalidProfiles } = await supabase
        .from('profiles')
        .select('*')
        .or('email.is.null,display_name.is.null,user_id.is.null');
      
      if (invalidProfiles && invalidProfiles.length > 0) {
        issues.push({
          table: 'profiles',
          issue: 'null_required_fields',
          count: invalidProfiles.length,
          data: invalidProfiles
        });
      }
      
      // 친구관계 데이터 검증 (자기 자신과의 친구관계)
      const { data: selfFriendships } = await supabase
        .from('friendships')
        .select('*')
        .filter('requester_id', 'eq', 'addressee_id');
      
      if (selfFriendships && selfFriendships.length > 0) {
        issues.push({
          table: 'friendships',
          issue: 'self_friendship',
          count: selfFriendships.length,
          data: selfFriendships
        });
      }
      
      // 존재하지 않는 사용자 참조 검사
      const { data: orphanedFriendships } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(user_id),
          addressee:profiles!friendships_addressee_id_fkey(user_id)
        `);
      
      const orphaned = orphanedFriendships?.filter(f => !f.requester || !f.addressee) || [];
      if (orphaned.length > 0) {
        issues.push({
          table: 'friendships',
          issue: 'orphaned_references',
          count: orphaned.length,
          data: orphaned
        });
      }
      
      console.log('⚠️ 잘못된 데이터 검출 결과:', issues);
      return issues;
    } catch (error) {
      console.error('❌ 잘못된 데이터 검출 실패:', error);
      return [];
    }
  }
  
  // 4. 데이터 정리 실행
  static async cleanupDatabase() {
    try {
      console.log('🧹 데이터베이스 정리 시작...');
      
      const results = [];
      
      // 중복 친구관계 제거
      const duplicateFriendships = await this.findDuplicateData();
      if (duplicateFriendships?.friendships?.length > 0) {
        for (const dup of duplicateFriendships.friendships) {
          const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', dup.duplicate.id);
          
          if (!error) {
            results.push(`Removed duplicate friendship: ${dup.duplicate.id}`);
          }
        }
      }
      
      // 자기 자신과의 친구관계 제거
      const { error: selfFriendError } = await supabase
        .from('friendships')
        .delete()
        .filter('requester_id', 'eq', 'addressee_id');
      
      if (!selfFriendError) {
        results.push('Removed self-friendships');
      }
      
      // 존재하지 않는 사용자 참조 제거
      const { error: orphanError } = await supabase
        .from('friendships')
        .delete()
        .not('requester_id', 'in', `(SELECT user_id FROM profiles)`)
        .not('addressee_id', 'in', `(SELECT user_id FROM profiles)`);
      
      if (!orphanError) {
        results.push('Removed orphaned friendship references');
      }
      
      console.log('🧹 데이터 정리 완료:', results);
      return results;
    } catch (error) {
      console.error('❌ 데이터 정리 실패:', error);
      return [];
    }
  }
  
  // 5. 현재 사용자의 친구 데이터 조회
  static async getUserFriends(userId: string) {
    try {
      console.log(`👥 사용자 ${userId}의 친구 데이터 조회...`);
      
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(user_id, email, display_name),
          addressee:profiles!friendships_addressee_id_fkey(user_id, email, display_name)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      const friends = friendships?.map(f => {
        const friend = f.requester_id === userId ? f.addressee : f.requester;
        return {
          ...friend,
          friendship_id: f.id,
          friendship_status: f.status,
          created_at: f.created_at
        };
      }) || [];
      
      console.log(`👥 사용자 ${userId}의 친구 목록:`, friends);
      return friends;
    } catch (error) {
      console.error('❌ 사용자 친구 데이터 조회 실패:', error);
      return [];
    }
  }
  
  // 6. 현재 사용자의 채팅방 데이터 조회
  static async getUserChatRooms(userId: string) {
    try {
      console.log(`💬 사용자 ${userId}의 채팅방 데이터 조회...`);
      
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner (
            user_id,
            profiles (user_id, email, display_name)
          ),
          messages (content, created_at)
        `)
        .eq('chat_participants.user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`💬 사용자 ${userId}의 채팅방 목록:`, chatRooms);
      return chatRooms || [];
    } catch (error) {
      console.error('❌ 사용자 채팅방 데이터 조회 실패:', error);
      return [];
    }
  }
}

// 브라우저에서 디버깅용으로 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).DatabaseCleanup = DatabaseCleanup;
  console.log('🛠️ DatabaseCleanup 유틸리티가 추가되었습니다.');
  console.log('사용법:');
  console.log('- DatabaseCleanup.getAllTableStatus(): 모든 테이블 현황');
  console.log('- DatabaseCleanup.findDuplicateData(): 중복 데이터 검출');
  console.log('- DatabaseCleanup.findInvalidData(): 잘못된 데이터 검출');
  console.log('- DatabaseCleanup.cleanupDatabase(): 데이터 정리 실행');
  console.log('- DatabaseCleanup.getUserFriends(userId): 사용자 친구 목록');
  console.log('- DatabaseCleanup.getUserChatRooms(userId): 사용자 채팅방 목록');
}

export default DatabaseCleanup;
