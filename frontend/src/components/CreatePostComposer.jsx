import React, { useEffect, useRef, useState } from 'react'
import { createPost } from '../api/postApi'
import toast from 'react-hot-toast'

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((chunk) => chunk.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

export const CreatePostComposer = ({
  user,
  onPostCreated,
  onPostCreatedFallback,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (!user) return null

  const resetComposer = () => {
    setForm({ title: '', content: '' })
    setImageFile(null)
    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetComposer()
    setIsOpen(false)
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, etc.).')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.')
      event.target.value = ''
      return
    }

    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return URL.createObjectURL(file)
    })
    setImageFile(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Add a title and something to share before posting!')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('You need to be logged in to post.')
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append('title', form.title.trim())
      formData.append('content', form.content.trim())
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const data = await createPost(formData, token)

      toast.success('Shared to your feed!')

      const createdPost = data?.post
      if (createdPost) {
        onPostCreated?.(createdPost)
      } else {
        onPostCreatedFallback?.()
      }

      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not share your post. Try again!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 backdrop-blur-sm max-w-xl w-full transition-all'>
      {isOpen ? (
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='flex items-start gap-3'>
            <div
              className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-lg ${
                user?.profileImageUrl
                  ? ''
                  : 'bg-linear-to-br from-blue-500 to-indigo-500 text-white'
              }`}
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.username} avatar`}
                  className='h-full w-full object-cover'
                />
              ) : (
                getInitials(user.username)
              )}
            </div>
            <div className='flex-1 space-y-4'>
              <input
                type='text'
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Give your post a catchy title..."
                className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition-colors'
              />
              <textarea
                rows={3}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="What's happening today? Share a thought, a win, or something inspiring."
                className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition-colors resize-none'
              />
              <div className='border border-dashed border-gray-300 rounded-xl px-4 py-4 bg-gray-50/60'>
                {imagePreview ? (
                  <div className='relative overflow-hidden rounded-lg' style={{ aspectRatio: '1 / 1' }}>
                    <img
                      src={imagePreview}
                      alt='Selected preview'
                      className='absolute inset-0 w-full h-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition'
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor='post-image-upload'
                    className='flex flex-col items-center justify-center h-32 text-sm text-gray-500 gap-2 cursor-pointer hover:text-gray-700'
                  >
                  <span className='inline-flex items-center justify-center h-14 w-14 rounded-full bg-white text-gray-400 text-2xl border border-gray-200'>
                      📷
                    </span>
                    <span className='font-medium'>Add a cover image (optional)</span>
                    <span className='text-xs text-gray-400'>JPG, PNG up to 5MB</span>
                    <input
                      id='post-image-upload'
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                )}
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex gap-2 text-sm text-gray-400'>
                  <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full'>#moments</span>
                  <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full'>#daily</span>
                  <span className='hidden sm:inline bg-blue-50 text-blue-600 px-3 py-1 rounded-full'>#community</span>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={handleClose}
                    className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='inline-flex items-center gap-2 bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
                  >
                    {isSubmitting ? 'Sharing…' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          className='w-full flex items-center gap-4 text-left'
        >
          <div
            className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-lg ${
              user?.profileImageUrl ? '' : 'bg-linear-to-br from-blue-500 to-indigo-500 text-white'
            }`}
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.username} avatar`}
                className='h-full w-full object-cover'
              />
            ) : (
              getInitials(user.username)
            )}
          </div>
          <div className='flex-1 space-y-2'>
            <p className='text-sm font-semibold text-gray-900'>What’s new today, {user.username}?</p>
            <p className='text-sm text-gray-500'>
              Share a thought, a win, or something inspiring with the community.
            </p>
            <span className='inline-flex items-center gap-2 text-sm text-blue-500 font-medium'>
              <span>＋</span>
              Create a post
            </span>
          </div>
        </button>
      )}
    </div>
  )
}

CreatePostComposer.defaultProps = {
  onPostCreated: undefined,
  onPostCreatedFallback: undefined,
}


