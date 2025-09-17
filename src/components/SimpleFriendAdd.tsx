import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const SimpleFriendAdd = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const addFriend = async () => {
    if (!user || !email) return;
    
    setLoading(true);
    console.log('🚀 간단한 친구 추가 시작:', email);

    try {
      // 1. 사용자 찾기
      console.log('🔍 사용자 검색...');
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name')
        .ilike('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        console.error('❌ 사용자 검색 실패:', userError);
        throw new Error('사용자를 찾을 수 없습니다');
      }

      console.log('✅ 사용자 찾음:', targetUser);

      // 2. 친구 관계 생성
      console.log('💾 친구 관계 생성...');
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUser.user_id,
          status: 'accepted'
        });

      if (insertError) {
        console.error('❌ 친구 관계 생성 실패:', insertError);
        if (insertError.code === '23505') {
          throw new Error('이미 친구입니다');
        }
        throw insertError;
      }

      console.log('✅ 친구 추가 성공!');
      
      toast({
        title: "성공!",
        description: `${targetUser.display_name || targetUser.email}님이 친구로 추가되었습니다!`
      });
      
      setEmail('');
      
    } catch (error: any) {
      console.error('❌ 친구 추가 실패:', error);
      toast({
        title: "실패",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-3">간단한 친구 추가 테스트</h3>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="친구 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Button 
          onClick={addFriend}
          disabled={!email || loading}
        >
          {loading ? '추가 중...' : '친구 추가'}
        </Button>
      </div>
    </div>
  );
};
