"use client"
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Trash2, MessageSquare } from 'lucide-react'
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
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import GlobalApi from '@/app/_services/GlobalApi'
import { toast } from 'sonner'
import moment from 'moment'
import { useSession } from 'next-auth/react'

import ChatComponent from '@/app/_components/ChatComponent';

function BookingHistoryList({ bookingHistory, type }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const cancelAppointment = (booking) => {
    GlobalApi.deleteBooking(booking.id).then(resp => {
      if (resp) {
        toast.success('Appointment Cancelled Successfully!');
        window.location.reload();
      }
    }).catch(e => {
      console.error("Delete Error:", e);
      toast.error('Could not cancel booking at this time.');
    });
  }

  return (
    <div className='mt-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {bookingHistory.length > 0 ? bookingHistory.map((booking, index) => {
          const isExpired = moment().isAfter(moment(booking.time, 'DD-MMM-YYYY').endOf('day'));
          const isStatusCompleted = booking.bookingStatut === 'Completed';

          return (
            <div key={index} className='flex gap-4 border dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm'>
              {booking?.businessList?.images?.[0]?.url && (
                <Image 
                  src={booking.businessList.images[0].url}
                  alt='image'
                  width={120}
                  height={120}
                  className='rounded-xl object-cover h-[120px] w-[120px]'
                />
              )}
              <div className='flex flex-col gap-2 w-full'>
                <h2 className='font-bold text-lg dark:text-slate-100'>{booking.businessList.name}</h2>
                <div className='flex flex-col gap-1'>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center'>
                    <User className='text-blue-500' size={16}/> {booking.businessList.contactPerson}
                  </h2>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center'>
                    <MapPin className='text-blue-500' size={16}/> {booking.businessList.address}
                  </h2>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center font-medium'>
                    <Calendar className='text-blue-500' size={16}/> 
                    Service on: <span className='text-slate-800 dark:text-slate-200'>{booking.time}</span>
                  </h2>
                </div>
              </div>

              {type === 'booked' && !isExpired && !isStatusCompleted ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20">
                      <Trash2 size={18}/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-slate-100">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-slate-400">
                        This will release your slot. The artisan will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                      <AlertDialogCancel className="rounded-xl mt-0 border-slate-200 dark:border-slate-800 dark:text-slate-300">Keep Booking</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600 rounded-xl" 
                        onClick={() => cancelAppointment(booking)}
                      >
                        Yes, Cancel Appointment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                  <div className='mt-5 py-2 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center'>
                      <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
                        {isExpired || isStatusCompleted ? "Service Completed" : "Booking is finalized"}
                      </p>
                  </div>
              )}
            </div>
          )
        }) : (
          <div className='col-span-full text-center p-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800'>
            <h2 className='text-slate-400 dark:text-slate-500 font-medium'>No {type} service records found in your account.</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistoryList;