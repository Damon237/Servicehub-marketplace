import { Button } from '@/components/ui/button'
import { Hammer } from 'lucide-react' // Added icon
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function BusinessList({ businessList = [], title }) {
  return (
    <div className='mt-10 mb-10' id="service">
      <h2 className='font-bold text-[22px]'>{title}</h2>
      
      {/* Business Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5'>
        {businessList && businessList.length > 0 ? (
          businessList.map((business, index) => (
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
                <h2 className='font-bold text-lg'>{business.name}</h2>
                <h2 className='text-blue-500'>{business.contactPerson}</h2>
                <h2 className='text-gray-500 text-sm'>{business.address}</h2>
                <Button className="rounded-lg mt-3 bg-blue-500">Book Now</Button>
              </div>
            </Link>
          ))
        ) : (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
            <div
              key={index}
              className='w-full h-[300px] bg-slate-200 rounded-lg animate-pulse'
            />
          ))
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