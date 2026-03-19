"use client"
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookingHistoryList from './_component/BookingHistoryList'
import GlobalApi from '@/app/_services/GlobalApi'
import { useSession } from 'next-auth/react'

function MyBooking() {

    const { data } = useSession();
    const [bookingHistory, setBookingHistory] = useState([]);

    useEffect(() => {
        data && GetUserBookingHistory();
    }, [data])

    const GetUserBookingHistory = () => {
        GlobalApi.GetUserBookingHistory(data.user.email).then(resp => {
            setBookingHistory(resp.bookings);
        })
    }

    /**
     * Filter data based on Tab type
     */
    const filterData = (type) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        return bookingHistory.filter(item => {
            const bookingDate = new Date(item.date);
            
            // 1. Logic for 'booked' (Upcoming)
            if (type === 'booked') {
                return bookingDate >= today && item.bookingStatus !== 'Canceled';
            }
            
            // 2. Logic for 'completed' (Past)
            if (type === 'completed') {
                return bookingDate < today && item.bookingStatus !== 'Canceled';
            }

            // 3. Logic for 'canceled'
            if (type === 'canceled') {
                return item.bookingStatus === 'Canceled';
            }

            return false;
        });
    }

    return (
        <div className='my-10 mx-5 md:mx-36'>
            <h2 className='font-bold text-[20px] my-2'>My Bookings</h2>
            <Tabs defaultValue="booked" className="w-full">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="booked">Booked</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    {/* <TabsTrigger value="canceled">Canceled</TabsTrigger> */}
                </TabsList>

                <TabsContent value="booked">
                    <BookingHistoryList 
                        bookingHistory={filterData('booked')}
                        type='booked'
                    />
                </TabsContent>

                <TabsContent value="completed">
                    <BookingHistoryList 
                        bookingHistory={filterData('completed')}
                        type='completed'
                    />    
                </TabsContent>

                <TabsContent value="canceled">
                    <BookingHistoryList 
                        bookingHistory={filterData('canceled')}
                        type='canceled'
                    />    
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default MyBooking