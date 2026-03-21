// 📁 File: /components/BookingSection.js
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

function BookingSection({ children, business }) {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTime, setSelectedTime] = useState();
  const [bookedSlot, setBookedSlot] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSession();

  useEffect(() => {
    getTime();
  }, []);

  useEffect(() => {
    if (date && business?.id) {
      BusinessBookedSlot();
      setSelectedTime(null);
    }
  }, [date, business?.id]);

  const BusinessBookedSlot = () => {
    if (!business?.id) return;
    const formattedDate = moment(date).format('DD-MMM-YYYY');
    GlobalApi.BusinessBookedSlot(business.id, formattedDate)
      .then(resp => {
        setBookedSlot(resp?.bookings || []);
      })
      .catch(error => {
        console.error(error);
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
    if (!business?.id || !selectedTime || !date || !data?.user?.email) {
      toast('Please complete all fields');
      return;
    }
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
      if (resp?.createBooking?.id) {
        toast('Service Booked successfully! 🎉');
        setSelectedTime('');
        BusinessBookedSlot();
      }
    } catch (error) {
      toast('Error while booking');
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
        {/* FIX: Added sm:max-w-[500px] and w-full for Android screens */}
        <SheetContent className="overflow-y-auto w-full sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Book a Service</SheetTitle>
            <SheetDescription>Select a date and time slot</SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col items-center sm:items-start space-y-4">
            <h2 className="font-semibold text-lg">Select Date</h2>
            {/* FIX: Simplified Calendar width for small screens */}
            <div className='flex justify-center w-full'>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border bg-white"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-lg text-center sm:text-left">Select Time Slot</h2>
            {/* FIX: Better grid for narrow Android devices */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
              {timeSlot.map((item, index) => {
                const isBooked = isSlotBooked(item.time);
                const isPast = isTimePast(item.time);
                const isSelected = selectedTime === item.time;
                
                return (
                  <Button
                    key={index}
                    disabled={isBooked || isPast || isLoading}
                    variant="outline"
                    className={`
                      rounded-full p-2 px-1 text-[13px] sm:text-sm font-medium transition-all
                      ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-50 text-blue-600'}
                      ${(isBooked || isPast) ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400' : ''}
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
            {/* FIX: Stack buttons vertically on very small screens, row on larger */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
               <SheetClose asChild>
                  <Button variant="destructive" className="w-full sm:flex-1" disabled={isLoading}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button 
                  className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={!selectedTime || !date || isLoading}
                  onClick={saveBooking}
                >
                  {isLoading ? 'Booking...' : 'Book Now'}
                </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BookingSection;