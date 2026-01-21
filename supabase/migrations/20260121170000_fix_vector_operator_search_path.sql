-- Ensure vector operators resolve for retrieval RPCs under service_role.

create or replace function match_file_items_local (
  query_embedding vector(384),
  match_count int DEFAULT null,
  file_ids UUID[] DEFAULT null
) returns table (
  id UUID,
  file_id UUID,
  content TEXT,
  tokens INT,
  similarity float
)
language plpgsql
set search_path = extensions, public
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    file_id,
    content,
    tokens,
    1 - (file_items.local_embedding OPERATOR(extensions.<=>) query_embedding)
      as similarity
  from file_items
  where (file_id = ANY(file_ids))
  order by file_items.local_embedding OPERATOR(extensions.<=>) query_embedding
  limit match_count;
end;
$$;

create or replace function match_file_items_openai (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  file_ids UUID[] DEFAULT null
) returns table (
  id UUID,
  file_id UUID,
  content TEXT,
  tokens INT,
  similarity float
)
language plpgsql
set search_path = extensions, public
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    file_id,
    content,
    tokens,
    1 - (file_items.openai_embedding OPERATOR(extensions.<=>) query_embedding)
      as similarity
  from file_items
  where (file_id = ANY(file_ids))
  order by file_items.openai_embedding OPERATOR(extensions.<=>) query_embedding
  limit match_count;
end;
$$;
