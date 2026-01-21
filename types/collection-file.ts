export interface CollectionFile {
  id: string
  name: string
  type: string
  description?: string | null
  size?: number | null
  tokens?: number | null
  document_type?: string | null
  logline?: string | null
  genre?: string | null
  page_count?: number | null
}
