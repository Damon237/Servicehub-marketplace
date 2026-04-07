"use client"
import React, { useEffect, useState, useMemo } from 'react';
import {
    Sheet,
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
import { Star, Loader2, AlertCircle, Wallet, Info, CheckCircle2, Calendar as CalendarIcon, Receipt, MapPin } from 'lucide-react';
import { calculateDistance } from '@/utils/distance';

function BookingSection({ children, business }) {
    const { data: session } = useSession();
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: undefined
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState('MTN'); 
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        if (business?.id) {
            getBusinessBookings();
        }
        
        if (business?.location && typeof window !== 'undefined') {
            navigator.geolocation.getCurrentPosition((pos) => {
                const userPoint = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                const businessPoint = {
                    lat: business.location.latitude,
                    lng: business.location.longitude
                };
                
                const dist = calculateDistance(userPoint, businessPoint);
                setDistance(dist.toFixed(1));
            }, (err) => {
                console.error("Location access denied", err);
            });
        }
    }, [business]);

    const getBusinessBookings = async () => {
        try {
            const resp = await GlobalApi.BusinessBookedSlot(business.id);
            if (resp && resp.bookings) {
                const dates = resp.bookings.map(item => new Date(item.date));
                setBookedDates(dates);
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
        }
    }

    const bookingDetails = useMemo(() => {
        // FIXED: Added safety check to prevent "Cannot read properties of undefined (reading 'from')"
        if (!dateRange || !dateRange.from || !dateRange.to) {
            return { totalDays: 0, extraCharge: 0, totalAmount: 2000, extraDays: 0 };
        }
        
        const start = moment(dateRange.from);
        const end = moment(dateRange.to);
        const duration = end.diff(start, 'days') + 1; 
        
        const baseAmount = 2000;
        const extraDays = duration > 3 ? duration - 3 : 0;
        const extraCharge = extraDays * 250;
        
        return {
            totalDays: duration,
            extraDays: extraDays,
            extraCharge: extraCharge,
            totalAmount: baseAmount + extraCharge
        };
    }, [dateRange]);

    const saveBooking = async () => {
    if (!dateRange?.from || !dateRange?.to) {
        toast.error("Please select a date range");
        return;
    }
    setIsLoading(true);
    try {
        // 1. Create the booking in your database
        const resp = await GlobalApi.createNewBooking(
            business.id,
            moment(dateRange.from).format('DD-MMM-YYYY'),
            moment(dateRange.to).format('DD-MMM-YYYY'),
            session.user.email,
            session.user.name
        );

        if (resp) {
            // 2. Notify the Service Provider using Resend
            try {
                await GlobalApi.createNotification({
                    // Aligning keys with your API's expected destructuring
                    providerEmail: business.contactPersonEmail || business.email, 
                    customerName: session.user.name,
                    customerEmail: session.user.email,
                    serviceName: business.name,
                    startDate: moment(dateRange.from).format('DD-MMM-YYYY'),
                    endDate: moment(dateRange.to).format('DD-MMM-YYYY'),
                });
            } catch (notifyErr) {
                console.error("Email notification failed:", notifyErr);
                // We don't stop the flow here because the booking itself was successful
            }

            setIsLoading(false);
            toast.success('Service Booked Successfully!');
            setShowRatingModal(true);
        }
    } catch (e) {
        setIsLoading(false);
        toast.error('Error while booking. Please try again.');
    }
};

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    {children}
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex justify-between items-center">
                            Book a Service
                            {distance && (
                                <span className='text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1'>
                                    <MapPin size={12} /> {distance} km away
                                </span>
                            )}
                        </SheetTitle>
                        <SheetDescription>
                            Complete the steps below to book {business.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className='flex flex-col gap-4 mt-5'>
                        <div className='bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3'>
                            <p className='text-blue-800 text-sm'>
                                A base payment of <span className='font-bold text-blue-900'>2,000 XAF</span> is required for Securing your Book Slot. </p>
                        </div>

                        {bookingDetails.extraDays > 0 && (
                            <div className='bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-300'>
                                <AlertCircle className='text-amber-600 shrink-0' size={20} />
                                <div className='space-y-1'>
                                    <p className='text-amber-900 font-bold text-sm'>Extended Duration Applied</p>
                                    <p className='text-amber-800 text-xs leading-relaxed'>
                                        Your booking exceeds the 3-day base period. An additional charge of <span className='font-bold'>250 XAF per day</span> has been added for the extra {bookingDetails.extraDays} days.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className='space-y-3'>
                            <h2 className='font-bold text-slate-800 flex items-center gap-2'>
                                <Wallet className='text-blue-600' size={18}/> 1. Select Operator
                            </h2>
                            <div className='grid grid-cols-2 gap-3'>
                                <button type="button" onClick={() => setSelectedOperator('MTN')}
                                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all 
                                        ${selectedOperator === 'MTN' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 bg-white'}`}>
                                    <span className={`text-[10px] font-black ${selectedOperator === 'MTN' ? 'text-yellow-700' : 'text-slate-400'}`}>MTN MOMO</span>
                                    {selectedOperator === 'MTN' && <CheckCircle2 size={16} className='text-yellow-600'/>}
                                </button>
                                <button type="button" onClick={() => setSelectedOperator('Orange')}
                                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all 
                                        ${selectedOperator === 'Orange' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white'}`}>
                                    <span className={`text-[10px] font-black ${selectedOperator === 'Orange' ? 'text-orange-700' : 'text-slate-400'}`}>ORANGE MONEY</span>
                                    {selectedOperator === 'Orange' && <CheckCircle2 size={16} className='text-orange-600'/>}
                                </button>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <h2 className='font-bold text-slate-800 flex items-center gap-2'>
                                <CalendarIcon className='text-blue-600' size={18}/> 2. Select Date Range
                            </h2>
                            <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
                                <Calendar mode="range" selected={dateRange} onSelect={setDateRange}
                                    disabled={(date) => date < new Date().setHours(0,0,0,0) || bookedDates.some(bd => moment(date).isSame(bd, 'day'))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className='mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2'>
                            <div className='flex justify-between text-sm text-slate-600'>
                                <span>Base Booking (3 Days)</span>
                                <span>2,000 XAF</span>
                            </div>
                            
                            {bookingDetails.extraDays > 0 && (
                                <div className='flex justify-between text-sm text-blue-600 font-medium animate-in fade-in slide-in-from-top-1'>
                                    <span>Extra Duration ({bookingDetails.extraDays} days)</span>
                                    <span>+{bookingDetails.extraCharge} XAF</span>
                                </div>
                            )}

                            <div className='border-t pt-2 flex justify-between items-center'>
                                <h2 className='font-bold text-slate-800 flex items-center gap-2'>
                                    <Receipt size={18} className='text-slate-400'/> Total to Pay
                                </h2>
                                <h2 className='text-xl font-black text-blue-600'>
                                    {bookingDetails.totalAmount.toLocaleString()} XAF
                                </h2>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="mt-5">
                        <Button 
                            disabled={isLoading || !dateRange?.to} 
                            onClick={saveBooking}
                            className={`w-full h-12 rounded-xl text-white font-bold transition-all ${selectedOperator === 'MTN' ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-orange-300 hover:bg-orange-500'}`}
                        >
                            {isLoading ? <Loader2 className='animate-spin' /> : `Pay ${bookingDetails.totalAmount.toLocaleString()} XAF via ${selectedOperator}`}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {showRatingModal && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-xs shadow-2xl text-center">
                        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <h4 className="font-bold text-lg">Success!</h4>
                        <p className="text-sm text-slate-500 my-2">Your booking is confirmed. View your history to manage it.</p>
                        <Button className="w-full mt-4" onClick={() => window.location.href = '/mybooking'}>View My Bookings</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingSection;