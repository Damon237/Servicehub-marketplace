"use client"
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookingHistoryList from './_component/BookingHistoryList'
import GlobalApi from '@/app/_services/GlobalApi'
import { useSession } from 'next-auth/react'
import moment from 'moment'

function MyBooking() {
    const { data: session } = useSession();
    const [bookingHistory, setBookingHistory] = useState([]);

    useEffect(() => {
        if (session) {
            GetUserBookingHistory();
        }
    }, [session]);

    const GetUserBookingHistory = () => {
        GlobalApi.GetUserBookingHistory(session.user.email).then(resp => {
            setBookingHistory(resp.bookings);
        });
    }

    const filterData = (type) => {
    return bookingHistory.filter(item => {
        // Use 'time' as the end date for the expiry check
        const bookingEndDate = moment(item.time, 'DD-MMM-YYYY').endOf('day');
        const isPast = moment().isAfter(bookingEndDate);
        
        const isStatusDone = item.bookingStatut?.toLowerCase() === 'completed';

        if (type === 'booked') {
            return !isPast && !isStatusDone;
        }
        if (type === 'completed') {
            return isPast || isStatusDone;
        }
        return false;
    });
}

    return (
        <div className='my-6 md:my-10 mx-4 sm:mx-10 md:mx-24 lg:mx-36'>
            <div className='mb-6'>
                <h2 className='font-bold text-xl md:text-2xl text-blue-500 dark:text-blue-400'>My Service History</h2>
                <p className='text-gray-500 dark:text-slate-400 text-sm md:text-base'>Manage your upcoming and past service appointments.</p>
            </div>

            <Tabs defaultValue="booked" className="w-full">
                <TabsList className="w-full md:w-max justify-start bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <TabsTrigger 
                        value="booked" 
                        className="flex-1 md:px-12 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:text-slate-400"
                    >
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger 
                        value="completed" 
                        className="flex-1 md:px-12 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:text-slate-400"
                    >
                        Completed
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="booked" className="mt-6 animate-in fade-in duration-300">
                    <BookingHistoryList 
                        bookingHistory={filterData('booked')}
                        type='booked'
                    />
                </TabsContent>

                <TabsContent value="completed" className="mt-6 animate-in fade-in duration-300">
                    <BookingHistoryList 
                        bookingHistory={filterData('completed')}
                        type='completed'
                    />    
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default MyBooking;