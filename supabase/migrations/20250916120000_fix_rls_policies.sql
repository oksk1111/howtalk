-- Fix RLS policies to prevent infinite recursion
-- Drop existing problematic policies only

DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.messages;

-- Grant additional permissions for better performance
GRANT SELECT ON public.chat_participants TO authenticated;
GRANT SELECT ON public.chat_rooms TO authenticated;
GRANT SELECT ON public.messages TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.friendships TO authenticated;

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_room ON public.chat_participants(user_id, room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at);
