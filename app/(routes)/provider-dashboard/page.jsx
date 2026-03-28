"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import GlobalApi from '@/app/_services/GlobalApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button' 
import { Loader2, CalendarDays, User, Clock, MapPin, Briefcase, CheckCircle2, Timer } from "lucide-react"
import { toast } from 'sonner' 
import EditProfile from './_components/EditProfile'

function ProviderDashboard() {
    const { data: session } = useSession();
    const [businessData, setBusinessData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            getProviderInitialData();
        }
    }, [session]);

    /**
     * Fetches artisan business profile and all associated bookings
     */
    const getProviderInitialData = async () => {
        if (!session?.user?.email) return;
        
        setLoading(true);
        try {
            // 1. Get the Business Profile
            const business = await GlobalApi.getBusinessByEmail(session.user.email);
            setBusinessData(business);

            if (business) {
                // 2. Get all bookings connected to this business email
                const resp = await GlobalApi.getBookingHistoryByBusinessEmail(session.user.email);
                
                if (resp && resp.bookings) {
                    // This now correctly holds multiple records from different users
                    setBookings(resp.bookings);
                } else {
                    setBookings([]);
                }
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            toast.error("Error connecting to database. Verify Hygraph Schema.");
        } finally {
            setLoading(false);
        }
    }

    /**
     * MARK AS COMPLETED
     */
    const onCompleteBooking = async (bookingId) => {
        try {
            await GlobalApi.updateBookingStatus(bookingId, 'Completed');
            toast.success("Service marked as Completed!");
            getProviderInitialData(); 
        } catch (e) {
            console.error(e);
            toast.error("Error updating status");
        }
    }

    /**
     * POSTPONE WITH REASON
     */
    const onPostponeBooking = async (bookingId) => {
        const reason = window.prompt("Enter the reason for postponing (Visible to client):");
        if (!reason) return;

        try {
            await GlobalApi.updateBookingStatus(bookingId, 'Postponed', reason);
            toast.success("Booking postponed. Client notified!");
            getProviderInitialData(); 
        } catch (e) {
            console.error(e);
            toast.error("Error updating status");
        }
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-[500px]'>
                <Loader2 className='animate-spin text-primary' size={40} />
            </div>
        )
    }

    if (!businessData) {
        return (
            <div className='p-10 text-center flex flex-col items-center gap-4'>
                <Briefcase size={60} className='text-gray-300' />
                <h2 className='text-2xl font-bold'>Professional Account Required</h2>
                <p className='text-gray-500 max-w-md'>
                    The email <strong>{session?.user?.email}</strong> is not associated with a Service Provider profile.
                </p>
            </div>
        )
    }

    return (
        <div className='p-5 md:p-10 max-w-7xl mx-auto'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
                <div>
                    <h1 className='text-3xl font-bold text-primary flex items-center gap-2'>
                        <Briefcase className='text-primary' /> Provider Dashboard
                    </h1>
                    <p className='text-gray-600 font-medium'>Welcome back, <span className="text-xl text-blue-500"> {businessData.contactPerson}</span>  ({businessData.name})</p>
                </div>
                <Badge variant="outline" className="w-fit py-1 px-3 flex gap-2 border-primary text-primary">
                    <MapPin size={14} /> {businessData.address}
                </Badge>
            </div>

            <Tabs defaultValue="bookings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-8">
                    <TabsTrigger value="bookings">Incoming Bookings</TabsTrigger>
                    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings" className="space-y-6">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-sm font-medium">Total Service Requests</CardDescription>
                                <CardTitle className="text-3xl font-bold">{bookings.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-primary shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-sm font-medium">Active Category</CardDescription>
                                <CardTitle className="text-3xl font-bold text-primary">{businessData.category?.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="shadow-sm border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-xl">Appointment Ledger</CardTitle>
                            <CardDescription>Track and update your client schedule in real-time.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 sm:px-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-bold">Customer Details</TableHead>
                                        <TableHead className="font-bold">Date & Time</TableHead>
                                        <TableHead className="font-bold">Live Status</TableHead>
                                        <TableHead className="text-right font-bold">Workflow Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.length > 0 ? bookings.map((booking, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className='flex items-center gap-3'>
                                                    <div className='bg-primary/10 p-2 rounded-full hidden sm:block'>
                                                        <User size={16} className='text-primary' />
                                                    </div>
                                                    <div>
                                                        <p className='font-bold text-slate-700'>{booking.userName}</p>
                                                        <p className='text-xs text-slate-400'>{booking.userEmail}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex flex-col gap-1'>
                                                    <span className='text-sm flex items-center gap-1 font-medium text-slate-600'>
                                                        <CalendarDays size={14} className='text-primary'/> {booking.date}
                                                    </span>
                                                    <span className='text-xs flex items-center gap-1 text-slate-500'>
                                                        <Clock size={14} className='text-primary'/> {booking.time}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`
                                                    ${booking.bookingStatut === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                      booking.bookingStatut === 'Postponed' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                                      'bg-blue-100 text-blue-700 border-blue-200'} border shadow-none px-3`}
                                                >
                                                    {booking.bookingStatut || 'Confirmed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {booking.bookingStatut !== 'Completed' ? (
                                                    <div className='flex justify-end gap-2'>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 text-green-600 border-green-200 hover:bg-green-600 hover:text-white transition-all"
                                                            onClick={() => onCompleteBooking(booking.id)}
                                                        >
                                                            <CheckCircle2 size={14} className="mr-1" /> Done
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 text-orange-600 border-orange-200 hover:bg-orange-600 hover:text-white transition-all"
                                                            onClick={() => onPostponeBooking(booking.id)}
                                                        >
                                                            <Timer size={14} className="mr-1" /> Postpone
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className='text-xs text-slate-400 italic'>Transaction Finalized</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-24 text-gray-400">
                                                <CalendarDays className='mx-auto mb-4 opacity-10' size={60} />
                                                <p className='text-lg font-medium'>No active service requests found.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Business Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EditProfile 
                                businessData={businessData} 
                                onUpdate={getProviderInitialData} 
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProviderDashboard