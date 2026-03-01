import { getSupabaseClient } from '../lib/supabase'

/**
 * Upload a profile photo for a user
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded photo
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const supabase = getSupabaseClient()

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be less than 5MB')
  }

  // Get file extension
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${userId}.${fileExt}`
  // Store directly in bucket root (not in a folder)
  const filePath = fileName

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      upsert: true, // Replace if exists
      contentType: file.type,
    })

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`)
  }

  // Get public URL
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)

  return data.publicUrl
}

