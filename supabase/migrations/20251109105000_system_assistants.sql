ALTER TABLE file_items 
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN metadata JSON; 

ALTER TABLE files
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE collections
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE collection_files
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE assistants
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE assistant_files
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE assistant_collections
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE assistant_tools
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE tools
    ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "Allow read access to public assistant_files"
    ON assistant_files
    FOR SELECT
    USING (user_id IS NULL);

CREATE POLICY "Allow read access to public assistant_collections"
    ON assistant_collections
    FOR SELECT
    USING (user_id IS NULL);

CREATE POLICY "Allow read access to public assistant_tools"
    ON assistant_tools
    FOR SELECT
    USING (user_id IS NULL);