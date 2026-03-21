"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlobalApi from '@/app/_services/GlobalApi'

function Hero() {
  const [searchInput, setSearchInput] = useState('');
  const [categoryList, setCategoryList] = useState([]); // All categories from DB
  const [suggestions, setSuggestions] = useState([]); // Filtered suggestions
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // Fetch all categories once when the component loads
  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    GlobalApi.getCategory().then(resp => {
      setCategoryList(resp.categories);
    });
  }

  // Handle Input Change and dynamic suggestions
  const handleInputChange = (value) => {
    setSearchInput(value);
    if (value.trim().length > 0) {
      // Filter categories that start with or contain the typed letters
      const filtered = categoryList.filter(cat => 
        cat.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }

  const onSearchClick = (selectedName) => {
    const query = selectedName || searchInput;
    if (query.trim()) {
      router.push('/search/' + query);
    }
  }

  return (
    <div className='flex items-center gap-4 flex-col justify-center pt-20 pb-10 px-6'>
      <h2 className='font-bold text-[30px] sm:text-[36px] md:text-[46px] text-center leading-tight max-w-[800px]'>
        Find Home <span className='text-blue-500'>Service/Repair</span>
        <br className='hidden sm:block'></br> Near You
      </h2>

      <h2 className='text-md md:text-xl text-gray-400 text-center max-w-[500px]'>
        Explore Best Home Service & Repair near you
      </h2>

      <div className='mt-6 relative w-full max-w-[600px]'>
        <div className='flex flex-row gap-2 items-center'>
          <Input
            placeholder='Search for a service'
            className="rounded-full flex-1 h-[46px] shadow-sm focus:border-blue-500"
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow clicks
          />
          <Button
            className="rounded-full h-[46px] w-[46px] md:w-auto bg-blue-500 px-4 hover:bg-blue-600 transition-all"
            onClick={() => onSearchClick()}
          >
            <Search className='h-5 w-5' />
            <span className='hidden md:block ml-2'>Search</span>
          </Button>
        </div>

        {/* Suggestion Dropdown */}
        {isFocused && searchInput.length > 0 && (
          <div className='absolute w-full bg-white border rounded-xl mt-2 shadow-lg z-50 overflow-hidden'>
            {suggestions.length > 0 ? (
              suggestions.map((cat, index) => (
                <div
                  key={index}
                  className='p-3 px-5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors'
                  onClick={() => {
                    setSearchInput(cat.name);
                    onSearchClick(cat.name);
                  }}
                >
                  <Search className='h-4 w-4 text-gray-400' />
                  <span>{cat.name}</span>
                  <span className='text-xs text-gray-400 ml-auto'>In Categories</span>
                </div>
              ))
            ) : (
              <div className='p-4 text-center'>
                <p className='text-red-500 font-medium'>Not Found</p>
                <p className='text-xs text-gray-400'>Try searching for "Cleaning", "Repair", or "Painting"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero