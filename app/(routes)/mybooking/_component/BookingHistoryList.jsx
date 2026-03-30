"use client"
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
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
import moment from 'moment'

function BookingHistoryList({ bookingHistory, type }) {
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

  // MODIFIED LOGIC: Check if the CURRENT DATE is after the END DATE (booking.time)
  const isPastBooking = (bookingEndDate) => {
    if (!bookingEndDate) return false;
    // Standardize: A booking is past if current time is after the END of that date
    const endOfBookingDay = moment(bookingEndDate, 'DD-MMM-YYYY').endOf('day');
    return moment().isAfter(endOfBookingDay);
};

  const deletePastBookings = async () => {
    const pastBookings = bookingHistory.filter(booking => 
      isPastBooking(booking.time) || booking.bookingStatut === 'Completed'
    );

    if (pastBookings.length === 0) {
      toast.info("No completed records to clear.");
      return;
    }

    try {
      toast.loading("Clearing history...", { id: 'clear-toast' });
      for (const booking of pastBookings) {
        await GlobalApi.deleteBooking(booking.id);
      }
      toast.success('History Cleared Successfully!', { id: 'clear-toast' });
      setTimeout(() => { window.location.reload(); }, 1000);
    } catch (e) {
      toast.error('Failed to clear some records.', { id: 'clear-toast' });
      console.error("Batch Delete Error:", e);
    }
  }

  const hasCompletedBookings = bookingHistory?.some(booking => 
    isPastBooking(booking.time) || booking.bookingStatut === 'Completed'
  );

  return (
    <div className='mt-5'>
      {bookingHistory?.length > 0 && hasCompletedBookings && (
        <div className='flex justify-end mb-4'>
           <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 flex gap-2 items-center text-sm font-semibold">
                    <Trash2 size={16}/> Clear Completed History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Completed Records?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all past and completed service records from your view.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <AlertDialogCancel className="rounded-xl mt-0 border-slate-200">Keep Records</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600 rounded-xl" 
                      onClick={deletePastBookings}
                    >
                      Yes, Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 px-2 sm:px-0'>
        {bookingHistory?.length > 0 ? bookingHistory.map((booking, index) => {
          
          const business = Array.isArray(booking.businessList) 
                          ? booking.businessList[0] 
                          : booking.businessList;
          
          // CRITICAL FIX: isExpired now looks at the END DATE (booking.time)
          const isExpired = isPastBooking(booking.time);
          const isStatusCompleted = booking.bookingStatut === 'Completed';
          const isPostponed = booking.bookingStatut === 'Postponed';

          return (
            <div className='border rounded-lg p-4 mb-2 shadow-sm bg-white hover:shadow-md transition-shadow' key={index}>
              {business ? (
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Image
                    src={business?.images?.[0]?.url || '/placeholder.png'}
                    alt={business?.name || 'business'}
                    width={120}
                    height={120}
                    className='rounded-lg object-cover w-full sm:w-[120px] h-[140px] sm:h-[120px]'
                  />
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='flex justify-between items-start'>
                      <h2 className='font-bold text-lg'>{business?.name}</h2>
                      <div className='flex flex-col items-end gap-1'>
                          {(isExpired || isStatusCompleted) && (
                             <span className='text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-green-200'>
                              <CheckCircle size={10} /> Completed
                             </span>
                          )}
                          {!isExpired && !isStatusCompleted && (
                             <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-blue-200'>
                              <Clock size={10} /> Upcoming
                             </span>
                          )}
                      </div>
                    </div>
                    
                    <div className='space-y-1'>
                      <h2 className='flex gap-2 text-primary items-center text-sm font-medium'>
                        <User className='h-4 w-4' /> {business?.contactPerson || 'Artisan'}
                      </h2>
                      <h2 className='flex gap-2 text-gray-500 items-start text-sm'>
                        <MapPin className='text-primary h-4 w-4 mt-1 flex-shrink-0' /> 
                        <span className='line-clamp-1'>{business?.address}</span>
                      </h2>
                      <h2 className='flex gap-2 text-gray-500 items-center text-sm'>
                        <Calendar className='text-primary h-4 w-4' /> 
                        From: <span className='text-black font-semibold'>{booking.date}</span>
                      </h2>
                      <h2 className='flex gap-2 text-gray-500 items-center text-sm'>
                        <Calendar className='text-primary h-4 w-4' /> 
                        To: <span className='text-black font-semibold'>{booking.time}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              ) : (
                  <div className='flex items-center justify-center h-[120px] bg-slate-50 rounded-lg border-2 border-dashed'>
                      <p className='text-xs text-slate-400 italic'>Business info unavailable</p>
                  </div>
              )}

              {/* ACTION BUTTONS */}
              {type === 'booked' && !isExpired && !isStatusCompleted ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="mt-5 w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold">
                      Cancel Appointment
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Service Request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will release your slot. The artisan will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                      <AlertDialogCancel className="rounded-xl mt-0 border-slate-200">Keep Booking</AlertDialogCancel>
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
                  <div className='mt-5 py-2 px-4 bg-slate-100 rounded-lg text-center'>
                      <p className='text-xs text-slate-500 font-medium'>
                        {isExpired ? "Service Completed" : "Booking is finalized"}
                      </p>
                  </div>
              )}
            </div>
          )
        }) : (
          <div className='col-span-full text-center p-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
            <h2 className='text-slate-400 font-medium'>No {type} service records found in your account.</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistoryList