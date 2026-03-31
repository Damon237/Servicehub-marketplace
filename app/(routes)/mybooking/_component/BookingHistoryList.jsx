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
                  <Button variant="ghost" className="text-red-500 hover:bg-red-50 flex gap-2 items-center text-sm font-semibold">
                    <Trash2 size={16}/> Clear Completed History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Records?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500" onClick={deletePastBookings}>Clear</AlertDialogAction>
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
            <div className='border rounded-lg p-4 mb-2 shadow-sm bg-white hover:shadow-md transition-shadow' key={index}>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Image
                  src={business?.images?.[0]?.url || '/placeholder.png'}
                  alt={business?.name || 'business'}
                  width={120} height={120}
                  className='rounded-lg object-cover w-[120px] h-[120px]'
                />
                <div className='flex flex-col gap-2 w-full'>
                  <div className='flex justify-between items-start'>
                    <h2 className='font-bold text-lg leading-tight'>{business?.name}</h2>
                    {/* Green Status Badge */}
                    {(isExpired || isStatusCompleted) ? (
                       <span className='text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-green-200'>
                        <CheckCircle size={10} /> Completed
                       </span>
                    ) : (
                       <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold border border-blue-200'>
                        <Clock size={10} /> Upcoming
                       </span>
                    )}
                  </div>
                  
                  <div className='space-y-1 text-sm text-gray-500'>
                    <h2 className='flex gap-2 items-center'><User className='h-4 w-4 text-primary' /> {business?.contactPerson}</h2>
                    <h2 className='flex gap-2 items-center'><MapPin className='h-4 w-4 text-primary' /> {business?.address}</h2>
                    <h2 className='flex gap-2 items-center'><Calendar className='h-4 w-4 text-primary' /> From: {booking.date}</h2>
                    <h2 className='flex gap-2 items-center'><Calendar className='h-4 w-4 text-primary' /> To: {booking.time}</h2>
                  </div>
                </div>
              </div>

              {type === 'booked' && !isExpired && !isStatusCompleted ? (
                <div className='flex gap-2 mt-4'>
                    <Button variant="outline" className="w-full border-red-200 text-red-500" onClick={() => cancelAppointment(booking)}>Cancel</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full gap-2"><MessageSquare size={16} /> Chat</Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-[400px]">
                            <ChatComponent bookingId={booking.id} currentUserEmail={session?.user?.email} recipientName={business?.contactPerson} />
                        </DialogContent>
                    </Dialog>
                </div>
              ) : (
                <div className='mt-5 py-2 px-4 bg-slate-100 rounded-lg text-center'>
                    <p className='text-xs text-slate-500 font-medium'>Service Completed</p>
                </div>
              )}
            </div>
          )
        }) : (
          <div className='col-span-full text-center p-20 bg-slate-50 rounded-2xl'>
            <h2 className='text-slate-400 font-medium'>No records found.</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistoryList;