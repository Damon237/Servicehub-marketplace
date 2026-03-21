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
import { MapPin, Loader2 } from 'lucide-react';
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTime, setSelectedTime] = useState();
  const [bookedSlot, setBookedSlot] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false); 
  const [distance, setDistance] = useState(null); 
  const { data } = useSession();

  useEffect(() => {
    getTime();
    calculateUserDistance(); 
  }, []);

  useEffect(() => {
    if (date && business?.id) {
      BusinessBookedSlot();
      setSelectedTime(null);
    }
  }, [date, business?.id]);

  const calculateUserDistance = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      
      // ✅ FIX: Access nested location object
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

  // --- SCHOOL PROJECT PAYMENT SIMULATION ---
  const handleBookingProcess = () => {
    if (!business?.id || !selectedTime || !date || !data?.user?.email) {
      toast('Please complete all fields');
      return;
    }

    setIsPaying(true);
    toast.info("Connecting to MTN/Orange Money Gateway...");

    setTimeout(() => {
      setIsPaying(false);
      toast.success('Payment Successful (Simulated XAF 2,000)');
      saveBooking(); 
    }, 2500);
  };

  const BusinessBookedSlot = () => {
    if (!business?.id) return;
    const formattedDate = moment(date).format('DD-MMM-YYYY');
    GlobalApi.BusinessBookedSlot(business.id, formattedDate)
      .then(resp => {
        setBookedSlot(resp?.bookings || []);
      })
      .catch(error => {
        toast('Error loading slots');
      });
  };

  const getTime = () => {
    const timeList = [];
    for (let i = 10; i <= 12; i++) {
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
        data.user.email,
        data.user.name
      );
      if (resp) {
        toast.success('Service Booked successfully! 🎉');
        setSelectedTime('');
        BusinessBookedSlot();
      }
    } catch (error) {
      toast.error('Error while saving booking');
    } finally {
      setIsLoading(false);
    }
  };

  const isSlotBooked = (time) => {
    return bookedSlot.find(item => item.time === time);
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="overflow-y-auto w-full sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Book a Service</SheetTitle>
            <SheetDescription>
              A deposit of 2,000 XAF is required to confirm your appointment.
            </SheetDescription>
          </SheetHeader>

          {distance && (
            <div className="flex gap-2 items-center mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
              <MapPin className="h-4 w-4" />
              Provider is <strong>{distance} km</strong> away from you.
            </div>
          )}

          <div className="mt-6 flex flex-col items-center sm:items-start space-y-4">
            <h2 className="font-semibold text-lg">Select Date</h2>
            <div className='flex justify-center w-full'>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border bg-white shadow-sm"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg text-center sm:text-left">Select Time Slot</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
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
                      rounded-full p-2 px-1 text-[13px] sm:text-sm font-medium transition-all
                      ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600' : 'hover:bg-blue-50 text-blue-600 border-blue-100'}
                      ${(isBooked || isPast) ? 'opacity-30 cursor-not-allowed bg-gray-50 text-gray-400' : ''}
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
            <div className="flex flex-col sm:flex-row gap-3 w-full">
               <SheetClose asChild>
                  <Button variant="outline" className="w-full sm:flex-1" disabled={isLoading || isPaying}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button 
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                  disabled={!selectedTime || !date || isLoading || isPaying}
                  onClick={handleBookingProcess}
                >
                  {isPaying ? (
                    <><Loader2 className="animate-spin mr-2" /> Processing MoMo...</>
                  ) : isLoading ? (
                    <><Loader2 className="animate-spin mr-2" /> Finalizing...</>
                  ) : (
                    'Pay & Book Now'
                  )}
                </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BookingSection;