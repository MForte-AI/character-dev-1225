import { db } from "@/lib/database/client"

export interface Profile {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  bio: string
  has_onboarded: boolean
  image_url: string
  image_path: string
  profile_context: string
  display_name: string
  use_azure_openai: boolean
  username: string
  anthropic_api_key: string
  azure_openai_35_turbo_id: string
  azure_openai_45_turbo_id: string
  azure_openai_45_vision_id: string
  azure_openai_api_key: string
  azure_openai_endpoint: string
  google_gemini_api_key: string
  mistral_api_key: string
  openai_api_key: string
  openai_organization_id: string
  perplexity_api_key: string
  groq_api_key: string
  openrouter_api_key: string
}

export const getProfileByUserId = async (userId: string): Promise<Profile> => {
  const { rows } = await db.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId]
  )
  
  if (rows.length === 0) {
    throw new Error('Profile not found')
  }
  
  return rows[0]
}

export const getProfilesByUserId = async (userId: string): Promise<Profile[]> => {
  const { rows } = await db.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId]
  )
  
  return rows
}

export const createProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const {
    user_id,
    display_name,
    username,
    bio = '',
    profile_context = '',
    use_azure_openai = false,
    has_onboarded = false,
    image_url = '',
    image_path = '',
    anthropic_api_key = '',
    azure_openai_35_turbo_id = '',
    azure_openai_45_turbo_id = '',
    azure_openai_45_vision_id = '',
    azure_openai_api_key = '',
    azure_openai_endpoint = '',
    google_gemini_api_key = '',
    mistral_api_key = '',
    openai_api_key = '',
    openai_organization_id = '',
    perplexity_api_key = '',
    groq_api_key = '',
    openrouter_api_key = ''
  } = profile
  
  const { rows } = await db.query(
    `INSERT INTO profiles (
      user_id, display_name, username, bio, profile_context, use_azure_openai, 
      has_onboarded, image_url, image_path, anthropic_api_key, azure_openai_35_turbo_id,
      azure_openai_45_turbo_id, azure_openai_45_vision_id, azure_openai_api_key,
      azure_openai_endpoint, google_gemini_api_key, mistral_api_key, openai_api_key,
      openai_organization_id, perplexity_api_key, groq_api_key, openrouter_api_key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
    RETURNING *`,
    [
      user_id, display_name, username, bio, profile_context, use_azure_openai,
      has_onboarded, image_url, image_path, anthropic_api_key, azure_openai_35_turbo_id,
      azure_openai_45_turbo_id, azure_openai_45_vision_id, azure_openai_api_key,
      azure_openai_endpoint, google_gemini_api_key, mistral_api_key, openai_api_key,
      openai_organization_id, perplexity_api_key, groq_api_key, openrouter_api_key
    ]
  )
  
  return rows[0]
}

export const updateProfile = async (
  profileId: string,
  profile: Partial<Profile>
): Promise<Profile> => {
  const fields = Object.keys(profile).filter(key => key !== 'id' && key !== 'created_at')
  const values = fields.map(key => profile[key as keyof Profile])
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  
  if (setClause === '') {
    throw new Error('No fields to update')
  }
  
  const { rows } = await db.query(
    `UPDATE profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 RETURNING *`,
    [profileId, ...values]
  )
  
  if (rows.length === 0) {
    throw new Error('Profile not found')
  }
  
  return rows[0]
}

export const deleteProfile = async (profileId: string): Promise<boolean> => {
  const { rowCount } = await db.query(
    'DELETE FROM profiles WHERE id = $1',
    [profileId]
  )
  
  if (rowCount === 0) {
    throw new Error('Profile not found')
  }
  
  return true
}
