import { Button } from '@/components/ui/button'
import { Clock, Mail, MapPin, Share, User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function BusinessInfo({business}) {

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


  return business?.name&&(
    <div className='md:flex gap-4 items-center'>
      <Image src={business?.images[0]?.url}
        alt={business.name}
        width={150}
        height={200}
        className='rounded-full h-[150px]
        object-cover'
      />
      <div className='flex justify-between items-center w-full'>
      <div className='flex flex-col mt-4 md:mt-0 items-baseline gap-3'>
        <h2 className='text-blue-500 p-1 px-3
        text-lg 
        bg-blue-100 rounded-full'>{business?.category?.name}</h2>
        <h2 className='text-[40px] font-bold'>{business.name}</h2>
      <h2 className='flex gap-2 text-lg text-gray-500'><MapPin/> {business.address}</h2>
      <h2 className='flex gap-2 text-lg text-gray-500'>
        <Mail/>
        {business?.email}</h2>
      </div>
      <div className='flex flex-col gap-5  items-end'>
        <Button className='bg-blue-500' onClick={onShare}>
          <Share />
        </Button>
        <h2 className='flex gap-2 text-xl text-blue-500'><User/> {business.contactPerson} </h2>
        <h2 className='flex gap-2 text-xl text-gray-500'><Clock/> Available 8:00 AM to 10:PM </h2>
      
      </div>
      </div>
    </div>
  )
}

export default BusinessInfo