-- SECTION 4: SECURITY POLICIES (Safe version without DROP statements)
-- Run this AFTER the safe schema setup

-- Enable RLS on tables first
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_file_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Allow full access to own profiles'
  ) THEN
    CREATE POLICY "Allow full access to own profiles"
      ON public.profiles FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Workspaces policies  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Allow full access to own workspaces'
  ) THEN
    CREATE POLICY "Allow full access to own workspaces"
      ON public.workspaces FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Chats policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chats' AND policyname = 'Allow full access to own chats'
  ) THEN
    CREATE POLICY "Allow full access to own chats"
      ON public.chats FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Messages policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Allow full access to own messages'
  ) THEN
    CREATE POLICY "Allow full access to own messages"
      ON public.messages FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Assistants policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assistants' AND policyname = 'Allow full access to own assistants'
  ) THEN
    CREATE POLICY "Allow full access to own assistants"
      ON public.assistants FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Files policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'files' AND policyname = 'Allow full access to own files'
  ) THEN
    CREATE POLICY "Allow full access to own files"
      ON public.files FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Folders policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'folders' AND policyname = 'Allow full access to own folders'
  ) THEN
    CREATE POLICY "Allow full access to own folders"
      ON public.folders FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Prompts policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prompts' AND policyname = 'Allow full access to own prompts'
  ) THEN
    CREATE POLICY "Allow full access to own prompts"
      ON public.prompts FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Presets policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'presets' AND policyname = 'Allow full access to own presets'
  ) THEN
    CREATE POLICY "Allow full access to own presets"
      ON public.presets FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Tools policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tools' AND policyname = 'Allow full access to own tools'
  ) THEN
    CREATE POLICY "Allow full access to own tools"
      ON public.tools FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Collections policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'collections' AND policyname = 'Allow full access to own collections'
  ) THEN
    CREATE POLICY "Allow full access to own collections"
      ON public.collections FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Junction table policies (these reference other tables via user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assistant_files' AND policyname = 'Allow access to own assistant files'
  ) THEN
    CREATE POLICY "Allow access to own assistant files"
      ON public.assistant_files FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM assistants a 
          WHERE a.id = assistant_files.assistant_id 
          AND a.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assistant_collections' AND policyname = 'Allow access to own assistant collections'
  ) THEN
    CREATE POLICY "Allow access to own assistant collections"
      ON public.assistant_collections FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM assistants a 
          WHERE a.id = assistant_collections.assistant_id 
          AND a.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assistant_tools' AND policyname = 'Allow access to own assistant tools'
  ) THEN
    CREATE POLICY "Allow access to own assistant tools"
      ON public.assistant_tools FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM assistants a 
          WHERE a.id = assistant_tools.assistant_id 
          AND a.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_files' AND policyname = 'Allow access to own chat files'
  ) THEN
    CREATE POLICY "Allow access to own chat files"
      ON public.chat_files FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM chats c 
          WHERE c.id = chat_files.chat_id 
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'collection_files' AND policyname = 'Allow access to own collection files'
  ) THEN
    CREATE POLICY "Allow access to own collection files"
      ON public.collection_files FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM collections c 
          WHERE c.id = collection_files.collection_id 
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'file_items' AND policyname = 'Allow access to own file items'
  ) THEN
    CREATE POLICY "Allow access to own file items"
      ON public.file_items FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_file_items' AND policyname = 'Allow access to own message file items'
  ) THEN
    CREATE POLICY "Allow access to own message file items"
      ON public.message_file_items FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- SECTION 5: AUTO-CREATE PROFILE & WORKSPACE FUNCTION
CREATE OR REPLACE FUNCTION public.create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Insert profile
    INSERT INTO public.profiles(
        user_id, has_onboarded, image_url, image_path, 
        display_name, bio, profile_context, use_azure_openai, username
    ) VALUES(
        NEW.id, FALSE, '', '', '', '', '', FALSE, random_username
    );

    -- Insert default workspace
    INSERT INTO public.workspaces(
        user_id, is_home, name, default_context_length, default_model, 
        default_prompt, default_temperature, description, embeddings_provider, 
        include_profile_context, include_workspace_instructions, instructions
    ) VALUES(
        NEW.id, TRUE, 'Home', 4096, 'gpt-4', 
        'You are a friendly, helpful AI assistant.', 0.5, 'My home workspace.', 
        'openai', TRUE, TRUE, ''
    );

    RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'create_profile_and_workspace_trigger'
    ) THEN
        CREATE TRIGGER create_profile_and_workspace_trigger
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE PROCEDURE public.create_profile_and_workspace();
    END IF;
END $$;