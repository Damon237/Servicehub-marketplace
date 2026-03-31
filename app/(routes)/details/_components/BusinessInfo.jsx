"use client"
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Share, User, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { toast } from 'sonner'

function BusinessInfo({ business, reviews = [] }) {

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
    /* md:flex-row and items-center keeps desktop look, while flex-col centers mobile */
    <div className='flex flex-col md:flex-row gap-6 items-center md:items-start lg:items-center'>
      
      {/* Centered Image on mobile */}
      <Image 
        src={business?.images[0]?.url} 
        alt={business.name} 
        width={150} 
        height={150} 
        unoptimized 
        className='rounded-full h-[150px] w-[150px] object-cover border-4 border-white shadow-md shrink-0' 
      />

      <div className='flex flex-col md:flex-row justify-between items-center md:items-center w-full gap-6'>
        
        {/* Text Section: Centered on mobile, left-aligned on desktop */}
        <div className='flex flex-col items-center md:items-start gap-3 text-center md:text-left'>
          <h2 className='text-blue-500 p-1 px-4 text-sm md:text-lg bg-blue-100 rounded-full w-fit'>{business?.category?.name}</h2>
          <h2 className='text-3xl md:text-[40px] font-bold leading-tight'>{business.name}</h2>
          <h2 className='flex gap-2 text-base md:text-lg text-gray-500'><MapPin className='shrink-0'/> {business.address}</h2>
          <h2 className='flex gap-2 text-base md:text-lg text-gray-500 truncate max-w-[300px]'><Mail className='shrink-0' />{business?.email}</h2>
        </div>

        {/* Action/Rating Section: Centered on mobile, right-aligned on desktop */}
        <div className='flex flex-col gap-4 items-center md:items-end w-full md:w-auto'>
          
          <div className='flex items-center gap-3'>
             <Button className='bg-blue-500 hover:bg-blue-600 rounded-full' onClick={onShare}><Share size={20}/></Button>
             <h2 className='flex md:hidden gap-2 text-lg text-blue-500 font-medium'><User /> {business.contactPerson} </h2>
          </div>
          
          {/* Rating Badge */}
          <div className='flex gap-2 text-orange-400 items-center bg-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm'>
             <Star fill="#FACC15" 
               stroke="#EAB308" 
               size={24} 
               className='drop-shadow-sm'/> 
             <div className='flex flex-col leading-tight'>
                <span className='font-extrabold text-lg md:text-xl text-orange-500'>{avgRating}</span>
                <span className='text-[10px] text-orange-400 font-bold uppercase'>
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
             </div>
          </div>

          {/* Hidden on mobile to avoid clutter (shown next to share button above) */}
          <h2 className='hidden md:flex gap-2 text-xl text-blue-500 font-medium'><User /> {business.contactPerson} </h2>
        </div>

      </div>
    </div>
  )
}

export default BusinessInfo;