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

// 1. Logic Component (The Date Picker)
import { Calendar } from "@/components/ui/calendar"; 
import { Button } from '@/components/ui/button';
import GlobalApi from '@/app/_services/GlobalApi';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import moment from 'moment';

// 2. Visual Icons (Notice we rename Calendar to CalendarIcon here)
import { MapPin, Loader2, Clock, Calendar as CalendarIcon, Wallet } from 'lucide-react'; 
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTime, setSelectedTime] = useState();
  const [bookedSlot, setBookedSlot] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false); 
  const [distance, setDistance] = useState(null); 
  const { data: session } = useSession();

  useEffect(() => {
    getTime();
    calculateUserDistance(); 
  }, [business]);

  useEffect(() => {
    if (date && business?.id) {
      getBusinessBookedSlots();
      setSelectedTime(null);
    }
  }, [date, business?.id]);

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
    if (!business?.id || !selectedTime || !date || !session?.user?.email) {
      toast.error('Please complete all fields and login');
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

  const getBusinessBookedSlots = () => {
    if (!business?.id) return;
    const formattedDate = moment(date).format('DD-MMM-YYYY'); 
    GlobalApi.BusinessBookedSlot(business.id, formattedDate)
      .then(resp => {
        setBookedSlot(resp?.bookings || []);
      })
      .catch(error => {
        console.error("❌ Error loading slots:", error);
      });
  };

  const getTime = () => {
    const timeList = [];
    for (let i = 8; i <= 12; i++) {
      timeList.push({ time: i + ':00 AM' });
      timeList.push({ time: i + ':30 AM' });
    }
    for (let i = 1; i <= 6; i++) {
      timeList.push({ time: i + ':00 PM' });
      timeList.push({ time: i + ':30 PM' });
    }
    setTimeSlot(timeList);
  };

  const isTimePast = (slotTime) => {
    const today = moment().format('DD-MMM-YYYY');
    const selectedDate = moment(date).format('DD-MMM-YYYY');
    if (today === selectedDate) {
      const currentTime = moment();
      const slotTimeMoment = moment(slotTime, 'h:mm A');
      return slotTimeMoment.isBefore(currentTime);
    }
    return false;
  };

  const saveBooking = async () => {
    setIsLoading(true);
    try {
      const formattedDate = moment(date).format('DD-MMM-YYYY');
      const resp = await GlobalApi.createNewBooking(
        business.id,
        formattedDate,
        selectedTime,
        session.user.email,
        session.user.name
      );

      if (resp) {
        toast.success('Service Booked successfully! 🎉');
        setSelectedTime(null);
        getBusinessBookedSlots();
      }
    } catch (error) {
      console.error("❌ Save booking error:", error);
      toast.error('Booking failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSlotBooked = (time) => {
    return bookedSlot.some(item => item.time === time);
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="overflow-y-auto w-full sm:max-w-[500px] border-l-primary">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-primary">Confirm Booking</SheetTitle>
            <SheetDescription className="text-slate-500">
              Complete the payment to secure your appointment with <strong>{business.name}</strong>.
            </SheetDescription>
          </SheetHeader>

          {distance && (
            <div className="flex gap-2 items-center mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100 animate-pulse">
              <MapPin className="h-4 w-4" />
              Provider is roughly <strong>{distance} km</strong> away.
            </div>
          )}

          {/* DATE SELECTION SECTION */}
          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
                {/* Changed to CalendarIcon to avoid duplication */}
                <CalendarIcon className="h-5 w-5 text-primary" /> Select Date
            </h2>
            <div className='flex justify-center w-full'>
                {/* This is the actual UI Date Picker */}
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    className="rounded-xl border bg-white shadow-sm"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>
          </div>

          {/* TIME SLOT SECTION */}
          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Available Hours
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlot.map((item, index) => {
                const isBooked = isSlotBooked(item.time);
                const isPast = isTimePast(item.time);
                const isSelected = selectedTime === item.time;
                
                return (
                  <Button
                    key={index}
                    disabled={isBooked || isPast || isLoading || isPaying}
                    variant="outline"
                    className={`
                      rounded-lg p-2 text-[12px] font-medium transition-all duration-300
                      ${isSelected ? 'bg-primary text-white scale-105' : 'hover:border-primary text-slate-600'}
                      ${(isBooked || isPast) ? 'bg-slate-50 text-slate-300 border-slate-100' : ''}
                    `}
                    onClick={() => setSelectedTime(item.time)}
                  >
                    {item.time}
                  </Button>
                );
              })}
            </div>
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
                        disabled={!selectedTime || !date || isLoading || isPaying}
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