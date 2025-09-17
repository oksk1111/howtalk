-- Fix chat_participants INSERT policy
-- Created at 2025-09-16 12:30:00

-- Drop existing policies for chat_participants
DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view all chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.chat_participants;

-- Create comprehensive policies for chat_participants
CREATE POLICY "Users can view all chat participants" ON public.chat_participants 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert chat participants" ON public.chat_participants 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their participation" ON public.chat_participants 
  FOR DELETE USING (auth.uid() = user_id);

-- Also ensure chat_rooms INSERT policy is correct
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Grant necessary permissions
GRANT INSERT ON public.chat_participants TO authenticated;
GRANT INSERT ON public.chat_rooms TO authenticated;
GRANT UPDATE ON public.chat_rooms TO authenticated;
