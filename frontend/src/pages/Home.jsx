import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const relativeTimeFromNow = (dateInput) => {
  if (!dateInput) return 'just now'

  const date = new Date(dateInput)
  const now = Date.now()
  const diff = Math.floor((now - date.getTime()) / 1000)

  if (Number.isNaN(diff) || diff < 0) return 'just now'
  if (diff < 60) return `${Math.max(diff, 1)}s ago`

  const intervals = [
    { label: 'm', seconds: 60 },
    { label: 'h', seconds: 60 * 60 },
    { label: 'd', seconds: 60 * 60 * 24 },
    { label: 'w', seconds: 60 * 60 * 24 * 7 },
  ]

  for (let i = intervals.length - 1; i >= 0; i -= 1) {
    const interval = Math.floor(diff / intervals[i].seconds)
    if (interval >= 1) {
      return `${interval}${intervals[i].label} ago`
    }
  }

  const months = Math.floor(diff / (60 * 60 * 24 * 30))
  if (months >= 1) return `${months}mo ago`

  const years = Math.floor(diff / (60 * 60 * 24 * 365))
  if (years >= 1) return `${years}y ago`

  return 'just now'
}

const getGradientForIndex = (index) => {
  const gradients = [
    'from-pink-500 via-red-500 to-yellow-500',
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-lime-500 via-emerald-500 to-teal-500',
    'from-sky-500 via-blue-500 to-indigo-500',
  ]

  return gradients[index % gradients.length]
}

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((chunk) => chunk.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const Home = ({ user }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPosts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setFetchError(null)
      const token = localStorage.getItem('token')

      const response = await axios.get('/api/posts', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      })

      setPosts(response.data?.posts ?? [])
    } catch (error) {
      setFetchError(error.response?.data?.message || 'Unable to load feed right now.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const storyItems = useMemo(() => {
    if (!posts.length) {
      return Array.from({ length: 8 }).map((_, index) => ({
        id: `placeholder-${index}`,
        name: index === 0 && user ? user.username : `Story ${index + 1}`,
        initials: index === 0 && user ? getInitials(user.username) : `S${index + 1}`,
        isUser: index === 0,
        gradient: getGradientForIndex(index),
      }))
    }

    return posts.slice(0, 10).map((post, index) => ({
      id: post._id || index,
      name: post.author_id?.username || 'Creator',
      initials: getInitials(post.author_id?.username || 'C'),
      isUser: post.author_id?._id === user?._id,
      gradient: getGradientForIndex(index),
    }))
  }, [posts, user])

  const suggestedCreators = useMemo(() => {
    const fallback = [
      { id: '1', name: 'Design Daily', description: 'Creative sparks every day' },
      { id: '2', name: 'Code Stories', description: 'Full-stack snippets & tips' },
      { id: '3', name: 'Mindful Moves', description: 'Wellness & active living' },
    ]

    if (!posts.length) return fallback

    const uniqueAuthors = posts.reduce((acc, post) => {
      const authorId = post.author_id?._id
      if (!authorId || authorId === user?._id) return acc
      if (acc.some((item) => item.id === authorId)) return acc

      acc.push({
        id: authorId,
        name: post.author_id?.username || 'Creator',
        description: post.title || 'New on your feed',
      })
      return acc
    }, [])

    return uniqueAuthors.slice(0, 5).concat(fallback).slice(0, 5)
  }, [posts, user])

  const handleCreatePost = async (event) => {
    event.preventDefault()

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Add a title and something to share before posting!')
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error('You need to be logged in to post.')
        return
      }

      const response = await axios.post(
        '/api/posts',
        {
          title: newPost.title.trim(),
          content: newPost.content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success('Shared to your feed!')
      setNewPost({ title: '', content: '' })

      if (response.data?.post) {
        setPosts((prev) => [response.data.post, ...prev])
      } else {
        fetchPosts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not share your post. Try again!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBoostProfile = () => {
    toast.success('Profile boosted! More people will see your next post.', { icon: '🚀' })
  }

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 text-center'>
        <h1 className='text-4xl sm:text-5xl font-bold tracking-tight mb-4'>Share moments with the community</h1>
        <p className='text-base sm:text-lg text-slate-300 max-w-lg mb-6'>
          Log in to discover posts, create your own stories, and connect with people just like you.
        </p>
        <p className='text-sm text-slate-400'>Tap the login button on the top right to get started.</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100/60 py-8 px-4 sm:px-6 lg:px-10'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-8 flex flex-col gap-2'>
          <span className='uppercase tracking-[0.4em] text-xs text-gray-500'>Daily Feed</span>
          <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900'>Welcome back, {user.username}</h1>
          <p className='text-gray-500 text-sm sm:text-base'>Catch up with creators you follow and share something new.</p>
        </header>

        <section className='mb-10'>
          <div className='flex items-center gap-2 mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>Stories</h2>
            <span className='text-xs font-medium text-pink-500'>LIVE</span>
          </div>
          <div className='overflow-x-auto flex gap-5 pb-2 scrollbar-thin scrollbar-thumb-gray-300'>
            {storyItems.map((story, index) => (
              <button
                key={story.id || index}
                type='button'
                className='flex flex-col items-center space-y-2 focus:outline-none'
              >
                <span
                  className={`relative h-20 w-20 rounded-full p-[3px] bg-linear-to-tr ${story.gradient}`}
                >
                  <span className='absolute inset-0 rounded-full bg-white/20 blur-sm' />
                  <span className='relative h-full w-full flex items-center justify-center rounded-full bg-white text-gray-800 font-semibold text-xl'>
                    {story.initials}
                  </span>
                  {story.isUser && (
                    <span className='absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl'>
                      +
                    </span>
                  )}
                </span>
                <span className='text-xs font-medium text-gray-600 max-w-[80px] truncate'>{story.name}</span>
              </button>
            ))}
          </div>
        </section>

        <main className='grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-8'>
          <div className='space-y-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 backdrop-blur-sm'>
              <div className='flex gap-3'>
                <div className='h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold text-lg'>
                  {getInitials(user.username)}
                </div>
                <form onSubmit={handleCreatePost} className='flex-1 space-y-4'>
                  <input
                    type='text'
                    value={newPost.title}
                    onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Give your post a catchy title..."
                    className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition-colors'
                  />
                  <textarea
                    rows={3}
                    value={newPost.content}
                    onChange={(event) => setNewPost((prev) => ({ ...prev, content: event.target.value }))}
                    placeholder="What's happening today? Share a thought, a win, or something inspiring."
                    className='w-full border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition-colors resize-none'
                  />
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2 text-sm text-gray-400'>
                      <span className='bg-gray-100 text-gray-500 px-3 py-1 rounded-full'>#moments</span>
                      <span className='bg-gray-100 text-gray-500 px-3 py-1 rounded-full'>#daily</span>
                      <span className='hidden sm:inline bg-gray-100 text-gray-500 px-3 py-1 rounded-full'>#community</span>
                    </div>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='inline-flex items-center gap-2 bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition'
                    >
                      {isSubmitting ? 'Sharing…' : 'Share'}
                    </button>
              </div>
                </form>
              </div>
            </div>

            <div className='space-y-5'>
              {loading && (
                <div className='space-y-3'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='bg-white rounded-2xl shadow-sm p-6 animate-pulse'>
                      <div className='flex items-center gap-4 mb-4'>
                        <div className='h-12 w-12 rounded-full bg-gray-200' />
                        <div className='flex-1 space-y-2'>
                          <div className='h-3 w-1/3 bg-gray-200 rounded-full' />
                          <div className='h-3 w-1/4 bg-gray-200 rounded-full' />
                        </div>
                      </div>
                      <div className='h-48 rounded-xl bg-gray-200' />
                    </div>
                  ))}
                </div>
              )}

              {fetchError && !loading && (
                <div className='bg-white border border-red-100 rounded-2xl p-6 text-red-500 text-sm'>
                  {fetchError}
                  <button
                    type='button'
                    onClick={fetchPosts}
                    className='ml-3 text-red-600 underline font-medium'
                  >
                    Try again
                  </button>
          </div>
              )}

              {!loading && !posts.length && !fetchError && (
                <div className='bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center space-y-3'>
                  <h3 className='text-xl font-semibold text-gray-800'>Your feed is waiting</h3>
                  <p className='text-gray-500 text-sm'>Follow more creators or share something to see it appear here.</p>
                  <button
                    type='button'
                    onClick={handleBoostProfile}
                    className='inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition'
                  >
                    Boost your profile
                  </button>
              </div>
              )}

              {posts.map((post, index) => {
                const authorName = post.author_id?.username || 'Unknown creator'
                const createdLabel = relativeTimeFromNow(post.createdAt)
                const backgroundGradient = getGradientForIndex(index)

                return (
                  <article key={post._id || index} className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <header className='flex items-center gap-4 px-6 py-4'>
                      <div className={`h-12 w-12 rounded-full bg-linear-to-br ${backgroundGradient} text-white flex items-center justify-center font-semibold text-lg`}>
                        {getInitials(authorName)}
              </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900'>{authorName}</h3>
                        <p className='text-xs text-gray-500'>{createdLabel}</p>
            </div>
                      <button type='button' className='text-gray-400 hover:text-gray-600'>
                        <span className='text-lg'>•••</span>
                      </button>
                    </header>

                    <div className={`h-64 bg-linear-to-br ${backgroundGradient} relative flex items-end justify-start p-6`}> 
                      <div className='absolute inset-0 bg-black/10 mix-blend-multiply' />
                      <h2 className='relative text-white text-2xl font-bold drop-shadow-lg max-w-[70%]'>
                        {post.title}
                      </h2>
          </div>

                    <section className='px-6 py-5 space-y-4'>
                      <p className='text-gray-700 leading-relaxed whitespace-pre-line'>{post.content}</p>
                      <div className='flex items-center justify-between text-xs text-gray-400'>
                        <span>❤️ {Math.floor(Math.random() * 90) + 10}</span>
                        <span>💬 {Math.floor(Math.random() * 20)}</span>
                        <span>🔁 {Math.floor(Math.random() * 10)}</span>
              </div>
                    </section>
                  </article>
                )
              })}
          </div>
        </div>

          <aside className='space-y-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold text-lg'>
                  {getInitials(user.username)}
                </div>
                <div>
                  <p className='font-semibold text-gray-900'>{user.username}</p>
                  <p className='text-xs text-gray-500'>{user.email}</p>
                </div>
              </div>
              <button
                type='button'
                onClick={handleBoostProfile}
                className='w-full text-sm font-semibold border border-gray-200 rounded-xl py-2 hover:border-gray-300 transition'
              >
                Edit profile
              </button>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Suggested for you</h3>
              <div className='space-y-4'>
                {suggestedCreators.map((creator) => (
                  <div key={creator.id} className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold'>
                        {getInitials(creator.name)}
                </div>
                <div>
                        <p className='font-medium text-gray-800 text-sm'>{creator.name}</p>
                        <p className='text-xs text-gray-400 max-w-[160px]'>{creator.description}</p>
                      </div>
                    </div>
                    <button type='button' className='text-xs font-semibold text-blue-500'>Follow</button>
                </div>
                ))}
              </div>
              <button type='button' className='text-xs text-gray-400 underline'>See all suggestions</button>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3 text-xs text-gray-400'>
              <p>© {new Date().getFullYear()} Social Moments</p>
              <div className='flex gap-3'>
                <button type='button' className='hover:text-gray-600'>About</button>
                <button type='button' className='hover:text-gray-600'>Help</button>
                <button type='button' className='hover:text-gray-600'>API</button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
