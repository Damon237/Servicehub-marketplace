"use client"
import React, { useEffect, useState, useMemo } from 'react';
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

import { MapPin, Loader2, Calendar as CalendarIcon, Wallet, AlertCircle, Info, Star } from 'lucide-react'; 
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: undefined 
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [hasSeenChargeAlert, setHasSeenChargeAlert] = useState(false); // Only once logic
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasDismissedRating, setHasDismissedRating] = useState(false); // Only once logic

  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false); 
  const [distance, setDistance] = useState(null); 
  const [existingBookings, setExistingBookings] = useState([]); 
  const { data: session } = useSession();

  const duration = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return moment(dateRange.to).diff(moment(dateRange.from), 'days') + 1;
    }
    return 0;
  }, [dateRange]);

  useEffect(() => {
    calculateUserDistance(); 
    if (business) {
        getExistingBookings();
    }
  }, [business]);

  // Alert for charges - appears ONLY ONCE
  useEffect(() => {
    if (duration > 3 && !hasSeenChargeAlert) {
      setShowChargeModal(true);
      setHasSeenChargeAlert(true);
    }
  }, [duration, hasSeenChargeAlert]);

  const getExistingBookings = () => {
    if (!business?.id) return;
    GlobalApi.getBusinessBookings(business.id).then(resp => {
        setExistingBookings(resp.bookings || []);
    }).catch(err => {
        console.error("Error fetching bookings:", err);
    });
  };

  const calculateUserDistance = async () => {
    if (!business || !business.location) {
      setDistance("N/A");
      return;
    }

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
          const bizLat = parseFloat(business.location.latitude || business.location.lat);
          const bizLng = parseFloat(business.location.longitude || business.location.lng);

          if (!isNaN(bizLat) && !isNaN(bizLng)) {
            try {
              const dist = calculateDistance(userCoords, { lat: bizLat, lng: bizLng });
              setDistance(dist.toFixed(1));
            } catch (error) { setDistance("N/A"); }
          }
        },
        () => setDistance("Blocked"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleSimulatedPayment = (operator) => {
    setSelectedOperator(operator);
    setShowPaymentModal(false);
    setIsPaying(true);
    toast.info(`Sending ${operator} push notification...`);

    setTimeout(() => {
      toast.success(`Payment Confirmed via ${operator}`);
      saveBooking();
    }, 4000);
  };

  const saveBooking = async () => {
    setIsLoading(true);

    const bookingData = {
      businessId: business.id,
      startDate: moment(dateRange.from).format('DD-MMM-YYYY'),
      endDate: moment(dateRange.to).format('DD-MMM-YYYY'),
      userEmail: session.user.email,
      userName: session.user.name,
      providerEmail: business.email, 
      businessName: business.name
    };

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast("Booking successful! Provider notified.");
      } else {
        throw new Error();
      }
    } catch (e) {
      toast("Error while booking");
    } finally {
      setIsLoading(false);
      setIsPaying(false);
    }
  };

  const modifierStyles = {
    start: { backgroundColor: '#2563eb', color: 'white', borderRadius: '50% 0 0 50%' },
    finish: { backgroundColor: '#10b981', color: 'white', borderRadius: '0 50% 50% 0' }
  };

  return (
    <div>
      <Sheet onOpenChange={(open) => { 
        if(!open && !hasDismissedRating) setShowRatingModal(true) 
      }}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md bg-white">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl font-black text-slate-800 tracking-tighter">Book a Professional</SheetTitle>
            <SheetDescription className="text-slate-500 italic">
                Schedule {business?.name} for your task.
            </SheetDescription>
          </SheetHeader>

          <div className='py-8 space-y-8'>
            <div className='flex flex-col gap-3 items-baseline relative'>
                <div className='flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase'>
                    <CalendarIcon size={14}/>
                    Select Service Period
                </div>
                
                {/* CALENDAR CONTAINER FOR LOCAL MODALS */}
                <div className='relative w-full'>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) => 
                      date < new Date().setHours(0,0,0,0) || 
                      existingBookings.some(bookedDate => moment(date).isSame(moment(bookedDate.date, 'DD-MMM-YYYY'), 'day'))
                    }
                    modifiers={{ start: dateRange?.from, finish: dateRange?.to }}
                    modifiersStyles={modifierStyles}
                    className="rounded-xl border p-4 bg-white w-full"
                  />

                  {/* LOCAL PAYMENT MODAL (Over Calendar) */}
                  {showPaymentModal && (
                    <div className="absolute inset-0 z-20 bg-white/95 flex flex-col justify-center p-6 animate-in fade-in duration-200 rounded-xl">
                      <h3 className="text-lg font-black text-slate-800 mb-4 text-center">Select Operator</h3>
                      <div className="grid gap-3">
                        <button onClick={() => handleSimulatedPayment('MTN')} className="flex items-center justify-between p-4 border-2 border-yellow-400 rounded-xl hover:bg-yellow-50">
                          <span className="font-bold text-sm text-slate-700">MTN MoMo</span>
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black">MTN</div>
                        </button>
                        <button onClick={() => handleSimulatedPayment('Orange')} className="flex items-center justify-between p-4 border-2 border-orange-500 rounded-xl hover:bg-orange-50">
                          <span className="font-bold text-sm text-slate-700">Orange Money</span>
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">OM</div>
                        </button>
                      </div>
                      <Button variant="ghost" className="mt-4 text-slate-400" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                    </div>
                  )}

                  {/* LOCAL CHARGE MODAL (Over Calendar) */}
                  {showChargeModal && (
                    <div className="absolute inset-0 z-30 bg-blue-600 flex flex-col items-center justify-center p-6 text-center text-white rounded-xl animate-in zoom-in duration-200">
                      <Info size={32} className="mb-2" />
                      <h4 className="font-bold text-lg">Pricing Note</h4>
                      <p className="text-xs opacity-90 my-2">Each day added after the first 3 days incurs a charge of 500 XAF.</p>
                      <Button className="mt-2 bg-white text-blue-600 font-bold hover:bg-slate-100" onClick={() => setShowChargeModal(false)}>Got it</Button>
                    </div>
                  )}
                </div>
            </div>

            <div className='bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 space-y-4'>
                <div className='flex justify-between items-center'>
                    <span className='text-xs font-bold text-slate-400 uppercase'>Service Distance</span>
                    <span className='text-sm font-black text-slate-700 flex items-center gap-1'>
                        <MapPin size={14} className='text-blue-500'/> 
                        {distance === null ? 'Calculating...' : (distance === "N/A" || distance === "Blocked") ? distance : `${distance} km`}
                    </span>
                </div>

                <div className='pt-4 border-t border-slate-200 space-y-3'>
                    <div className='flex justify-between'>
                        <span className='text-sm text-slate-500'>Base Rate (3 days)</span>
                        <span className='text-sm font-bold text-slate-800'>2,000 XAF</span>
                    </div>
                </div>

                <div className='pt-4 border-t-2 border-white flex justify-between items-end'>
                    <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase'>Total Payable</p>
                        <h2 className='text-3xl font-black text-slate-900 tracking-tighter'>
                            {duration > 0 ? (
                                (duration <= 3 ? 2000 : 2000 + (duration - 3) * 500).toLocaleString()
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
                        onClick={() => setShowPaymentModal(true)}
                    >
                        {isPaying ? "Processing..." : isLoading ? "Saving..." : "Pay & Confirm"}
                    </Button>
                </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* GLOBAL RATING MODAL (Appears once when sheet closes) */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xs shadow-2xl text-center animate-in zoom-in">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                <Star size={24} fill="currentColor" />
            </div>
            <h4 className="font-black text-slate-800 text-lg">Feedback</h4>
            <p className="text-sm text-slate-500 my-2">Please remember to rate and comment on the provider's profile!</p>
            <Button 
              className="w-full mt-4 rounded-xl border-2 border-slate-200" 
              variant="outline" 
              onClick={() => {
                setShowRatingModal(false);
                setHasDismissedRating(true);
              }}
            >
              Got It!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingSection;