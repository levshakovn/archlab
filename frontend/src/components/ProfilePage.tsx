import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { useAuth } from '../hooks/useAuth'
import { useCompletions } from '../hooks/useCompletions'
import { usePuzzles } from '../hooks/usePuzzles'
import { uploadProfilePhoto } from '../services/userService'
import { UserAvatar } from './UserAvatar'
import { PhotoCropModal } from './PhotoCropModal'
import { PhotoViewModal } from './PhotoViewModal'
import { validatePassword } from '../utils/passwordValidation'

/**
 * Get color classes for score badge
 */
function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score === 100) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-400',
    }
  } else if (score >= 80) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-400',
    }
  } else {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-400',
    }
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, updateProfile, updatePassword, signOut, loading: authLoading } = useAuth()
  const { completions, loading: completionsLoading } = useCompletions()
  const { puzzles } = usePuzzles()
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
    }
  }, [profile])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      await updateProfile({
        first_name: firstName || null,
        last_name: lastName || null,
      })
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFirstName(profile?.first_name || '')
    setLastName(profile?.last_name || '')
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    // Validate file size (max 10MB for original - will be compressed during cropping)
    // The cropped image will be validated again before upload
    const maxSize = 10 * 1024 * 1024 // 10MB for original file
    if (file.size > maxSize) {
      setError('Image must be less than 10MB. Large images will be compressed during cropping.')
      return
    }

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file)
    setImageToCrop(imageUrl)
    setShowCropModal(true)
    setError(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    if (!user) return

    setError(null)
    setUploadingPhoto(true)
    setShowCropModal(false)

    // Clean up the object URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
      setImageToCrop(null)
    }

    try {
      const photoUrl = await uploadProfilePhoto(user.id, croppedFile)
      await updateProfile({ profile_photo_url: photoUrl })
      setSuccess('Profile photo updated successfully!')
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    // Clean up the object URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
      setImageToCrop(null)
    }
  }

  const handlePhotoClick = () => {
    if (profile?.profile_photo_url) {
      setShowViewModal(true)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect will happen automatically via auth state change
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
    }
  }

  const handlePasswordChange = async () => {
    setError(null)
    setSuccess(null)

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '))
      return
    }

    setChangingPassword(true)

    try {
      await updatePassword(newPassword)
      setSuccess('Password changed successfully!')
      setIsChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="User Profile - ArchLab"
        description="Manage your ArchLab profile, view your AWS architecture practice history, and track your progress across different puzzles."
        keywords="AWS practice profile, architecture learning progress, cloud certification tracking"
        type="profile"
      />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
        <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-primary/20">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-success/10 border-b border-success/20 rounded-t-xl">
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error/10 border-b border-error/20 rounded-t-xl">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Hero Header - Centered Avatar & Name */}
          <div className="p-8 pb-6 border-b border-gray-200">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div
                  onClick={handlePhotoClick}
                  className={`${profile?.profile_photo_url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                >
                  <UserAvatar size="xl" />
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {/* Photo upload overlay on hover */}
                {!uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="px-4 py-2 bg-white text-text-primary font-medium rounded-lg cursor-pointer text-sm hover:bg-gray-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 Change
                    </label>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary mb-1">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.first_name || profile?.email || 'User'}
                </h1>
                {(() => {
                  // Calculate completion percentage for level
                  const totalPuzzles = puzzles.length
                  const completedPuzzleIds = new Set(
                    completions
                      .filter(c => c.best_score === 100)
                      .map(c => c.puzzle_id)
                  )
                  const completedCount = completedPuzzleIds.size
                  const percentage = totalPuzzles > 0 ? Math.round((completedCount / totalPuzzles) * 100) : 0
                  
                  // Get level based on completion percentage
                  const getLevel = (percent: number) => {
                    if (percent === 100) return { name: "Cloud Overlord 👑", emoji: "👑", color: "text-yellow-600" }
                    if (percent >= 95) return { name: "AWS Master 🏆", emoji: "🏆", color: "text-purple-600" }
                    if (percent >= 75) return { name: "Cloud Guru 🌟", emoji: "🌟", color: "text-blue-600" }
                    if (percent >= 50) return { name: "Senior Cloud Architect ⭐", emoji: "⭐", color: "text-green-600" }
                    if (percent >= 25) return { name: "Cloud Architect ☁️", emoji: "☁️", color: "text-teal-600" }
                    if (percent >= 5) return { name: "Junior Cloud Engineer 🚀", emoji: "🚀", color: "text-primary" }
                    return { name: "On-Prem Guy 🏢", emoji: "🏢", color: "text-gray-600" }
                  }
                  
                  const level = getLevel(percentage)
                  
                  return (
                    <div className={`mt-2 text-sm font-medium ${level.color} flex items-center justify-center gap-1.5`}>
                      <span>{level.emoji}</span>
                      <span>{level.name}</span>
                    </div>
                  )
                })()}
                <p className="text-sm text-text-secondary mt-2">{profile?.email || user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="px-8 pt-6 pb-8 border-b border-gray-200">
            {(() => {
              const totalPuzzles = puzzles.length
              // Only count puzzles with 100% best_score as completed
              const completedPuzzleIds = new Set(
                completions
                  .filter(c => c.best_score === 100)
                  .map(c => c.puzzle_id)
              )
              const completedCount = completedPuzzleIds.size
              const percentage = totalPuzzles > 0 ? Math.round((completedCount / totalPuzzles) * 100) : 0
              
              // Determine color based on progress
              const getProgressColor = () => {
                if (percentage === 100) return { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-400' }
                if (percentage >= 75) return { bg: 'bg-green-400', text: 'text-green-700', border: 'border-green-300' }
                if (percentage >= 50) return { bg: 'bg-yellow-400', text: 'text-yellow-700', border: 'border-yellow-300' }
                if (percentage >= 25) return { bg: 'bg-orange-400', text: 'text-orange-700', border: 'border-orange-300' }
                return { bg: 'bg-gray-400', text: 'text-gray-700', border: 'border-gray-300' }
              }
              const colors = getProgressColor()

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-medium text-text-primary">Overall Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
                      <span className="text-sm text-text-secondary">({completedCount}/{totalPuzzles})</span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Profile Information Section */}
          <div className="p-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Details</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-medium text-text-secondary mb-1.5">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={saving}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-medium text-text-secondary mb-1.5">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={saving}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1">
                    Email
                    <span className="text-xs" title="Email cannot be changed">🔒</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-text-secondary cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-2 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-medium text-text-secondary mb-1.5">First Name</div>
                    <div className="text-text-primary font-medium">{profile?.first_name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-secondary mb-1.5">Last Name</div>
                    <div className="text-text-primary font-medium">{profile?.last_name || '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1">
                    Email
                    <span className="text-xs" title="Email cannot be changed">🔒</span>
                  </div>
                  <div className="text-text-primary font-medium">{profile?.email || user?.email || '—'}</div>
                </div>
              </div>
            )}

            {/* Password subsection within Details */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium text-text-secondary">Password</div>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <span>🔑</span>
                    <span>Change</span>
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changingPassword}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Must include: 8+ chars, lowercase, uppercase, digit, symbol
                    </p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={changingPassword}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                      placeholder="Confirm new password"
                      minLength={8}
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Changing...' : 'Update Password'}
                    </button>
                    <button
                      onClick={handleCancelPasswordChange}
                      disabled={changingPassword}
                      className="px-4 py-2 text-sm border-2 border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-secondary">••••••••</div>
              )}
            </div>
          </div>

          {/* Task History */}
          <div className="p-8 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
              {completions.length > 5 && (
                <span className="text-xs text-text-secondary">Last 5</span>
              )}
            </div>
            {completionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : completions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-text-secondary">No completed tasks yet. Start solving puzzles to see your progress here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...completions]
                  .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                  .slice(0, 5)
                  .map((completion) => {
                  const puzzle = puzzles.find((p) => p.id === completion.puzzle_id)
                  const puzzleTitle = puzzle?.title || completion.puzzle_id
                  const scoreColors = getScoreColor(completion.best_score)
                  const completedDate = new Date(completion.completed_at)
                  const formattedDate = completedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <button
                      key={completion.id}
                      onClick={() => navigate('/workspace', { state: { puzzleId: completion.puzzle_id } })}
                      className="w-full text-left p-4 bg-gray-50/50 hover:bg-gray-100/50 border border-gray-200 rounded-lg hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary mb-1 truncate group-hover:text-primary transition-colors">{puzzleTitle}</h3>
                          <p className="text-xs text-text-secondary">{formattedDate}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border-2 ${scoreColors.bg} ${scoreColors.border} flex-shrink-0`}>
                          <span className={`text-sm font-bold ${scoreColors.text}`}>
                            {completion.best_score}%
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="p-8">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors font-medium"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>

      {/* Photo Crop Modal */}
      {imageToCrop && (
        <PhotoCropModal
          isOpen={showCropModal}
          imageSrc={imageToCrop}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Photo View Modal */}
      {profile?.profile_photo_url && (
        <PhotoViewModal
          isOpen={showViewModal}
          imageSrc={profile.profile_photo_url}
          onClose={() => setShowViewModal(false)}
        />
      )}
      </div>
    </>
  )
}
