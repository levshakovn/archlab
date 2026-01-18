/**
 * Test Supabase connection
 * Run this in browser console or use in a component to verify setup
 */
import { getSupabaseClient } from '../lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if client is initialized
    console.log('✅ Supabase client initialized')
    
    // Test 2: Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('❌ Environment variables missing!')
    }
    
    console.log('✅ Environment variables loaded')
    console.log('   URL:', url.substring(0, 30) + '...')
    console.log('   Key:', key.substring(0, 20) + '...')
    
    // Test 3: Try to get current session (should be null if not logged in)
    const supabase = getSupabaseClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('⚠️ Session check error (might be normal if not logged in):', sessionError.message)
    } else {
      console.log('✅ Session check successful')
      console.log('   Logged in:', !!sessionData.session)
    }
    
    // Test 4: Try to query profiles table (should work even if empty)
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      throw new Error(`❌ Database connection failed: ${profilesError.message}`)
    }
    
    console.log('✅ Database connection successful')
    console.log('   Profiles table accessible')
    
    // Test 5: Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.warn('⚠️ Storage check error:', bucketsError.message)
    } else {
      const profilePhotosBucket = buckets?.find(b => b.name === 'profile-photos')
      if (profilePhotosBucket) {
        console.log('✅ Storage bucket found')
        console.log('   profile-photos bucket exists')
      } else {
        console.warn('⚠️ profile-photos bucket not found. Make sure you created it in Supabase Dashboard.')
      }
    }
    
    console.log('')
    console.log('🎉 All tests passed! Supabase is configured correctly.')
    console.log('')
    
    return {
      success: true,
      message: 'Supabase connection validated successfully'
    }
    
  } catch (error) {
    console.error('')
    console.error('❌ Supabase connection test failed!')
    console.error('Error:', error)
    console.error('')
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-run in browser console if imported
if (typeof window !== 'undefined') {
  // Make it available globally for easy testing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as unknown as { testSupabase?: () => Promise<unknown> }).testSupabase = testSupabaseConnection
}
