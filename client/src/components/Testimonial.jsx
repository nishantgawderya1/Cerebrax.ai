const Testimonial = () => {
    const dummyTestimonialData = [
        {
            image: "https://img.icons8.com/?size=100&id=Chgb7mhcx0Yj&format=png&color=000000",
            name: 'Aakash',
            title: 'Marketing Team',
            content: 'Cerebrax.ai has completely transformed the way I work—my articles are top-notch, and I save hours every week.',
            rating: 4,
        },
        {
            image: "https://img.icons8.com/?size=100&id=VoeR9dysnoTJ&format=png&color=000000",
            name: 'Aman Mehta',
            title: 'Content Creator, TechCorp',
            content: 'Cerebrax.ai has made creating content effortless for me, helping me produce high-quality work in no time.',
            rating: 5,
        },
        {
            image: "https://img.icons8.com/?size=100&id=Wk1Sxr29pyYn&format=png&color=000000",
            name: 'Lakshita Singhal',
            title: 'Content Writer, Freelancer',
            content: 'Cerebrax.ai has completely changed the way I create content—it helps me turn out high-quality work faster than I ever thought possible.',
            rating: 4,
        },
    ]

    return (
        <div className='px-4 sm:px-20 xl:px-32 py-24'>
            <div className='text-center'>
                <h2 className='text-slate-700 text-[42px] font-semibold'>What People Are Saying</h2>
                <p className='text-gray-500 max-w-lg mx-auto'>Cerebrax.ai isn’t just smart — it delivers. From faster content creation to higher engagement, our all-in-one AI platform is built to drive real outcomes.</p>
            </div>
            <div className='flex flex-wrap mt-10 justify-center'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div key={index} className='p-8 m-4 max-w-xs rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 hover:-translate-y-1 transition duration-300 cursor-pointer'>

                        
                        
                        <p className='text-gray-500 text-sm my-5'>"{testimonial.content}"</p>
                        <hr className='mb-5 border-gray-300' />
                        <div className='flex items-center gap-4'>
                            <img src={testimonial.image} className='w-12 object-contain rounded-full' alt='' />
                            <div className='text-sm text-gray-600'>
                                <h3 className='font-medium'>{testimonial.name}</h3>
                                <p className='text-xs text-gray-500'>{testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Testimonial
