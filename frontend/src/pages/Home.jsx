import React from 'react'
import toast from 'react-hot-toast'

export const Home = ({ user }) => {
  const handleEditProfile = () => {
    toast.success('Edit Profile feature coming soon!')
    // Navigate to edit profile page when implemented
    // navigate('/profile/edit')
  }

  const handleSecuritySettings = () => {
    toast.success('Security Settings feature coming soon!')
    // Navigate to security settings page when implemented
    // navigate('/security')
  }

  const handleViewActivity = () => {
    toast.success('Activity Log feature coming soon!')
    // Navigate to activity page when implemented
    // navigate('/activity')
  }

  const handleAccountStatus = () => {
    toast.success('Your account is verified and active!', {
      icon: '✅',
    })
  }

  const handleSecurity = () => {
    toast.success('Your account is protected with JWT authentication!', {
      icon: '🔒',
    })
  }

  const handleSessions = () => {
    toast.success('You have an active session!', {
      icon: '👤',
    })
  }

  const handleProfileCardClick = () => {
    toast.success('Click "Edit Profile" below to update your information!')
  }

  const handleWelcomeBannerClick = () => {
    toast('Welcome! Explore all the features above.', {
      icon: '👋',
      duration: 3000,
    })
  }
  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-4xl font-bold text-gray-800'>Welcome</h1>
        <p className='text-lg mt-4 text-gray-600'>Please log in to access your dashboard</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Welcome back, {user.username}! 👋
          </h1>
          <p className='text-lg text-gray-600'>
            Here's what's happening with your account today.
          </p>
        </div>

        {/* User Info Card */}
        <div 
          className='bg-white rounded-lg shadow-md p-6 mb-6 cursor-pointer hover:shadow-lg transition-shadow'
          onClick={handleProfileCardClick}
        >
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Profile Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 mb-1'>Username</span>
              <span className='text-lg font-medium text-gray-900'>{user.username}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 mb-1'>Email Address</span>
              <span className='text-lg font-medium text-gray-900'>{user.email}</span>
            </div>
            {user.createdAt && (
              <div className='flex flex-col'>
                <span className='text-sm text-gray-500 mb-1'>Member Since</span>
                <span className='text-lg font-medium text-gray-900'>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            <div className='flex flex-col'>
              <span className='text-sm text-gray-500 mb-1'>Account Status</span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div 
            className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all transform'
            onClick={handleAccountStatus}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-100 text-sm font-medium'>Account Status</p>
                <p className='text-2xl font-bold mt-1'>Verified</p>
              </div>
              <div className='bg-white bg-opacity-20 rounded-full p-3'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all transform'
            onClick={handleSecurity}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-100 text-sm font-medium'>Security</p>
                <p className='text-2xl font-bold mt-1'>Protected</p>
              </div>
              <div className='bg-white bg-opacity-20 rounded-full p-3'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className='bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all transform'
            onClick={handleSessions}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-100 text-sm font-medium'>Sessions</p>
                <p className='text-2xl font-bold mt-1'>Active</p>
              </div>
              <div className='bg-white bg-opacity-20 rounded-full p-3'>
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div 
              className='border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer active:scale-95'
              onClick={handleEditProfile}
            >
              <div className='flex items-center space-x-3'>
                <div className='bg-blue-100 rounded-lg p-2'>
                  <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Edit Profile</h3>
                  <p className='text-sm text-gray-500'>Update your information</p>
                </div>
              </div>
            </div>

            <div 
              className='border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer active:scale-95'
              onClick={handleSecuritySettings}
            >
              <div className='flex items-center space-x-3'>
                <div className='bg-green-100 rounded-lg p-2'>
                  <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Security Settings</h3>
                  <p className='text-sm text-gray-500'>Manage your security</p>
                </div>
              </div>
            </div>

            <div 
              className='border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer active:scale-95'
              onClick={handleViewActivity}
            >
              <div className='flex items-center space-x-3'>
                <div className='bg-purple-100 rounded-lg p-2'>
                  <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>View Activity</h3>
                  <p className='text-sm text-gray-500'>Check your activity log</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div 
          className='mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-xl transition-all'
          onClick={handleWelcomeBannerClick}
        >
          <div className='flex items-center space-x-4'>
            <div className='bg-white bg-opacity-20 rounded-full p-3'>
              <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <h3 className='text-xl font-semibold mb-1'>Welcome to Your Dashboard</h3>
              <p className='text-indigo-100'>
                You're all set! Your account is active and secure. Explore the features above to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
