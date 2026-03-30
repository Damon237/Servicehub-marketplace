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

import { MapPin, Loader2, Calendar as CalendarIcon, Wallet, AlertCircle } from 'lucide-react'; 
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: undefined 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false); 
  const [distance, setDistance] = useState(null); 
  const [existingBookings, setExistingBookings] = useState([]); // Store booked dates
  const { data: session } = useSession();

  useEffect(() => {
    calculateUserDistance(); 
    if (business) {
        getExistingBookings();
    }

    // REMINDER POP UP: When component unmounts (sheet closes)
    return () => {
      toast("Don't forget to rate and comment on the service provider's profile!");
    };
  }, [business]);

  // CHARGE NOTIFICATION: Detect if range is > 3 days
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = moment(dateRange.to).diff(moment(dateRange.from), 'days') + 1;
      if (days > 3) {
        toast.info(`Note: Each additional day after the first 3 will be charged an extra 500 XAF.`, {
          description: "Base rate covers the first 3 days.",
        });
      }
    }
  }, [dateRange]);

  const getExistingBookings = () => {
    if (!business?.id) return;
    GlobalApi.getBusinessBookings(business.id).then(resp => {
        setExistingBookings(resp.bookings || []);
    }).catch(err => {
        console.error("Error fetching bookings:", err);
    });
  };

  const calculateUserDistance = async () => {
    if (!business || !business.location) return;

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const bizCoords = {
          lat: business.location?.latitude,
          lng: business.location?.longitude,
        };

        if (bizCoords.lat && bizCoords.lng) {
          const dist = calculateDistance(userCoords, bizCoords);
          setDistance(dist.toFixed(1));
        }
      });
    }
  };

  const handleBookingProcess = async () => {
    if (!session) {
      toast("Please login to book");
      return;
    }
    setIsPaying(true);
    setTimeout(() => {
      saveBooking();
    }, 2000);
  };

  const saveBooking = () => {
    setIsLoading(true);

    const bId = business.id;
    const startDate = moment(dateRange.from).format('DD-MMM-YYYY');
    const endDate = moment(dateRange.to).format('DD-MMM-YYYY');
    const uEmail = session.user.email;
    const uName = session.user.name;

    GlobalApi.createNewBooking(bId, startDate, endDate, uEmail, uName)
      .then(resp => {
        if (resp) {
          setIsLoading(false);
          setIsPaying(false);
          toast("Booking successful and payment confirmed!");
        }
      }).catch((e) => {
        setIsLoading(false);
        setIsPaying(false);
        console.error("Booking Error:", e);
        toast("Error while booking");
      });
  };

  const modifierStyles = {
    start: { 
      backgroundColor: '#2563eb', 
      color: 'white',
      borderRadius: '50% 0 0 50%' 
    },
    finish: { 
      backgroundColor: '#10b981', 
      color: 'white',
      borderRadius: '0 50% 50% 0' 
    }
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md border-l-0 shadow-2xl bg-white">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl font-black tracking-tighter text-slate-800">Book a Professional</SheetTitle>
            <SheetDescription className="text-slate-500 font-medium italic">
                Schedule {business?.name} for your task.
            </SheetDescription>
          </SheetHeader>

          <div className='py-8 space-y-8'>
            <div className='flex flex-col gap-3 items-baseline'>
                <div className='flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider'>
                    <CalendarIcon size={14}/>
                    Select Service Period
                </div>
                
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => 
                    date < new Date().setHours(0,0,0,0) || 
                    existingBookings.some(bookedDate => moment(date).isSame(moment(bookedDate.date, 'DD-MMM-YYYY'), 'day'))
                  }
                  modifiers={{
                    start: dateRange?.from,
                    finish: dateRange?.to,
                  }}
                  modifiersStyles={modifierStyles}
                  className="rounded-xl border shadow-sm p-4 bg-white"
                />
                
                <div className="flex gap-4 mt-1 text-[10px] font-bold uppercase text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div> Start Date
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Finish Date
                    </div>
                </div>
            </div>

            <div className='bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 space-y-4'>
                <div className='flex justify-between items-center'>
                    <span className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Service Distance</span>
                    <span className='text-sm font-black text-slate-700 flex items-center gap-1'>
                        <MapPin size={14} className='text-blue-500'/> {distance ? `${distance} km` : 'Calculating...'}
                    </span>
                </div>

                <div className='pt-4 border-t border-slate-200 space-y-3'>
                    <div className='flex justify-between'>
                        <span className='text-sm text-slate-500'>Base Rate (3 days)</span>
                        <span className='text-sm font-bold text-slate-800'>2,000 XAF</span>
                    </div>
                    
                    {dateRange?.from && dateRange?.to && (
                        <div className='flex justify-between'>
                            <span className='text-sm text-slate-500 font-medium'>Duration</span>
                            <span className='text-sm font-bold text-blue-600'>
                                {moment(dateRange.to).diff(moment(dateRange.from), 'days') + 1} Days
                            </span>
                        </div>
                    )}
                </div>

                <div className='pt-4 border-t-2 border-white flex justify-between items-end'>
                    <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase'>Total Payable</p>
                        <h2 className='text-3xl font-black text-slate-900 tracking-tighter'>
                            {dateRange?.from && dateRange?.to ? (
                                (() => {
                                    const days = moment(dateRange.to).diff(moment(dateRange.from), 'days') + 1;
                                    const price = days <= 3 ? 2000 : 2000 + (days - 3) * 500;
                                    return price.toLocaleString();
                                })()
                            ) : "2,000"}
                            <span className='text-sm ml-1 text-slate-500'>XAF</span>
                        </h2>
                    </div>
                    <div className='bg-blue-600 p-2 rounded-lg text-white'>
                        <Wallet size={20}/>
                    </div>
                </div>
            </div>
          </div>

          <SheetFooter className="mt-4">
            <div className='w-full space-y-3'>
                <div className='flex gap-2'>
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 rounded-xl" disabled={isLoading || isPaying}>
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                        disabled={!dateRange?.from || !dateRange?.to || isLoading || isPaying}
                        onClick={handleBookingProcess}
                    >
                        {isPaying ? "Processing..." : isLoading ? "Saving..." : "Pay & Confirm"}
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