import React, { useState, useEffect, useCallback } from 'react'
import { Gem, Sparkles, Image as ImageIcon, FileText, CalendarDays, Search } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import Creationitem from '../components/Creationitem'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL


const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'blog-title', label: 'Titles' },
  { value: 'image', label: 'Images' },
  { value: 'review-resume', label: 'Resumes' },
]

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { getToken } = useAuth()

  const getDashboardData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message || 'Failed to fetch creations')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch creations')
    }
    setLoading(false)
  }, [getToken])

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/user/creation/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data.success) {
        setCreations((prev) => prev.filter((c) => c.id !== id))
        toast.success('Creation deleted')
      } else {
        toast.error(data.message || 'Failed to delete creation')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete creation')
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [getDashboardData])

  // Derived stats
  const countByType = (type) => creations.filter((c) => c.type === type).length
  const now = new Date()
  const thisMonthCount = creations.filter((c) => {
    const d = new Date(c.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    { label: 'Total Creations', value: creations.length, Icon: Sparkles, gradient: 'from-blue-500 to-purple-500' },
    { label: 'Images', value: countByType('image'), Icon: ImageIcon, gradient: 'from-purple-500 to-pink-400' },
    { label: 'Articles', value: countByType('article'), Icon: FileText, gradient: 'from-emerald-500 to-teal-400' },
    { label: 'This Month', value: thisMonthCount, Icon: CalendarDays, gradient: 'from-orange-500 to-amber-400' },
  ]

  // Filtered + searched list
  const filteredCreations = creations.filter((c) => {
    const matchesType = filter === 'all' || c.type === filter
    const matchesSearch = (c.prompt || '').toLowerCase().includes(search.trim().toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Stat cards */}
        {stats.map((stat) => (
          <div key={stat.label} className='flex justify-between items-center w-60 p-4 px-6 bg-white rounded-xl border border-gray-200'>
            <div className='text-slate-600'>
              <p className='text-sm'>{stat.label}</p>
              <h2 className='text-xl font-semibold'>{stat.value}</h2>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
              <stat.Icon className='w-5 text-white' />
            </div>
          </div>
        ))}

        {/* Active plan card */}
        <div className='flex justify-between items-center w-60 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {
        loading ?
          (
            <div className='flex justify-center items-center h-3/4'>
              <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
            </div>
          ) :
          (
            <div className='space-y-3'>
              <div className='mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <p>Recent Creations</p>

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                  {/* Search */}
                  <div className='relative'>
                    <Search className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
                    <input
                      type='text'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Search prompts...'
                      className='pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white w-full sm:w-56'
                    />
                  </div>

                  {/* Type filter chips */}
                  <div className='flex gap-2 flex-wrap'>
                    {typeFilters.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setFilter(t.value)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          filter === t.value
                            ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white border-transparent'
                            : 'text-gray-500 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredCreations.length === 0 ? (
                <p className='text-sm text-gray-500 py-6 text-center'>
                  {creations.length === 0
                    ? 'No creations yet. Try one of the AI tools to get started!'
                    : 'No creations match your filter.'}
                </p>
              ) : (
                filteredCreations.map((item) => (
                  <Creationitem key={item.id} item={item} onDelete={handleDelete} />
                ))
              )}
            </div>
          )
      }
    </div>
  )
}

export default Dashboard
