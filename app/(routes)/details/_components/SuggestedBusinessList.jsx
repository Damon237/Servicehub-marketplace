import GlobalApi from '@/app/_services/GlobalApi';
import { Button } from '@/components/ui/button'
import { NotebookPen } from 'lucide-react'
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import BookingSection from './BookingSection';

function SuggestedBusinessList({ business }) {

  const [businessList, setBusinessList] = useState([]);

  useEffect(() => {
    if (!business?.category?.name) return; 
    getBusinessList();
  }, [business]);

  const getBusinessList = async () => {
    try {
      const resp = await GlobalApi.getBusinessByCategory(business.category.name);
      setBusinessList(resp?.businessLists || []);
    } catch (error) {
      console.error("Error fetching similar businesses:", error);
    }
  };

  return (
    <div className='md:pl-10 px-4 md:px-0'>

      {/* Booking Button: Fixed to bottom on mobile, normal on desktop */}
      <div className='fixed bottom-0 left-0 w-full p-4 bg-white border-t z-50 md:static md:p-0 md:bg-transparent md:border-none'>
        <BookingSection business={business}>
          <Button className="flex gap-2 w-full bg-blue-500 py-6 md:py-2 text-lg md:text-base shadow-lg md:shadow-none">
            <NotebookPen />
            Book Appointment
          </Button>
        </BookingSection>
      </div>

      <div className='mt-10 mb-24 md:mb-0'>
        <h2 className='font-bold text-xl md:text-lg mt-3 mb-5 md:mb-3'>
          Similar Business
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4'>
          {businessList?.map((item, index) => (

            <Link
              href={'/details/' + item.id}
              className="flex gap-4 mb-2 hover:border rounded-lg p-3 cursor-pointer hover:shadow-md border-blue-500 bg-slate-50/50 md:bg-transparent"
              key={index}
            >

              <Image
                src={item?.images?.[0]?.url || "/placeholder.png"} 
                alt={item.name || "business"}
                width={80}
                height={80}
                unoptimized
                className='rounded-lg object-cover h-[90px] w-[90px] shrink-0'
              />

              <div className='flex flex-col justify-center min-w-0'>
                <h2 className='font-bold text-sm md:text-base truncate'>{item.name}</h2>
                <h2 className='text-blue-500 text-xs md:text-sm'>{item.contactPerson}</h2>
                <h2 className='text-gray-400 text-xs md:text-sm line-clamp-1'>{item.address}</h2>
              </div>

            </Link>

          ))}
        </div>

      </div>

    </div>
  )
}

export default SuggestedBusinessList