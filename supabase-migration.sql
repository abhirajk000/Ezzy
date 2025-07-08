-- Create the pastes table
CREATE TABLE IF NOT EXISTS public.pastes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pastes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read pastes
CREATE POLICY "Anyone can view pastes" ON public.pastes
    FOR SELECT USING (true);

-- Create a policy that allows anyone to insert pastes
CREATE POLICY "Anyone can insert pastes" ON public.pastes
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to update pastes (for view counts)
CREATE POLICY "Anyone can update pastes" ON public.pastes
    FOR UPDATE USING (true);

-- Create a policy that allows anyone to delete pastes
CREATE POLICY "Anyone can delete pastes" ON public.pastes
    FOR DELETE USING (true);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS pastes_created_at_idx ON public.pastes(created_at DESC);

-- Enable real-time subscriptions for the pastes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pastes;

-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_views(paste_id UUID)
RETURNS TABLE(id UUID, title TEXT, content TEXT, created_at TIMESTAMPTZ, views INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE pastes 
  SET views = views + 1 
  WHERE pastes.id = paste_id;
  
  RETURN QUERY 
  SELECT pastes.id, pastes.title, pastes.content, pastes.created_at, pastes.views 
  FROM pastes 
  WHERE pastes.id = paste_id;
END;
$$;