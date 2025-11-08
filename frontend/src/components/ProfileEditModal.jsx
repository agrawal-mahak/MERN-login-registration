import React, { useRef } from 'react'

export const ProfileEditModal = ({
  isOpen,
  form,
  onChange,
  onSubmit,
  onClose,
  isSaving,
  profileImageUrl,
  profileImagePreview,
  removeProfileImage,
  onProfileImageSelect,
  onClearNewProfileImage,
  onRemoveProfileImage,
  onUndoRemoveProfileImage,
  profileImageInputKey,
}) => {
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const handleOpenFilePicker = () => {
    if (isSaving) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    if (isSaving) return
    onProfileImageSelect?.(event)
  }

  const handleClearNewImage = () => {
    if (isSaving) return
    onClearNewProfileImage?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveExistingImage = () => {
    if (isSaving) return
    onRemoveProfileImage?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUndoRemoveImage = () => {
    if (isSaving) return
    onUndoRemoveProfileImage?.()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4 py-6' onClick={handleOverlayClick}>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />
      <div className='relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5'>
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>Edit profile</h2>
            <p className='text-sm text-gray-500'>Update how others see you on Social Moments.</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition'
            aria-label='Close profile edit modal'
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='space-y-3'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Profile photo
            </label>
            <div className='border border-dashed border-gray-200 rounded-xl px-4 py-4 bg-gray-50/70'>
              {profileImagePreview ? (
                <div className='relative'>
                  <img
                    src={profileImagePreview}
                    alt='New profile preview'
                    className='w-24 h-24 rounded-full object-cover mx-auto'
                  />
                  <div className='flex justify-center gap-2 mt-3'>
                    <button
                      type='button'
                      onClick={handleClearNewImage}
                      disabled={isSaving}
                      className='px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      Remove
                    </button>
                    <button
                      type='button'
                      onClick={handleOpenFilePicker}
                      disabled={isSaving}
                      className='px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : removeProfileImage ? (
                <div className='flex flex-col items-center gap-3 text-sm text-gray-500'>
                  <span className='h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl'>
                    🙂
                  </span>
                  <p className='text-center text-xs text-gray-500'>
                    Your profile photo will be removed after you save changes.
                  </p>
                  <button
                    type='button'
                    onClick={handleUndoRemoveImage}
                    disabled={isSaving}
                    className='px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    Keep current photo
                  </button>
                </div>
              ) : profileImageUrl ? (
                <div className='flex flex-col items-center gap-3'>
                  <img
                    src={profileImageUrl}
                    alt='Current profile'
                    className='w-24 h-24 rounded-full object-cover'
                  />
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={handleOpenFilePicker}
                      disabled={isSaving}
                      className='px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      Change
                    </button>
                    <button
                      type='button'
                      onClick={handleRemoveExistingImage}
                      disabled={isSaving}
                      className='px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={handleOpenFilePicker}
                  disabled={isSaving}
                  className='flex flex-col items-center justify-center gap-2 text-sm text-gray-500 w-full disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  <span className='inline-flex items-center justify-center h-14 w-14 rounded-full bg-white text-gray-400 border border-gray-200 text-2xl'>
                    📷
                  </span>
                  <span className='font-medium'>Upload a profile photo</span>
                  <span className='text-xs text-gray-400'>JPG, PNG up to 5MB</span>
                </button>
              )}
              <input
                key={profileImageInputKey}
                ref={fileInputRef}
                type='file'
                name='profileImage'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label htmlFor='profile-username' className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Username
            </label>
            <input
              id='profile-username'
              name='username'
              type='text'
              value={form.username}
              onChange={onChange}
              className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm outline-none transition'
              placeholder='Enter your username'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='profile-email' className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Email
            </label>
            <input
              id='profile-email'
              name='email'
              type='email'
              value={form.email}
              onChange={onChange}
              className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm outline-none transition'
              placeholder='name@example.com'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='profile-password' className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
              New password
            </label>
            <input
              id='profile-password'
              name='password'
              type='password'
              value={form.password}
              onChange={onChange}
              className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm outline-none transition'
              placeholder='Leave blank to keep current password'
            />
          </div>

          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSaving}
              className='px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition'
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

