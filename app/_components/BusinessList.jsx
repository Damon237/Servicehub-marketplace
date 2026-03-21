"use client"
import { Button } from '@/components/ui/button'
import { Hammer, MapPin } from 'lucide-react' 
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { calculateDistance } from '@/utils/distance' // Import the utility you created

function BusinessList({ businessList = [], title }) {
  // 1. Create a state to hold the list so we can filter it
  const [displayList, setDisplayList] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    setDisplayList(businessList);
  }, [businessList]);

  // 2. Logic to find providers within 15km
  const getNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;

      const nearby = businessList.filter(biz => {
        // Only calculate if the business has coordinates in the database
        if (biz.latitude && biz.longitude) {
          const dist = calculateDistance(userLat, userLon, biz.latitude, biz.longitude);
          return dist <= 15; // Filter providers within 15km
        }
        return false;
      });

      setDisplayList(nearby);
      setIsFiltered(true);
    });
  };

  const resetFilter = () => {
    setDisplayList(businessList);
    setIsFiltered(false);
  };

  return (
    <div className='mt-10 mb-10' id="service">
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-[22px]'>{title}</h2>
        
        {/* 3. Add the Near Me Button */}
        {isFiltered ? (
            <Button variant="outline" onClick={resetFilter}>Show All</Button>
        ) : (
            <Button 
                onClick={getNearMe} 
                variant="outline" 
                className="flex gap-2 text-blue-500 border-blue-500 hover:bg-blue-50"
            >
                <MapPin className='h-4 w-4'/> Near Me
            </Button>
        )}
      </div>
      
      {/* Business Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5'>
        {displayList && displayList.length > 0 ? (
          displayList.map((business, index) => (
            <Link
              href={'/details/' + business.id}
              key={index}
              className='shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-blue-500 hover:scale-105 transition-all ease-in-out bg-white'
            >
              <Image
                src={business?.images?.[0]?.url || '/placeholder.png'}
                alt={business.name}
                width={500}
                height={200}
                className='h-[150px] md:h-[200px] object-cover rounded-lg'
              />
              <div className='flex flex-col items-baseline p-3 gap-1'>
                <h2 className='p-1 bg-purple-200 text-blue-500 rounded-full px-2 text-[12px]'>
                  {business.category?.name || 'No category'}
                </h2>
                <h2 className='font-bold text-lg line-clamp-1'>{business.name}</h2>
                <h2 className='text-blue-500'>{business.contactPerson}</h2>
                <h2 className='text-gray-500 text-sm line-clamp-1'>{business.address}</h2>
                <Button className="rounded-lg mt-3 bg-blue-500 w-full">Book Now</Button>
              </div>
            </Link>
          ))
        ) : (
          /* If filtered and nothing found */
          isFiltered ? (
            <div className='col-span-full py-10 text-center border-2 border-dashed rounded-lg'>
                <h2 className='text-gray-400'>No providers found within 15km of your location.</h2>
                <Button variant="link" onClick={resetFilter}>View all providers</Button>
            </div>
          ) : (
            /* Skeleton Loading */
            [1, 2, 3, 4].map((item, index) => (
                <div key={index} className='w-full h-[300px] bg-slate-200 rounded-lg animate-pulse' />
            ))
          )
        )}
      </div>

      {/* --- Service Provider Invitation --- */}
      <div className='mt-16 p-6 md:p-8 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left'>
        <div className='flex items-center gap-5 flex-col md:flex-row'>
          <div className='bg-white p-4 rounded-full shadow-sm'>
            <Hammer className='text-blue-500 h-7 w-7' />
          </div>
          <div>
            <h2 className='font-bold text-lg md:text-xl'>Have a skill and want to be a service provider?</h2>
            <p className='text-gray-500 text-sm md:text-base'>Join our platform and start growing your business with us.</p>
          </div>
        </div>
        
        <Link href={'/be-a-provider'} className="w-full md:w-auto">
          <Button className="bg-blue-500 w-full">Join Now</Button>
        </Link>
      </div>
    </div>
  )
}

export default BusinessList