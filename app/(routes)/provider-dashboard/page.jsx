"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GlobalApi from '@/app/_services/GlobalApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button' 
import { Loader2, CalendarDays, User, Clock, MapPin, MessageSquare, Briefcase, CheckCircle2, History, Star, Timer } from "lucide-react"
import { 
    Dialog, DialogContent, DialogTrigger 
} from "@/components/ui/dialog"
import { toast } from 'sonner' 
import moment from 'moment'
import EditProfile from './_components/EditProfile'
import ChatComponent from '@/app/_components/ChatComponent';

export const dynamic = 'force-dynamic';

function ProviderDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [businessData, setBusinessData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]); 
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        if (!session?.user?.email) return;
        const resp = await GlobalApi.getBookingHistoryByBusinessEmail(session.user.email);
        setBookings(resp?.bookings || []);
    };

    useEffect(() => {
        const verifyAndFetch = async () => {
            if (status === 'loading') return;
            if (!session) {
                router.push('/provider/login');
                return;
            }

            try {
                setLoading(true);
                const business = await GlobalApi.getBusinessByEmail(session.user.email);
                
                if (!business) {
                    toast.error("Access Denied. You are not registered as an Artisan.");
                    router.push('/');
                    return;
                }

                setBusinessData(business);
                await refreshData();

                const reviewResp = await GlobalApi.getBusinessReviews(business.id);
                setReviews(reviewResp || []);

            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setLoading(false);
            }
        };

        verifyAndFetch();

        const interval = setInterval(() => {
            if (session?.user?.email) refreshData();
        }, 5000);
        return () => clearInterval(interval);
    }, [session, status]);

    const onCompleteBooking = async (bookingId) => {
        try {
            // Update status in Hygraph to 'completed'
            await GlobalApi.updateBookingStatus(bookingId, 'completed');
            toast.success("Service marked as Completed!");
            // Refresh local state so the item moves to history immediately
            refreshData(); 
        } catch (e) {
            toast.error("Error updating status.");
        }
    }

    // A booking is finished if manually marked 'completed' OR if the date has passed
    const isBookingFinished = (booking) => {
        const isStatusCompleted = booking.bookingStatut?.toLowerCase() === 'completed';
        const isPastDate = moment(booking.date, 'DD-MMM-YYYY').isBefore(moment(), 'day');
        return isStatusCompleted || isPastDate;
    };

    const activeBookings = bookings.filter(b => !isBookingFinished(b));
    const completedBookings = bookings.filter(b => isBookingFinished(b));

    if (status === "loading" || loading) return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <Loader2 className='animate-spin text-blue-600' size={40} />
              <p className='text-slate-500'>Loading...</p>
        </div>
    );

    return (
        <div className='p-4 md:p-10 max-w-7xl mx-auto pb-20'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6'>
                <div>
                    <h1 className='text-2xl font-extrabold text-slate-800 flex items-center gap-2'>
                        <Briefcase className='text-blue-600' /> Artisan Dashboard
                    </h1>
                    <div className='mt-2'>
                        <span className='text-base md:text-lg font-medium text-slate-700'>
                            Welcome Back, <span className='text-blue-600 font-bold'>{businessData?.contactPerson}</span>
                        </span>
                        <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1'>
                            {businessData?.name}
                        </p>
                    </div>
                </div>
                <div className='flex items-center'>
                   <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 px-4 py-1.5 shadow-sm rounded-xl">
                        <MapPin size={14} className="mr-1.5 text-blue-500" /> 
                        {businessData?.address}
                    </Badge>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
                <Card className="border-l-4 border-l-blue-500 shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-600 uppercase">New Requests</CardTitle>
                        <Timer className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBookings.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-600 uppercase">Jobs Done</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedBookings.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm border-none sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-600 uppercase">Rating</CardTitle>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length) : 0).toFixed(1)} / 5.0
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="mb-8 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="incoming">Active Schedule</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="incoming">
                    <BookingTable data={activeBookings} onComplete={onCompleteBooking} isHistory={false} session={session} />
                </TabsContent>

                <TabsContent value="history">
                    <BookingTable data={completedBookings} isHistory={true} session={session} />
                </TabsContent>

                <TabsContent value="profile">
                    <EditProfile businessData={businessData} onUpdate={() => router.refresh()} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function BookingTable({ data, onComplete, isHistory, session }) {
    return (
        <Card className="shadow-sm border-none overflow-hidden rounded-2xl bg-white">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-bold pl-6">CLIENT</TableHead>
                            <TableHead className="font-bold">SERVICE DATE</TableHead>
                            <TableHead className="font-bold text-center">STATUS</TableHead>
                            <TableHead className="text-right font-bold pr-6">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((booking, index) => {
                            const lastMsg = booking.messages?.[booking.messages.length - 1];
                            const hasUnread = lastMsg && lastMsg.senderEmail !== session?.user?.email;
                            
                            // Check for completed status or expired date
                            const isFinished = booking.bookingStatut?.toLowerCase() === 'completed' || 
                                             moment(booking.date, 'DD-MMM-YYYY').isBefore(moment(), 'day');

                            return (
                                <TableRow key={index} className="hover:bg-slate-50/50">
                                    <TableCell className="pl-6 py-4">
                                        <p className='font-bold text-slate-700'>{booking.userName}</p>
                                        <p className='text-[11px] text-slate-400'>{booking.userEmail}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className='text-[12px] space-y-1'>
                                            <div className='flex items-center gap-2'><CalendarDays size={13} className='text-blue-500'/> {booking.date}</div>
                                            <div className='flex items-center gap-2'><Clock size={13} className='text-amber-500'/> {booking.time}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={isFinished ? 'bg-emerald-50 text-emerald-600 border-none px-3' : 'bg-blue-50 text-blue-600 border-none px-3'}>
                                            {isFinished ? 'Completed' : (booking.bookingStatut || 'Confirmed')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className='flex justify-end gap-2'>
                                            {!isHistory && !isFinished && (
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 border-emerald-100" onClick={() => onComplete(booking.id)}>
                                                    <CheckCircle2 size={16} />
                                                </Button>
                                            )}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600 relative">
                                                        <MessageSquare size={16} />
                                                        {hasUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="p-0 max-w-[400px] rounded-2xl border-none">
                                                    <ChatComponent bookingId={booking.id} currentUserEmail={session?.user?.email} recipientName={booking.userName} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">No records found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default ProviderDashboard;