function Hero() {
  return (
    <div className='flex items-center gap-3 flex-col justify-center pt-14 pb-7 px-4'>
        <h2 className='font-bold text-[32px] md:text-[46px] text-center leading-tight'>
            Find Home 
            <span className='text-blue-500'> Service/Repair</span>
            <br className='hidden md:block'></br> Near You
        </h2>
        <h2 className='text-lg md:text-xl text-gray-400 text-center'>
            Explore Best Home Service & Repair near you
        </h2>
        <div className='mt-4 flex gap-2 items-center w-full max-w-[600px]'>
            <Input placeholder='Search' className="rounded-full flex-1" />
            <Button className="rounded-full h-[46px] bg-blue-500 px-5">
                <Search className='h-4 w-4'/>
            </Button>
        </div>
    </div>
  )
}