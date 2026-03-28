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
  // Changed to range state to handle interval of days
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: moment().add(1, 'days').toDate()
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
    // Check for range selection instead of single date/time
    if (!business?.id || !dateRange?.from || !dateRange?.to || !session?.user?.email) {
      toast.error('Please select a valid date interval and login');
      return;
    }

    setIsPaying(true);
    toast.info("Connecting to Mobile Money Gateway...");

    setTimeout(() => {
      setIsPaying(false);
      toast.success('Payment Successful (2,000 XAF Deposit Received)');
      saveBooking(); 
    }, 2500);
  };

const saveBooking = async () => {
  setIsLoading(true);
  try {
    // Format the dates as strings
    const startDate = moment(dateRange.from).format('DD-MMM-YYYY');
    const endDate = moment(dateRange.to).format('DD-MMM-YYYY');
    
    const resp = await GlobalApi.createIntervalBooking(
      business.id,
      startDate,
      endDate,
      session?.user?.email, // Ensure session exists
      session?.user?.name || "Guest User"
    );

    if (resp) {
      toast.success(`Service Booked from ${startDate} to ${endDate}! 🎉`);
      // Optional: you could add a state to close the sheet here
    }
  } catch (error) {
    console.error("❌ Booking Error Details:", error);
    toast.error('Booking failed. Check your API permissions or console for details.');
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
              Complete the payment to secure your interval with <strong> {business.name}</strong>.
            </SheetDescription>
          </SheetHeader>

          {distance && (
            <div className="flex gap-2 items-center mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100 animate-pulse">
              <MapPin className="h-4 w-4" />
              Provider is roughly <strong>{distance} km</strong> away.
            </div>
          )}

          {/* DATE RANGE SELECTION SECTION */}
          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" /> Select Date Interval
            </h2>
            <div className='flex justify-center w-full'>
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    className="rounded-xl border bg-white shadow-sm"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>
            {dateRange?.from && dateRange?.to && (
                <p className="text-center text-sm text-blue-600 font-medium">
                    {moment(dateRange.from).format('LL')} — {moment(dateRange.to).format('LL')}
                </p>
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
                        <span>Operators:</span>
                        <span>MTN/Orange Money</span>
                    </div>
                </div>

                <div className='flex gap-2'>
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 rounded-xl" disabled={isLoading || isPaying}>
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg"
                        disabled={!dateRange?.from || !dateRange?.to || isLoading || isPaying}
                        onClick={handleBookingProcess}
                    >
                        {isPaying ? (
                            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> MoMo Pay...</>
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