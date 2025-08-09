import React from 'react'
import { Outlet } from 'react-router-dom'
import { Gem, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Protect, useAuth } from '@clerk/clerk-react'
import Creationitem from '../components/Creationitem'
import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL


const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data.success) {
        setCreations(data.creations)
      }else{
        Toast.error(data.message || 'Failed to fetch creations')
      }
    } catch (error) {
      Toast.error(error.message || 'Failed to fetch creations')
    }
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className=' h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Total creations card*/}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-grey-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-x1 font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center'>
            <Sparkles className='w-5 text-white'/>
          </div>
        </div>
        {/* Add more cards as needed */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-grey-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-x1 font-semibold'>
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center'>
            <Gem className='w-5 text-white'/>
          </div>
        </div>

      </div>

      {
        loading ?
        (
          <div className='flex justify-center items items-center h-3/4'>
            <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
          </div>        
        ):
        (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {
          creations.map((item) => <Creationitem key={item.id} item={item}/>)
          }
        </div>
        )
      }
    </div>
  )
}

export default Dashboard
