-- Add photo and AI caption support to save_events
ALTER TABLE public.save_events 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS ai_caption TEXT;

-- Create storage bucket for save snaps
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'save-snaps',
  'save-snaps',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for save-snaps bucket
CREATE POLICY "Users can upload their own save snaps"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'save-snaps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own save snaps"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'save-snaps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own save snaps"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'save-snaps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own save snaps"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'save-snaps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for viewing save snaps (for sharing)
CREATE POLICY "Public can view save snaps"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'save-snaps');

-- Add index for faster photo queries
CREATE INDEX IF NOT EXISTS idx_save_events_photo_url ON public.save_events(photo_url) WHERE photo_url IS NOT NULL;