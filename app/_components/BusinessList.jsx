"use client"
import { Button } from '@/components/ui/button'
import { Hammer, MapPin } from 'lucide-react' 
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { calculateDistance } from '@/utils/distance' 

function BusinessList({ businessList = [], title }) {
  const [displayList, setDisplayList] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    setDisplayList(businessList);
  }, [businessList]);

  const getNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;

      const nearby = businessList.filter(biz => {
        if (biz.location && biz.location.latitude && biz.location.longitude) {
          // FIXED: Grouped coordinates into objects to match your utility structure
          const dist = calculateDistance(
            { lat: userLat, lng: userLon }, 
            { lat: biz.location.latitude, lng: biz.location.longitude }
          );
          return dist <= 5; // Within 5km
        }
        return false;
      });

      setDisplayList(nearby);
      setIsFiltered(true);
    }, (err) => {
      console.error("Error getting location:", err);
      alert("Please enable location access to find nearby services.");
    });
  };

  const resetFilter = () => {
    setDisplayList(businessList);
    setIsFiltered(false);
  };

  return (
    <div className='mt-10 mb-10' id="service">
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-[22px] dark:text-white'>{title}</h2>
        
        {isFiltered ? (
            <Button variant="outline" onClick={resetFilter} className="dark:border-slate-700 dark:text-white">Show All</Button>
        ) : (
            <Button 
                onClick={getNearMe} 
                variant="outline" 
                className="flex gap-2 text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:border-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
            >
                <MapPin className='h-4 w-4'/> Near Me
            </Button>
        )}
      </div>
      
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5'>
        {displayList && displayList.length > 0 ? (
          displayList.map((business, index) => (
            <Link
              href={'/details/' + business.id}
              key={index}
              className='shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-blue-500 hover:scale-105 transition-all ease-in-out bg-white dark:bg-slate-900 dark:border dark:border-slate-800'
            >
              <Image
                src={business?.images?.[0]?.url || '/placeholder.png'}
                alt={business.name}
                width={500}
                height={200}
                className='h-[150px] md:h-[200px] object-cover rounded-lg'
              />
              <div className='flex flex-col items-baseline p-3 gap-1'>
                <h2 className='p-1 bg-purple-200 text-blue-500 rounded-full px-2 text-[12px] dark:bg-blue-900/40 dark:text-blue-300'>
                  {business.category?.name || 'No category'}
                </h2>
                <h2 className='font-bold text-lg line-clamp-1 dark:text-white'>{business.name}</h2>
                <h2 className='text-blue-500 dark:text-blue-400'>{business.contactPerson}</h2>
                <h2 className='text-gray-500 dark:text-gray-400 text-sm line-clamp-1'>{business.address}</h2>
                
                {isFiltered && business.location && (
                  <span className='text-[10px] text-green-600 dark:text-green-400 font-bold'>Nearby Service</span>
                )}
                <Button className="rounded-lg mt-3 bg-blue-500 w-full hover:bg-blue-600">Book Now</Button>
              </div>
            </Link>
          ))
        ) : (
          isFiltered ? (
            <div className='col-span-full py-10 text-center border-2 border-dashed rounded-lg dark:border-slate-800'>
                <h2 className='text-gray-400'>No providers found within 5km of your location.</h2>
                <Button variant="link" onClick={resetFilter} className="dark:text-blue-400">View all providers</Button>
            </div>
          ) : (
            [1, 2, 3, 4].map((item, index) => (
                <div key={index} className='w-full h-[300px] bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse' />
            ))
          )
        )}
      </div>

      <div className='mt-16 p-6 md:p-8 bg-blue-50 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left'>
        <div className='flex items-center gap-5 flex-col md:flex-row'>
          <div className='bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm'>
            <Hammer className='text-blue-500 dark:text-blue-400 h-7 w-7' />
          </div>
          <div>
            <h2 className='font-bold text-lg md:text-xl dark:text-white'>Have a skill and want to be a service provider?</h2>
            <p className='text-gray-500 dark:text-gray-400 text-sm md:text-base'>Join our platform and start growing your business with us.</p>
          </div>
        </div>
        
        <Link href={'/be-a-provider'} className="w-full md:w-auto">
          <Button className="bg-blue-500 w-full hover:bg-blue-600">Join Now</Button>
        </Link>
      </div>
    </div>
  )
}

export default BusinessList