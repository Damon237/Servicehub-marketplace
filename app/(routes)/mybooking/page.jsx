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

    const GetUserBookingHistory = () => {
        GlobalApi.GetUserBookingHistory(session.user.email).then(resp => {
            setBookingHistory(resp.bookings);
        })
    }

    const filterData = (type) => {
    return bookingHistory.filter(item => {
        const bookingEndDate = moment(item.time, 'DD-MMM-YYYY').endOf('day');
        const isPast = moment().isAfter(bookingEndDate);
        const isStatusDone = item.bookingStatut === 'Completed';

        if (type === 'booked') {
            return !isPast && !isStatusDone;
        }
        return isPast || isStatusDone;
    })
    }

    return (
        <div className='my-10 mx-5 md:mx-36'>
            <h2 className='font-bold text-[28px] dark:text-slate-100'>My Bookings</h2>

            <Tabs defaultValue="booked" className="w-full mt-6">
                <TabsList className="w-full md:w-max justify-start bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <TabsTrigger 
                        value="booked" 
                        className="flex-1 md:px-12 py-2.5 rounded-lg data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:text-slate-400 dark:data-[state=active]:text-slate-100"
                    >
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger 
                        value="completed" 
                        className="flex-1 md:px-12 py-2.5 rounded-lg data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:text-slate-400 dark:data-[state=active]:text-slate-100"
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
    )
}

export default MyBooking