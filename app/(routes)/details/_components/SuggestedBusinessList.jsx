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
    if (!business?.category?.name) return; // ✅ Prevent undefined category
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
    <div className='md:pl-10'>

      <BookingSection business={business}>
        <Button className="flex gap-2 w-full bg-blue-500">
          <NotebookPen />
          Book Appointment
        </Button>
      </BookingSection>

      <div className='hidden md:block'>
        <h2 className='font-bold text-lg mt-3 mb-3'>
          Similar Business
        </h2>

        <div>
          {businessList?.map((item, index) => (

            <Link
              href={'/details/' + item.id}
              className="flex gap-2 mb-4 hover:border rounded-lg p-2 cursor-pointer hover:shadow-md border-blue-500"
              key={index}
            >

              <Image
                src={item?.images?.[0]?.url || "/placeholder.png"} // ✅ Prevent crash if no image
                alt={item.name || "business"}
                width={80}
                height={80}
                className='rounded-lg object-cover h-[100px]'
              />

              <div>
                <h2 className='font-bold'>{item.name}</h2>
                <h2 className='text-blue-500'>{item.contactPerson}</h2>
                <h2 className='text-gray-400'>{item.address}</h2>
              </div>

            </Link>

          ))}
        </div>

      </div>

    </div>
  )
}

export default SuggestedBusinessList