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
          const isStatusCompleted = booking.bookingStatut === 'Completed' || isExpired;

          return (
            <div key={index} className='flex gap-4 border dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden'>
              
              {/* Status Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${isStatusCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {isStatusCompleted ? (
                  <span className='flex items-center gap-1'><CheckCircle size={10}/> Completed</span>
                ) : (
                  <span className='flex items-center gap-1'><Clock size={10}/> Upcoming</span>
                )}
              </div>

              {booking?.businessList?.images?.[0]?.url && (
                <Image 
                  src={booking.businessList.images[0].url}
                  alt='business-image'
                  width={120}
                  height={120}
                  className='rounded-xl object-cover h-[120px] w-[120px]'
                />
              )}

              <div className='flex flex-col gap-2 w-full pr-16'>
                <h2 className='font-bold text-lg dark:text-slate-100 truncate'>{booking.businessList.name}</h2>
                <div className='flex flex-col gap-1'>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-xs items-center'>
                    <User className='text-blue-500' size={14}/> {booking.businessList.contactPerson}
                  </h2>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-xs items-center'>
                    <MapPin className='text-blue-500' size={14}/> {booking.businessList.address}
                  </h2>
                  <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-xs items-center font-medium mt-1'>
                    <Calendar className='text-blue-500' size={14}/> 
                    <span className='text-slate-800 dark:text-slate-200'>{booking.time}</span>
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 mt-2'>
                  {/* Chat Button */}
                  {!isStatusCompleted && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="flex gap-2 items-center rounded-lg text-xs h-8">
                          <MessageSquare size={14}/> Chat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
                        <ChatComponent booking={booking} />
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Cancel Button Logic */}
                  {type === 'booked' && !isStatusCompleted && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex gap-2 items-center border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 rounded-lg text-xs h-8">
                          <Trash2 size={14}/> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-slate-100 text-xl font-bold">Cancel this booking?</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            This will notify {booking.businessList.name}. This action cannot be undone once confirmed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 gap-2">
                          <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800">No, go back</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl" 
                            onClick={() => cancelAppointment(booking)}
                          >
                            Confirm Cancellation
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
          <div className='col-span-full text-center p-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800'>
            <h2 className='text-slate-400 dark:text-slate-500 font-medium'>No {type} service records found.</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistoryList;