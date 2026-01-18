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

/**
 * Delete a user's profile photo
 * @param userId - The user's ID
 */
export async function deleteProfilePhoto(userId: string): Promise<void> {
  const supabase = getSupabaseClient()

  // Try to find and delete the photo (we don't know the exact extension)
  // List files in the bucket root
  const { data: files, error: listError } = await supabase.storage
    .from('profile-photos')
    .list('', {
      limit: 100,
      offset: 0,
    })

  if (listError) {
    // If bucket doesn't exist or other error, just return (photo might not exist)
    return
  }

  // Find files that start with userId
  if (files && files.length > 0) {
    const userFiles = files.filter(file => file.name.startsWith(`${userId}.`))
    if (userFiles.length > 0) {
      const filePaths = userFiles.map(file => file.name)
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove(filePaths)

      if (deleteError) {
        console.warn('Error deleting profile photo:', deleteError)
      }
    }
  }
}
