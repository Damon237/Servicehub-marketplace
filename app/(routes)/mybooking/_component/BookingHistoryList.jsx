"use client"
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, User, Trash2, MessageSquare, CheckCircle, Clock } from 'lucide-react'
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
import ChatComponent from '@/app/_components/ChatComponent'

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
      <div className='flex flex-col gap-5'>
        {bookingHistory.length > 0 ? bookingHistory.map((booking, index) => {
          // Status Logic: Finished if marked 'completed' or if the end date has passed
          const isExpired = moment().isAfter(moment(booking.date, 'DD-MMM-YYYY').endOf('day')); 
          const isStatusCompleted = booking.bookingStatut?.toLowerCase() === 'completed' || isExpired;

          return (
            <div key={index} className='flex flex-col md:flex-row gap-4 border dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm relative'>
              
              {/* Status Indicator Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isStatusCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isStatusCompleted ? 'Completed' : 'Upcoming'}
              </div>

              {/* Business Image */}
              {booking?.businessList?.images?.[0]?.url && (
                <Image 
                  src={booking.businessList.images[0].url}
                  alt='business'
                  width={140}
                  height={140}
                  className='rounded-xl object-cover h-[140px] w-full md:w-[140px]'
                />
              )}

              <div className='flex flex-col justify-between w-full'>
                <div>
                  <h2 className='font-bold text-xl dark:text-slate-100'>{booking.businessList.name}</h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-2'>
                    <h2 className='flex gap-2 text-blue-600 text-sm items-center'>
                      <User size={16}/> {booking.businessList.contactPerson}
                    </h2>
                    <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center'>
                      <MapPin size={16}/> {booking.businessList.address}
                    </h2>
                    {/* Displaying the Date Range as requested */}
                    <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center'>
                      <Calendar size={16} className='text-blue-500'/> 
                      Service on: <span className='font-bold text-slate-700 dark:text-slate-200 ml-1'>
                        {booking.date} {booking.endDate ? `— ${booking.endDate}` : ''}
                      </span>
                    </h2>
                    <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-sm items-center'>
                      <Clock size={16} className='text-blue-500'/> 
                      Time: <span className='font-bold text-slate-700 dark:text-slate-200 ml-1'>{booking.time}</span>
                    </h2>
                  </div>
                </div>

                {/* Action Buttons: Chat & Cancel */}
                <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                  {/* Two-Way Chat Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex gap-2 items-center justify-center border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                        <MessageSquare size={18}/> Chat with Artisan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-md overflow-hidden rounded-2xl border-none">
                      {/* Passing props for two-way communication */}
                      <ChatComponent 
                        bookingId={booking.id} 
                        currentUserEmail={session?.user?.email} 
                        recipientName={booking.businessList.contactPerson} 
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Cancel Button: Only for 'booked' tab and non-completed services */}
                  {type === 'booked' && !isStatusCompleted && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
                          Cancel Appointment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-900 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel your booking with {booking.businessList.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Keep Booking</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600 rounded-xl" 
                            onClick={() => cancelAppointment(booking)}
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          )
        }) : (
          <div className='text-center p-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800'>
            <h2 className='text-slate-400 font-medium'>No {type} services found.</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistoryList;