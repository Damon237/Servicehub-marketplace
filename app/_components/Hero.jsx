"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

function Hero() {
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();

  const onSearchClick = () => {
    if (searchInput.trim()) {
      // Redirect to a search page with the query in the URL
      // Example: /search/cleaning
      router.push('/search/' + searchInput);
    }
  }

  return (
    <div className='flex items-center gap-4 flex-col justify-center pt-20 pb-10 px-6'>
        
        <h2 className='font-bold text-[30px] sm:text-[36px] md:text-[46px] text-center leading-tight max-w-[800px]'>
            Find Home 
            <span className='text-blue-500'> Service/Repair</span>
            <br className='hidden sm:block'></br> Near You
        </h2>

        <h2 className='text-md md:text-xl text-gray-400 text-center max-w-[500px]'>
            Explore Best Home Service & Repair near you
        </h2>

        <div className='mt-6 flex flex-row gap-2 items-center w-full max-w-[600px]'>
            <Input 
                placeholder='Search for a service' 
                className="rounded-full flex-1 h-[46px] shadow-sm focus:border-blue-500" 
                // STEP 1: Update state as user types
                onChange={(e) => setSearchInput(e.target.value)}
                // STEP 2: Allow searching by pressing Enter
                onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
            />
            <Button 
                className="rounded-full h-[46px] w-[46px] md:w-auto bg-blue-500 px-4 hover:bg-blue-600 transition-all"
                // STEP 3: Trigger search on click
                onClick={() => onSearchClick()}
            >
                <Search className='h-5 w-5'/>
                <span className='hidden md:block ml-2'>Search</span>
            </Button>
        </div>
    </div>
  )
}

export default Hero