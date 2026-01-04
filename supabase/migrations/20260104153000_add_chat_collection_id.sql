-- Add optional collection_id to chats for grouping chats under a collection.
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS collection_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chats_collection_id_fkey'
  ) THEN
    ALTER TABLE public.chats
      ADD CONSTRAINT chats_collection_id_fkey
      FOREIGN KEY (collection_id)
      REFERENCES public.collections (id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chats_collection_id
  ON public.chats (collection_id);
