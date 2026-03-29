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
import { Loader2, CalendarDays, User, Clock, MapPin, Briefcase, CheckCircle2, Timer, History, Star, TrendingUp, ShieldAlert } from "lucide-react"
import { toast } from 'sonner' 
import EditProfile from './_components/EditProfile'

function ProviderDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [businessData, setBusinessData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]); 
    const [loading, setLoading] = useState(true);

    // SECURITY & DATA FETCHING
    useEffect(() => {
        const verifyAndFetch = async () => {
            if (status === 'loading') return;

            // 1. Check if user is logged in at all
            if (!session) {
                router.push('/provider/login');
                return;
            }

            try {
                setLoading(true);
                // 2. Verify if this email is actually a registered Provider
                const business = await GlobalApi.getBusinessByEmail(session.user.email);
                
                if (!business) {
                    toast.error("Access Denied. You are not registered as an Artisan.");
                    router.push('/'); // Redirect to home or a "Become a Pro" page
                    return;
                }

                setBusinessData(business);

                // 3. Fetch Related Data
                const [bookResp, reviewResp] = await Promise.all([
                    GlobalApi.getBookingHistoryByBusinessEmail(session.user.email),
                    GlobalApi.getBusinessReviews(business.id)
                ]);

                setBookings(bookResp?.bookings || []);
                setReviews(reviewResp || []);

            } catch (error) {
                console.error("Dashboard Error:", error);
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        verifyAndFetch();
    }, [session, status, router]);

    const calculateDynamicRating = () => {
        if (!reviews || reviews.length === 0) return "0.0";
        const totalStars = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        return (totalStars / reviews.length).toFixed(1);
    };

    const onCompleteBooking = async (bookingId) => {
        try {
            await GlobalApi.updateBookingStatus(bookingId, 'Completed');
            toast.success("Service marked as Completed!");
            refreshData(); 
        } catch (e) {
            toast.error("Error updating status.");
        }
    }

    const onPostponeBooking = async (bookingId) => {
        const reason = window.prompt("Enter reason for postponement:");
        if (!reason) return;
        try {
            await GlobalApi.updateBookingStatus(bookingId, 'Postponed', reason);
            toast.success("Booking postponed.");
            refreshData(); 
        } catch (e) {
            toast.error("Error updating status");
        }
    }

    const refreshData = async () => {
        const resp = await GlobalApi.getBookingHistoryByBusinessEmail(session.user.email);
        setBookings(resp?.bookings || []);
    };

    const activeBookings = bookings.filter(b => b.bookingStatut !== 'Completed');
    const completedBookings = bookings.filter(b => b.bookingStatut === 'Completed');

    // UI LOADERS
    if (status === "loading" || loading) return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <Loader2 className='animate-spin text-blue-600' size={40} />
            <p className='text-slate-500 animate-pulse font-medium'>Authenticating Artisan Portal...</p>
        </div>
    );

    if (!businessData) return null; // Prevent flicker before redirect

    return (
        <div className='p-5 md:p-10 max-w-7xl mx-auto'>
            {/* Header */}
<div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
    <div>
        <h1 className='text-3xl font-extrabold text-slate-800 flex items-center gap-2'>
            <Briefcase className='text-blue-600' /> Artisan Dashboard
        </h1>
        {/* We use businessData.name for the business name and businessData.contactPerson for the individual */}
        <div className='mt-2'>
            <span className='text-lg font-medium text-slate-700'>
                Welcome Back, <span className='text-blue-600 font-bold text-xl'>{businessData.contactPerson}</span>
            </span>
            <p className='text-sm text-slate-400 font-semibold uppercase tracking-wider'>
                {businessData.name}
            </p>
        </div>
        <p className='text-slate-500 mt-1'>Manage your professional services and requests</p>
    </div>
    <div className='flex items-center gap-3'>
       <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 px-4 py-1.5 shadow-sm rounded-full">
            <MapPin size={14} className="mr-1 text-blue-500" /> {businessData.address}
        </Badge>
    </div>
</div>

            {/* STATS CARDS */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
                <Card className="border-none shadow-sm bg-white border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Requests</CardTitle>
                        <Timer className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{activeBookings.length}</div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">PENDING SERVICES</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jobs Done</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{completedBookings.length}</div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">LIFETIME COMPLETED</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance</CardTitle>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-1">
                            {calculateDynamicRating()} 
                            <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">FROM {reviews.length} REVIEWS</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[500px] mb-8 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="incoming" className="rounded-lg">Active Schedule</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="incoming">
                    <BookingTable 
                        data={activeBookings} 
                        onComplete={onCompleteBooking} 
                        onPostpone={onPostponeBooking}
                        isHistory={false} 
                    />
                </TabsContent>

                <TabsContent value="history">
                    <BookingTable 
                        data={completedBookings} 
                        isHistory={true} 
                    />
                </TabsContent>

                <TabsContent value="profile">
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Professional Settings</CardTitle>
                            <CardDescription>Update your public business information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EditProfile businessData={businessData} onUpdate={() => router.refresh()} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function BookingTable({ data, onComplete, onPostpone, isHistory }) {
    return (
        <Card className="shadow-sm border-none overflow-hidden rounded-2xl bg-white">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-bold pl-6 text-slate-500">CLIENT DETAILS</TableHead>
                            <TableHead className="font-bold text-slate-500">SCHEDULE</TableHead>
                            <TableHead className="font-bold text-center text-slate-500">STATUS</TableHead>
                            {!isHistory && <TableHead className="text-right font-bold pr-6 text-slate-500">ACTIONS</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((booking, index) => (
                            <TableRow key={index} className="hover:bg-slate-50/30 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <p className='font-bold text-slate-700'>{booking.userName}</p>
                                    <p className='text-[11px] text-slate-400'>{booking.userEmail}</p>
                                </TableCell>
                                <TableCell>
                                    <div className='text-[12px] text-slate-600 space-y-1.5'>
                                        <div className='flex items-center gap-2'><CalendarDays size={13} className='text-blue-500'/> {booking.date}</div>
                                        <div className='flex items-center gap-2 font-bold text-slate-800'><Clock size={13} className='text-amber-500'/> {booking.time}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge className={
                                        booking.bookingStatut === 'Completed' 
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3' 
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-3'
                                    }>
                                        {booking.bookingStatut || 'Confirmed'}
                                    </Badge>
                                </TableCell>
                                {!isHistory && (
                                    <TableCell className="text-right pr-6">
                                        <div className='flex justify-end gap-2'>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={() => onComplete(booking.id)}>
                                                <CheckCircle2 size={16} />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-amber-600 border-amber-100 hover:bg-amber-50" onClick={() => onPostpone(booking.id)}>
                                                <Timer size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={isHistory ? 3 : 4} className="text-center py-24">
                                    <div className='flex flex-col items-center gap-2'>
                                        <div className='p-3 bg-slate-50 rounded-full'>
                                            <History className='text-slate-200' size={30} />
                                        </div>
                                        <p className='text-slate-400 text-sm font-medium'>No service records found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default ProviderDashboard;