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
        session && GetUserBookingHistory();
    }, [session])

    /**
     * Fetch user booking history from GlobalApi
     */
    const GetUserBookingHistory = () => {
        GlobalApi.GetUserBookingHistory(session.user.email).then(resp => {
            setBookingHistory(resp.bookings);
        })
    }

    /**
     * Smart Filtering Logic
     * A booking is "Completed" if:
     * 1. The time has passed (Expired)
     * 2. OR the provider marked it as 'Completed' in the database
     */
    const filterData = (type) => {
    return bookingHistory.filter(item => {
        // Use endOf('day') to ensure it only marks as past AFTER the day is over
        const bookingEndDate = moment(item.time, 'DD-MMM-YYYY').endOf('day');
        const isPast = moment().isAfter(bookingEndDate);
        const isStatusDone = item.bookingStatut === 'Completed';

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
        <div className='my-10 mx-5 md:mx-36'>
            <div className='mb-6'>
                <h2 className='font-bold text-2xl text-blue-500'>My Service History</h2>
                <p className='text-gray-500'>Manage your upcoming and past service appointments.</p>
            </div>

            <Tabs defaultValue="booked" className="w-full">
                <TabsList className="w-full justify-start bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="booked" className="flex-1 sm:flex-none px-8">
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 sm:flex-none px-8">
                        Completed
                    </TabsTrigger>
                </TabsList>

                {/* --- UPCOMING TAB --- */}
                <TabsContent value="booked" className="mt-6">
                    <BookingHistoryList 
                        bookingHistory={filterData('booked')}
                        type='booked'
                    />
                </TabsContent>

                {/* --- COMPLETED TAB --- */}
                <TabsContent value="completed" className="mt-6">
                    <BookingHistoryList 
                        bookingHistory={filterData('completed')}
                        type='completed'
                    />    
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default MyBooking