import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

// Get a single profile by user_id
export const getProfileByUserId = async (userId: string) => {
  console.log("🪵 getProfileByUserId called with:", userId)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile) {
    console.warn(`⚠️ No profile found for user_id: ${userId}`)
    return null
  }

  return profile
}

// Create a new profile
export const createProfile = async (profile: TablesInsert<"profiles">) => {
  console.log("🪵 createProfile called with:", profile)

  const { data: createdProfile, error } = await supabase
    .from("profiles")
    .insert([profile])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdProfile
}

// Update an existing profile by id
export const updateProfile = async (
  profileId: string,
  profile: TablesUpdate<"profiles">
) => {
  console.log("🪵 updateProfile called with:", profileId, profile)

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profileId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!updatedProfile) {
    console.warn(`⚠️ No profile updated for id: ${profileId}`)
    return null
  }

  return updatedProfile
}

// Delete a profile by id
export const deleteProfile = async (profileId: string) => {
  console.log("🪵 deleteProfile called with:", profileId)

  const { error } = await supabase.from("profiles").delete().eq("id", profileId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
