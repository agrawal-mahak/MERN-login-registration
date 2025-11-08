import React from 'react'
import { useNavigate } from 'react-router-dom'

const landingCardContent = [
  {
    id: 'friends',
    image:
      'https://as1.ftcdn.net/jpg/02/13/92/58/1000_F_213925838_bQuGEmOEVooo82rAneUpa6cWyWXjfi67.jpg',
    caption: 'Real laughs, no filters.',
    icon: '🩷',
  },
  {
    id: 'hangout',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    caption: 'Catch up after hours.',
    icon: '⭐',
  },
  {
    id: 'music',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
    caption: 'Vibes that stay with you.',
    icon: '🎧',
  },
]

export const Landing = () => {
  const navigate = useNavigate()

  const handleNavigateToLogin = () => {
    navigate('/login')
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#04010b] text-white'>
      <div className='pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-linear-to-br from-pink-500/30 via-purple-500/20 to-transparent blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-112 w-md rounded-full bg-linear-to-tr from-amber-400/30 via-pink-500/20 to-transparent blur-3xl' />

      {/* <header className='relative z-10 flex items-center justify-between px-6 py-8 sm:px-12'>
        <div className='flex items-center gap-3'>
          <span className='relative flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-linear-to-br from-pink-500 via-purple-500 to-orange-400 shadow-lg shadow-pink-500/40'>
            <span className='flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-black/60 text-lg font-semibold text-white'>
              IG
            </span>
          </span>
          <span className='text-lg font-semibold tracking-tight text-white/80'>Moments</span>
        </div>
        <div className='hidden text-sm font-medium text-white/60 sm:inline'>Log in to start sharing →</div>
      </header> */}

      <main className='relative z-10 mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center px-6 text-center sm:px-12 pt-18'>
        <div className='space-y-8'>
          <div className='space-y-4'>
            <p className='text-sm uppercase tracking-[0.35em] text-white/50'>Social moments</p>
            <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
              See everyday moments from your{' '}
              <span className='bg-linear-to-r from-pink-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent'>
                close friends.
              </span>
            </h1>
            <p className='mx-auto max-w-xl text-base text-white/60 sm:text-lg'>
              Catch up with the people you care about, swap stories, and share the highlights that make your day brighter.
            </p>
          </div>

          <div className='relative mx-auto mt-6 flex w-full max-w-3xl items-center justify-center'>
            <div className='absolute inset-x-10 bottom-0 h-44 rounded-full bg-linear-to-r from-pink-500/30 via-purple-500/20 to-amber-400/30 blur-3xl' />
            <div className='grid w-full gap-6 sm:grid-cols-3'>
              {landingCardContent.map((card, index) => {
                const positionClasses = [
                  'sm:-rotate-6 sm:-translate-y-3 sm:-translate-x-6',
                  'sm:translate-y-0 sm:z-10 drop-shadow-xl',
                  'sm:rotate-6 sm:-translate-y-1 sm:translate-x-6',
                ]
                return (
                  <div
                    key={card.id}
                    className={`relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:rotate-0 hover:border-white/10 hover:bg-white/10 ${positionClasses[index] || ''}`}
                  >
                    <div className='relative h-56 w-full'>
                      <img src={card.image} alt={card.caption} className='h-full w-full object-cover' loading='lazy' />
                      <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent' />
                      <div className='absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold'>
                        <span>{card.icon}</span>
                        <span>Now</span>
                      </div>
                      <p className='absolute bottom-4 left-4 right-4 text-left text-sm font-medium text-white/90'>
                        {card.caption}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='flex flex-col items-center gap-2 text-sm text-white/50 sm:flex-row sm:justify-center'>
            <span className='inline-flex items-center gap-2'>
              <span className='inline-block h-2 w-2 rounded-full bg-green-400' />
              Friends are sharing stories in real time
            </span>
            <span className='hidden h-px w-12 bg-white/10 sm:inline-block' />
            <button
              type='button'
              onClick={handleNavigateToLogin}
              className='inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white'
            >
              Tap the login button to join the conversation.
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

