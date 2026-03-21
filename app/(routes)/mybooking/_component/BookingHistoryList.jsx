import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import GlobalApi from '@/app/_services/GlobalApi'
import { toast } from 'sonner'

function BookingHistoryList({ bookingHistory, type }) {

  const cancelAppointment = (booking) => {
    GlobalApi.deleteBooking(booking.id).then(resp => {
      if (resp) {
        toast('Booking Deleted Successfully!');
        window.location.reload();
      }
    }).catch(e => {
      console.error("Error details:", e);
      toast('Error while canceling booking!');
    });
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 px-2 sm:px-0'>
      {bookingHistory?.length > 0 ? bookingHistory.map((booking, index) => {
        const business = booking.businessList?.[0]; 
        
        return (
          <div className='border rounded-lg p-4 mb-2 shadow-sm' key={index}>
            {business && (
              /* Changed to flex-col for mobile, sm:flex-row for desktop */
              <div className='flex flex-col sm:flex-row gap-4'>
                <Image
                  src={business?.images?.[0]?.url || '/placeholder.png'}
                  alt={business?.name || 'business'}
                  width={120}
                  height={120}
                  className='rounded-lg object-cover w-full sm:w-[120px] h-[140px] sm:h-[120px]'
                />
                <div className='flex flex-col gap-2 w-full'>
                  <h2 className='font-bold text-lg'>{business?.name}</h2>
                  
                  {/* Icon sections with better text wrapping */}
                  <div className='space-y-1'>
                    <h2 className='flex gap-2 text-blue-500 items-center text-sm sm:text-base'>
                      <User className='h-4 w-4' /> {business?.contactPerson}
                    </h2>
                    <h2 className='flex gap-2 text-gray-500 items-start text-sm sm:text-base'>
                      <MapPin className='text-blue-500 h-4 w-4 mt-1 flex-shrink-0' /> 
                      <span className='line-clamp-2'>{business?.address}</span>
                    </h2>
                    <h2 className='flex gap-2 text-gray-500 items-center text-sm sm:text-base'>
                      <Calendar className='text-blue-500 h-4 w-4' /> 
                      Service on: <span className='text-black font-medium'>{booking.date}</span>
                    </h2>
                    <h2 className='flex gap-2 text-gray-500 items-center text-sm sm:text-base'>
                      <Clock className='text-blue-500 h-4 w-4' /> 
                      Time: <span className='text-black font-medium'>{booking.time}</span>
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {type === 'booked' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-5 w-full border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] rounded-xl"> {/* Mobile friendly width */}
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your booking.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel className="mt-0">Back</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => cancelAppointment(booking)}>
                      Confirm Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
           
          </div>
        )
      }) : (
        <div className='col-span-full text-center p-10 bg-gray-50 rounded-lg border-dashed border-2 mt-5'>
          <h2 className='text-gray-400 font-medium'>No {type} services found.</h2>
        </div>
      )}
    </div>
  )
}

export default BookingHistoryList