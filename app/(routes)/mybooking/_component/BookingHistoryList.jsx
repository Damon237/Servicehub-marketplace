"use client"
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, CheckCircle, Trash2, MessageSquare } from 'lucide-react'
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
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

  const isPastBooking = (bookingEndDate) => {
    if (!bookingEndDate) return false;
    const endOfBookingDay = moment(bookingEndDate, 'DD-MMM-YYYY').endOf('day');
    return moment().isAfter(endOfBookingDay);
  };

  const cancelAppointment = (booking) => {
    GlobalApi.deleteBooking(booking.id).then(resp => {
      if (resp) {
        toast.success('Appointment Cancelled Successfully!');
        window.location.reload();
      }
    });
  }

  const deletePastBookings = async () => {
    const pastBookings = bookingHistory.filter(booking => 
      isPastBooking(booking.time) || booking.bookingStatut?.toLowerCase() === 'completed'
    );
    try {
      for (const booking of pastBookings) {
        await GlobalApi.deleteBooking(booking.id);
      }
      toast.success('History Cleared!');
      window.location.reload();
    } catch (e) {
      toast.error('Error clearing history.');
    }
  }

  return (
    <div className='mt-5'>
      {type === 'completed' && bookingHistory?.length > 0 && (
        <div className='flex justify-end mb-4'>
           <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex gap-2 items-center text-sm font-semibold transition-colors">
                    <Trash2 size={16}/> Clear Completed History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Clear All Records?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-slate-400">This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-slate-800 dark:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={deletePastBookings}>Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 px-2 sm:px-0'>
        {bookingHistory?.length > 0 ? bookingHistory.map((booking, index) => {
          const business = Array.isArray(booking.businessList) ? booking.businessList[0] : booking.businessList;
          const isExpired = isPastBooking(booking.time);
          const isStatusCompleted = booking.bookingStatut?.toLowerCase() === 'completed';

          return (
            <div className='border dark:border-slate-800 rounded-lg p-4 mb-2 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-all' key={index}>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Image
                  src={business?.images?.[0]?.url || '/placeholder.png'}
                  alt={business?.name || 'business'}
                  width={120} height={120}
                  className='rounded-lg object-cover w-[120px] h-[120px] border dark:border-slate-800'
                />
                <div className='flex flex-col gap-2 w-full'>
                  <div className='flex justify-between items-start'>
                    <h2 className='font-bold text-lg leading-tight dark:text-white'>{business?.name}</h2>
                    
                    {(isExpired || isStatusCompleted) ? (
                       <span className='text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-green-200 dark:border-green-800'>
                        <CheckCircle size={10} /> Completed
                       </span>
                    ) : (
                       <span className='text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-blue-200 dark:border-blue-800'>
                        <Clock size={10} /> Upcoming
                       </span>
                    )}
                  </div>
                  
                  <div className='space-y-1 text-sm text-gray-500 dark:text-slate-400'>
                    <h2 className='flex gap-2 items-center'><User className='h-4 w-4 text-primary' /> {business?.contactPerson}</h2>
                    <h2 className='flex gap-2 items-center'><MapPin className='h-4 w-4 text-primary' /> {business?.address}</h2>
                    <div className='mt-1 space-y-1'>
                      <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-xs items-center font-medium'>
                        <Calendar className='text-blue-500' size={14}/> 
                        From: <span className='text-slate-800 dark:text-slate-200 font-bold'>{booking.date}</span>
                      </h2>
                      <h2 className='flex gap-2 text-slate-500 dark:text-slate-400 text-xs items-center font-medium'>
                        <Calendar className='text-blue-500' size={14}/> 
                        To: <span className='text-slate-800 dark:text-slate-200 font-bold'>{booking.time}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {type === 'booked' && !isExpired && !isStatusCompleted ? (
                <div className='flex gap-2 mt-4'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full border-red-200 dark:border-red-900/50 hover:bg-red-500 text-red-500 dark:hover:bg-red-500">Cancel</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">Cancel Appointment?</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            Are you sure you want to cancel your appointment with {business?.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:bg-slate-800 dark:text-white">Go Back</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => cancelAppointment(booking)}>Confirm Cancellation</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"><MessageSquare size={16} /> Chat</Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-[400px] dark:border-slate-800">
                            <ChatComponent bookingId={booking.id} currentUserEmail={session?.user?.email} recipientName={business?.contactPerson} />
                        </DialogContent>
                    </Dialog>
                </div>
              ) : (
                <div className='mt-5 py-2 px-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center'>
                    <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>Service Completed</p>
                </div>
              )}
            </div>
          )
        }) : (
          <div className='col-span-full text-center p-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed dark:border-slate-800'>
            <h2 className='text-slate-400 dark:text-slate-600 font-medium'>No records found.</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistoryList;