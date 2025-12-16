-- SECTION 4: SECURITY POLICIES
-- Run this AFTER the safe schema setup

-- Profiles policies
DROP POLICY IF EXISTS "Allow full access to own profiles" ON profiles;
CREATE POLICY "Allow full access to own profiles"
    ON profiles
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Workspaces policies  
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON workspaces;
CREATE POLICY "Allow full access to own workspaces"
    ON workspaces
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Chats policies
DROP POLICY IF EXISTS "Allow full access to own chats" ON chats;
CREATE POLICY "Allow full access to own chats"
    ON chats
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Messages policies
DROP POLICY IF EXISTS "Allow full access to own messages" ON messages;
CREATE POLICY "Allow full access to own messages"
    ON messages
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- SECTION 5: AUTO-CREATE PROFILE & WORKSPACE
CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    INSERT INTO public.profiles(
        user_id, has_onboarded, image_url, image_path, 
        display_name, bio, profile_context, use_azure_openai, username
    ) VALUES(
        NEW.id, FALSE, '', '', '', '', '', FALSE, random_username
    );

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

DROP TRIGGER IF EXISTS create_profile_and_workspace_trigger ON auth.users;
CREATE TRIGGER create_profile_and_workspace_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.create_profile_and_workspace();