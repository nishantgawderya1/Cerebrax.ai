import React from 'react'
import { useNavigate } from 'react-router-dom';

const Hero = () => {

  const navigate = useNavigate();


  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl sm:text-5xl md:text-6xl 3xl:text-7xl font-semibold ms-auto leading-[1.2]'>From Idea to Impact <br /> Powered by <span className='text-primary'>Cerebrax.ai</span></h1>
        <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>Turn thoughts into powerful content with one seamless AI platform. All the tools you need, built for students, creators, and pros. Work smarter, create faster, and stay ahead.</p>
      </div>

      <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
        <button onClick={ ()=> navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>Bring Your Ideas to Life</button>
        <button className='bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer'>Experience Cerebrax in 60 Seconds</button>
      </div>

      <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600 '>
        <img src="assets.user_group" alt="" className='h-8' /> Trusted by 1000+ users
        
      </div>
    </div>
  )
}

export default Hero
