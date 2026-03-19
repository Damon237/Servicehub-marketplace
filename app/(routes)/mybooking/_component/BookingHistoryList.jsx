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
    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
      {bookingHistory?.length > 0 ? bookingHistory.map((booking, index) => {
        const business = booking.businessList?.[0]; 
        
        return (
          <div className='border rounded-lg p-4 mb-5' key={index}>
            {business && (
              <div className='flex gap-4'>
                <Image
                  src={business?.images?.[0]?.url || '/placeholder.png'}
                  alt={business?.name || 'business'}
                  width={120}
                  height={120}
                  className='rounded-lg object-cover'
                />
                <div className='flex flex-col gap-2'>
                  <h2 className='font-bold'>{business?.name}</h2>
                  <h2 className='flex gap-2 text-blue-500'><User /> {business?.contactPerson}</h2>
                  <h2 className='flex gap-2 text-gray-500'><MapPin className='text-blue-500' /> {business?.address}</h2>
                  <h2 className='flex gap-2 text-gray-500'>
                    <Calendar className='text-blue-500' /> Service on: <span className='text-black'>{booking.date}</span>
                  </h2>
                  <h2 className='flex gap-2 text-gray-500'>
                    <Clock className='text-blue-500' /> Time: <span className='text-black'>{booking.time}</span>
                  </h2>
                </div>
              </div>
            )}

            {/* ✅ Button ONLY appears in 'booked' tab */}
            {type === 'booked' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-5 w-full border-red-300 text-red-500 hover:bg-red-50">
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your booking.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => cancelAppointment(booking)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
           
          </div>
        )
      }) : (
        <div className='col-span-2 text-center p-10 bg-gray-50 rounded-lg border-dashed border-2 mt-5'>
          <h2 className='text-gray-400 font-medium'>No {type} services found.</h2>
        </div>
      )}
    </div>
  )
}

export default BookingHistoryList