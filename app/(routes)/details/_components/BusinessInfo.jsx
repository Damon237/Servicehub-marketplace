"use client"
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Share, User, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { toast } from 'sonner'

// 1. Added 'reviews' to the props
function BusinessInfo({ business, reviews = [] }) {

  // 2. Added the calculation logic inside the component
  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return "0.0";
    const total = reviews.reduce((acc, item) => acc + item.rating, 0);
    const result = total / reviews.length;
    return Math.min(result, 5).toFixed(1);
  }, [reviews]);

  const onShare = () => {
    const shareData = {
      title: business?.name,
      text: `Check out ${business?.contactPerson} on ServiceHub!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }

  return business?.name && (
    <div className='md:flex gap-4 items-center'>
      <Image 
        src={business?.images[0]?.url} 
        alt={business.name} 
        width={150} 
        height={150} 
        unoptimized 
        className='rounded-full h-[150px] w-[150px] object-cover border-4 border-white shadow-md' 
      />
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center w-full'>
        <div className='flex flex-col mt-4 md:mt-0 items-baseline gap-3'>
          <h2 className='text-blue-500 p-1 px-3 text-lg bg-blue-100 rounded-full'>{business?.category?.name}</h2>
          <h2 className='text-[40px] font-bold'>{business.name}</h2>
          <h2 className='flex gap-2 text-lg text-gray-500'><MapPin /> {business.address}</h2>
          <h2 className='flex gap-2 text-lg text-gray-500'><Mail />{business?.email}</h2>
        </div>
        <div className='flex flex-col gap-5 items-end'>
          <Button className='bg-blue-500 hover:bg-blue-600' onClick={onShare}><Share /></Button>
          
          {/* 3. Corrected Dynamic Rating Badge */}
          <div className='flex gap-2 text-orange-400 items-center bg-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm'>
             <Star fill="#FACC15" 
               stroke="#EAB308" 
               size={30} 
               className='drop-shadow-sm'/> 
             <div className='flex flex-col leading-tight'>
                <span className='font-extrabold text-xl text-orange-500'>{avgRating}</span>
                <span className='text-[10px] text-orange-400 font-bold uppercase'>
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
             </div>
          </div>

          <h2 className='flex gap-2 text-xl text-blue-500 font-medium'><User /> {business.contactPerson} </h2>
        </div>
      </div>
    </div>
  )
}

export default BusinessInfo;