"use client"
import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Calendar } from "@/components/ui/calendar"; 
import { Button } from '@/components/ui/button';
import GlobalApi from '@/app/_services/GlobalApi';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import moment from 'moment';

import { MapPin, Loader2, Calendar as CalendarIcon, Wallet } from 'lucide-react'; 
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
  // Initialize with a clear range
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: undefined // Let the user pick the end date
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false); 
  const [distance, setDistance] = useState(null); 
  const { data: session } = useSession();

  useEffect(() => {
    calculateUserDistance(); 
  }, [business]);

  const calculateUserDistance = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      
      if (business?.location?.latitude && business?.location?.longitude) {
        const dist = calculateDistance(
          userLat, 
          userLon, 
          business.location.latitude, 
          business.location.longitude
        );
        setDistance(dist.toFixed(1));
      }
    });
  };

  const handleBookingProcess = () => {
    // CRITICAL FIX: Ensure both dates are selected
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select both a Start and End date.');
      return;
    }

    if (!session) {
      toast.error('Please login to continue');
      return;
    }

    setIsPaying(true);
    const toastId = toast.info("Connecting to Mobile Money Gateway...", { duration: Infinity });

    // Simulate Payment Gateway (MTN/Orange Money)
    setTimeout(() => {
      setIsPaying(false);
      toast.dismiss(toastId);
      toast.success('Payment Successful (2,000 XAF Deposit Received)');
      saveBooking(); 
    }, 2500);
  };

  const saveBooking = async () => {
    setIsLoading(true);
    try {
      // Format the dates consistently for Hygraph
      const startDate = moment(dateRange.from).format('DD-MMM-YYYY');
      const endDate = moment(dateRange.to).format('DD-MMM-YYYY');
      
      const resp = await GlobalApi.createIntervalBooking(
        business.id,
        startDate,
        endDate,
        session?.user?.email,
        session?.user?.name || "Guest User"
      );

      if (resp) {
        toast.success(`Service Booked: ${startDate} to ${endDate}! 🎉`);
        // Reset range after success
        setDateRange({ from: new Date(), to: undefined });
      }
    } catch (error) {
      console.error("❌ Booking Error Details:", error);
      toast.error('Booking failed. Check your API permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="overflow-y-auto w-full sm:max-w-[500px] border-l-blue-500">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-blue-500">Confirm Booking</SheetTitle>
            <SheetDescription className="text-slate-500">
              Secure your service interval with <strong>{business.name}</strong>.
            </SheetDescription>
          </SheetHeader>

          {distance && (
            <div className="flex gap-2 items-center mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
              <MapPin className="h-4 w-4" />
              Artisan is <strong>{distance} km</strong> away from you.
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" /> Select Date Interval
            </h2>
            <div className='flex justify-center w-full'>
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    className="rounded-xl border bg-white shadow-md"
                    // FIX: Normalized comparison to allow current day and future month dates
                    disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); 
                        return date < today;
                    }}
                />
            </div>
            {dateRange?.from && dateRange?.to ? (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-center text-sm text-blue-700 font-bold">
                        {moment(dateRange.from).format('DD MMM')} — {moment(dateRange.to).format('DD MMM, YYYY')}
                    </p>
                    <p className="text-center text-[10px] text-blue-500 mt-1 uppercase tracking-wider font-semibold">
                       Total: {moment(dateRange.to).diff(moment(dateRange.from), 'days') + 1} Days
                    </p>
                </div>
            ) : (
                <p className="text-center text-xs text-slate-400 italic">Please select a start and end date on the calendar</p>
            )}
          </div>

          <SheetFooter className="mt-8 pb-10">
            <div className="flex flex-col gap-3 w-full">
                <div className='bg-slate-50 p-4 rounded-xl border border-slate-200'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-slate-500'>Booking Deposit:</span>
                        <span className='font-bold text-slate-800'>2,000 XAF</span>
                    </div>
                    <div className='flex justify-between text-xs text-slate-400 mt-1'>
                        <span>Payment via:</span>
                        <span>Mobile Money (Cameroon)</span>
                    </div>
                </div>

                <div className='flex gap-2'>
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 rounded-xl" disabled={isLoading || isPaying}>
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg"
                        disabled={!dateRange?.from || !dateRange?.to || isLoading || isPaying}
                        onClick={handleBookingProcess}
                    >
                        {isPaying ? (
                            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</>
                        ) : isLoading ? (
                            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
                        ) : (
                            <><Wallet className="mr-2 h-4 w-4" /> Pay & Confirm</>
                        )}
                    </Button>
                </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BookingSection;