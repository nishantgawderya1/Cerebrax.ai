import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { X, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='flex flex-col items-start justify-start h-screen'>
      {/* Compact, narrow navbar with big logo */}
      <nav className='w-full px-1 sm:px-14 max-h-[90px] py-0 flex items-center justify-between border-b border-gray-200'>
        <img
          src={assets.logo1}
          alt="logo"
          onClick={() => navigate('/')}
          className="h-50 cursor-pointer object-contain"
          style={{ maxWidth: '100%' }}
        />
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        )}
      </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-80px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} user={user} />
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
