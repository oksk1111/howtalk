import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import DatabaseCleanup from '@/utils/databaseCleanup';

export const DatabaseDebugger = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDatabaseCheck = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 데이터베이스 전체 검사 시작...');
      
      // 1. 테이블 현황 조회
      const tableStatus = await DatabaseCleanup.getAllTableStatus();
      
      // 2. 중복 데이터 검출
      const duplicates = await DatabaseCleanup.findDuplicateData();
      
      // 3. 잘못된 데이터 검출
      const invalidData = await DatabaseCleanup.findInvalidData();
      
      // 4. 현재 사용자 데이터 (로그인된 경우)
      let userFriends = null;
      let userChatRooms = null;
      if (user) {
        userFriends = await DatabaseCleanup.getUserFriends(user.id);
        userChatRooms = await DatabaseCleanup.getUserChatRooms(user.id);
      }
      
      const checkResults = {
        tableStatus,
        duplicates,
        invalidData,
        userFriends,
        userChatRooms,
        timestamp: new Date().toISOString()
      };
      
      setResults(checkResults);
      console.log('✅ 데이터베이스 검사 완료:', checkResults);
      
    } catch (error) {
      console.error('❌ 데이터베이스 검사 실패:', error);
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const runDatabaseCleanup = async () => {
    if (!confirm('정말로 데이터베이스를 정리하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const cleanupResults = await DatabaseCleanup.cleanupDatabase();
      console.log('🧹 데이터베이스 정리 완료:', cleanupResults);
      
      // 정리 후 다시 검사
      await runDatabaseCheck();
      
    } catch (error) {
      console.error('❌ 데이터베이스 정리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 데이터베이스 디버거</CardTitle>
          <div className="text-sm text-gray-600">
            현재 사용자: {user ? `${user.email} (${user.id})` : '로그인되지 않음'}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDatabaseCheck} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? '검사 중...' : '데이터베이스 검사'}
            </Button>
            <Button 
              onClick={runDatabaseCleanup} 
              disabled={isLoading || !results}
              variant="destructive"
            >
              데이터베이스 정리
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            ⚠️ 이 도구는 개발 목적으로만 사용하세요. 실제 운영 환경에서는 사용하지 마세요.
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          {/* 테이블 현황 */}
          {results.tableStatus && (
            <Card>
              <CardHeader>
                <CardTitle>📊 테이블 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(results.tableStatus).map(([key, table]: [string, any]) => (
                    <div key={key} className="border rounded p-4">
                      <div className="font-semibold">{table.name}</div>
                      <div className="text-sm text-gray-600">
                        총 {table.totalCount}개 레코드
                      </div>
                      <Badge variant={table.status === 'success' ? 'default' : 'destructive'}>
                        {table.status}
                      </Badge>
                      {table.sampleData && table.sampleData.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer">샘플 데이터</summary>
                          <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(table.sampleData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 중복 데이터 */}
          {results.duplicates && (
            <Card>
              <CardHeader>
                <CardTitle>🔍 중복 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(results.duplicates).map(([key, dups]: [string, any]) => (
                  <div key={key} className="mb-4">
                    <div className="font-semibold">{key}</div>
                    <div className="text-sm text-gray-600">
                      {dups?.length || 0}개 중복 발견
                    </div>
                    {dups && dups.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">중복 목록</summary>
                        <pre className="text-xs mt-1 bg-red-50 p-2 rounded overflow-auto">
                          {JSON.stringify(dups, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 잘못된 데이터 */}
          {results.invalidData && results.invalidData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>⚠️ 잘못된 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                {results.invalidData.map((issue: any, index: number) => (
                  <div key={index} className="mb-4 p-4 border-l-4 border-red-500 bg-red-50">
                    <div className="font-semibold">{issue.table} - {issue.issue}</div>
                    <div className="text-sm text-gray-600">{issue.count}개 문제 발견</div>
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">상세 정보</summary>
                      <pre className="text-xs mt-1 bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(issue.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 사용자 친구 목록 */}
          {results.userFriends && (
            <Card>
              <CardHeader>
                <CardTitle>👥 현재 사용자 친구 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-2">
                  총 {results.userFriends.length}명의 친구
                </div>
                {results.userFriends.length > 0 ? (
                  <div className="space-y-2">
                    {results.userFriends.map((friend: any, index: number) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-semibold">
                          {friend.display_name || friend.email}
                        </div>
                        <div className="text-gray-600">ID: {friend.user_id}</div>
                        <div className="text-gray-600">
                          친구 상태: {friend.friendship_status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">친구가 없습니다.</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 사용자 채팅방 목록 */}
          {results.userChatRooms && (
            <Card>
              <CardHeader>
                <CardTitle>💬 현재 사용자 채팅방 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-2">
                  총 {results.userChatRooms.length}개의 채팅방
                </div>
                {results.userChatRooms.length > 0 ? (
                  <div className="space-y-2">
                    {results.userChatRooms.map((room: any, index: number) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-semibold">
                          {room.name || `채팅방 ${room.id.substring(0, 8)}`}
                        </div>
                        <div className="text-gray-600">
                          {room.is_group ? '그룹 채팅' : '1:1 채팅'}
                        </div>
                        <div className="text-gray-600">
                          참여자: {room.chat_participants?.length || 0}명
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">채팅방이 없습니다.</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 에러 정보 */}
          {results.error && (
            <Card>
              <CardHeader>
                <CardTitle>❌ 오류</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-red-50 p-4 rounded overflow-auto">
                  {results.error}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseDebugger;
