"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GlobalApi from '@/app/_services/GlobalApi'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select" 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
    Users, LayoutGrid, Trash2, PlusCircle, Loader2, Edit,
    IndianRupee, Eye, Calendar, XCircle, LayoutDashboard, CheckCircle, Clock, Filter, Plus, Building2, TrendingUp, BarChart3, Search, X
} from 'lucide-react'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { toast } from 'sonner'
import Image from 'next/image'
import moment from 'moment'

function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', desc: '', onConfirm: () => {} });

    const [isCreatingCat, setIsCreatingCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [catFile, setCatFile] = useState(null);

    const [isCreatingProvider, setIsCreatingProvider] = useState(false);
    const [newBizData, setNewBizData] = useState({
        name: '', address: '', contactPerson: '', email: '', phone: '', about: '', categoryId: '', image: null
    });

    const [providerCategoryFilter, setProviderCategoryFilter] = useState('all');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [bookingSearchTerm, setBookingSearchTerm] = useState('');

    // CONFIGURATION
    const AUTHORIZED_ADMINS = [
        "kemmoejunior043@gmail.com",
        "kemmoejunior9@gmail.com",
        "kemmoejunioradebayor237@gmail.com"
    ];
    const BOOKING_PRICE = 2000; 

    // SECURITY CHECK
    useEffect(() => {
        if (status === 'loading') return;

        if (!session || !AUTHORIZED_ADMINS.includes(session.user?.email)) {
            toast.error("Unauthorized Access.");
            router.push('/admin/login');
        } else {
            fetchAdminData();
        }
    }, [session, status, router]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const bizResp = await GlobalApi.getAllBusinessList();
            const catResp = await GlobalApi.getCategory();
            const bookResp = await GlobalApi.getAllBookingsAdmin();
            
            setBusinesses(bizResp.businessLists || []);
            setCategories(catResp.categories || []);
            setBookings(bookResp.bookings || []);
        } catch (error) {
            toast.error("Error fetching system data");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (bookingId) => {
        setConfirmDialog({
            open: true,
            title: "Cancel Booking?",
            desc: "Are you sure you want to cancel this customer's booking? This action is permanent.",
            onConfirm: async () => {
                try {
                    await GlobalApi.deleteBooking(bookingId);
                    toast.success("Booking cancelled successfully");
                    fetchAdminData();
                } catch (error) {
                    toast.error("Failed to cancel booking");
                }
            }
        });
    };

    const handleAddProvider = async () => {
        const { name, address, contactPerson, email, phone, categoryId, image, about } = newBizData;
        if (!name || !phone || !categoryId || !image) {
            return toast.error("Name, Phone, Category, and Image are required.");
        }
        setIsCreatingProvider(true);
        try {
            const formData = new FormData();
            formData.append('fileUpload', image);
            const uploadResp = await GlobalApi.uploadAsset(formData);
            
            if (uploadResp && uploadResp.id) {
                const businessData = {
                    name, contactPerson: contactPerson || "", phone: parseInt(phone), address, email,
                    about: about || "", images: { connect: [{ id: uploadResp.id }] },
                    category: { connect: { id: categoryId } }
                };
                const resp = await GlobalApi.createNewBusiness(businessData);
                if (resp) {
                    toast.success("Business Created successfully!");
                    setNewBizData({ name: '', address: '', contactPerson: '', email: '', phone: '', about: '', categoryId: '', image: null });
                    setIsProviderModalOpen(false);
                    fetchAdminData();
                }
            }
        } catch (err) {
            toast.error("Failed to create provider.");
        } finally { setIsCreatingProvider(false); }
    };

    const handleAddCategory = async () => {
        if (!newCatName || !catFile) return toast.error("Please provide a name and an icon");
        setIsCreatingCat(true);
        try {
            const uploadResp = await GlobalApi.uploadAsset(catFile);
            if (uploadResp?.id) {
                await GlobalApi.createCategory(newCatName, "#7c4ee4", uploadResp.id);
                toast.success("Category created successfully!");
                setNewCatName(''); setCatFile(null); setIsCatModalOpen(false);
                fetchAdminData();
            }
        } catch (err) { toast.error("Failed to create category."); } finally { setIsCreatingCat(false); }
    };

    const handleDeleteBusiness = (id) => {
        setConfirmDialog({
            open: true, title: "Delete Provider?", desc: "This action cannot be undone.",
            onConfirm: async () => {
                await GlobalApi.deleteBusiness(id);
                toast.success('Provider deleted');
                fetchAdminData();
            }
        });
    }

    const handleDeleteCategory = (id) => {
        setConfirmDialog({
            open: true, title: "Delete Category?", desc: "Are you sure?",
            onConfirm: async () => {
                try {
                    await GlobalApi.deleteCategory(id);
                    toast.success('Category deleted');
                    fetchAdminData();
                } catch (error) { toast.error("Error deleting category"); }
            }
        });
    }


const calculateStats = () => {
    const now = moment().startOf('day'); 

    const getBookingPrice = (item) => {
        if (!item.date || !item.time) return 2000;
        
        // Parse dates exactly as stored ('DD-MMM-YYYY')
        const start = moment(item.date, 'DD-MMM-YYYY').startOf('day');
        const end = moment(item.time, 'DD-MMM-YYYY').startOf('day');
        
        // Calculate total inclusive days
        const totalDays = end.diff(start, 'days') + 1;
        
        let price = 2000; 
        if (totalDays > 3) {
            const extraDays = totalDays - 3;
            price = 2000 + (extraDays * 500); 
        }
        return price;
    };
    
    // 1. Total Revenue: Sum of every booking in the system
    const totalRevenue = bookings.reduce((acc, item) => acc + getBookingPrice(item), 0);
    
    // 2. Today's Revenue: SUMS all bookings that were CREATED today
    const todayRevenue = bookings
        .filter(item => {
            // Using createdAt ensures we count the money the moment it is paid
            // regardless of when the actual service starts.
            if (!item.createdAt) {
                // Fallback: Check if the service starts today if createdAt is missing
                return moment(item.date, 'DD-MMM-YYYY').isSame(now, 'day');
            }
            return moment(item.createdAt).isSame(now, 'day');
        })
        .reduce((acc, item) => acc + getBookingPrice(item), 0);

    // 3. Completed Bookings logic
    const completedBookings = bookings.filter(item => {
        const isStatusDone = item.bookingStatut?.toLowerCase() === 'completed';
        const bookingEndDate = moment(item.time, 'DD-MMM-YYYY').endOf('day');
        return isStatusDone || moment().isAfter(bookingEndDate);
    });

    // 4. Chart Data logic
    const dailyRevenueMap = completedBookings.reduce((acc, item) => {
        const price = getBookingPrice(item);
        const dateKey = item.date; 
        acc[dateKey] = (acc[dateKey] || 0) + price; 
        return acc;
    }, {});

    const sortedDates = Object.keys(dailyRevenueMap).sort((a, b) => 
        moment(a, 'DD-MMM-YYYY').diff(moment(b, 'DD-MMM-YYYY'))
    );

    let cumulativeSum = 0;
    const revenueChartData = sortedDates.map(date => {
        cumulativeSum += dailyRevenueMap[date];
        return {
            date: moment(date, 'DD-MMM-YYYY').format('MMM DD'),
            revenue: cumulativeSum
        };
    });

    return { 
        completedCount: completedBookings.length, 
        pendingCount: bookings.length - completedBookings.length, 
        totalRevenue, 
        todayRevenue, 
        revenueChartData, 
        distributionData: [
            { name: 'Providers', value: businesses.length, color: '#3b82f6' },
            { name: 'Categories', value: categories.length, color: '#a855f7' },
            { name: 'Completed', value: completedBookings.length, color: '#10b981' },
            { name: 'Pending', value: (bookings.length - completedBookings.length), color: '#f59e0b' },
        ],
        getBookingPrice 
    };
};
    const stats=useMemo(() => calculateStats(), [bookings, businesses, categories]);


    const renderSidebarItem = (id, label, icon) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
                activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
            {icon}
            <span className='font-medium text-sm'>{label}</span>
        </button>
    );

    if (status === "loading" || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className="animate-spin text-blue-500" size={40}/>
                    <p className='text-slate-400 text-sm animate-pulse'>Securing Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session || !AUTHORIZED_ADMINS.includes(session.user?.email)) return null;

    return (
        <div className='flex min-h-screen bg-slate-50 text-slate-900'>
            <AlertDialog open={confirmDialog.open} onOpenChange={(val) => setConfirmDialog(prev => ({...prev, open: val}))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmDialog.desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDialog.onConfirm} className="bg-red-500 hover:bg-red-600">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Sidebar */}
            <div className='w-64 bg-white border-r p-6 hidden md:flex flex-col gap-2'>
                <div className='text-2xl font-extrabold text-slate-600 mb-10 px-2 text-center tracking-tighter'>ADMIN SIDEBAR</div>
                {renderSidebarItem('dashboard', 'Dashboard', <LayoutDashboard size={18}/>)}
                {renderSidebarItem('analysis', 'Analysis', <BarChart3 size={18}/>)}
                {renderSidebarItem('providers', 'All Providers', <Users size={18}/>)}
                {renderSidebarItem('bookings', 'Manage Bookings', <Calendar size={18}/>)}
                {renderSidebarItem('categories', 'Categories', <LayoutGrid size={18}/>)}
                
                <div className='mt-auto border-t pt-4'>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-red-500" onClick={() => router.push('/')}>
                        <XCircle size={18} className='mr-2'/> Exit Admin
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 p-8 overflow-y-auto'>
                <div className='flex justify-between items-center mb-8'>
                    <h2 className='text-2xl font-bold text-slate-800 capitalize'>{activeTab}</h2>
                    <div className='flex items-center gap-4'>
                        <span className='text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full'>Admin: {session.user?.email}</span>
                        <Button variant="outline" size="sm" onClick={fetchAdminData}>Refresh</Button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div className='space-y-8'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
    <StatCard 
        title="Total Revenue" 
        value={`${stats.totalRevenue.toLocaleString()} XAF`} 
        icon={<TrendingUp className="text-green-600"/>} 
    />
    <StatCard 
        title="Today's Revenue" 
        value={`${stats.todayRevenue.toLocaleString()} XAF`} 
        icon={<IndianRupee className="text-emerald-500"/>} 
    />
    <StatCard 
        title="Total Providers" 
        value={businesses.length} 
        icon={<Users className="text-blue-500"/>} 
    />
    <StatCard 
        title="Total Categories" 
        value={categories.length} 
        icon={<LayoutGrid className="text-purple-500"/>} 
    />
</div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <StatCard title="Total Bookings" value={bookings.length} icon={<Calendar className="text-slate-500"/>} />
                            <StatCard title="Completed" value={stats.completedCount} icon={<CheckCircle className="text-emerald-500"/>} />
                            <StatCard title="Pending" value={stats.pendingCount} icon={<Clock className="text-amber-500"/>} />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                                <CardHeader><CardTitle className="text-sm font-bold text-slate-500 uppercase">Recent Bookings</CardTitle></CardHeader>
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="pl-6">Client</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                   <TableBody>
    {bookings.slice(0, 8).map((book, index) => {
        // Calculate dynamic price using startOf('day') for accuracy
        const start = moment(book.date, 'DD-MMM-YYYY').startOf('day');
        const end = moment(book.time, 'DD-MMM-YYYY').startOf('day');
        const days = end.diff(start, 'days') + 1;

        // Base price: 2000 XAF for the first 3 days
        let actualPrice = 2000;
        
        // Add 500 XAF for every day starting from the 4th day
        if (days > 3) {
            const extraDays = days - 3;
            actualPrice = 2000 + (extraDays * 500);
        }

        return (
            <TableRow key={index}>
                <TableCell className="pl-6 font-medium">{book.userName}</TableCell>
                <TableCell className='text-sm'>{book.businessList?.name}</TableCell>
                <TableCell className="text-green-600 font-bold">
                    +{actualPrice.toLocaleString()} XAF
                </TableCell>
            </TableRow>
        );
    })}
</TableBody>
                                </Table>
                            </Card>
                            <div className='lg:col-span-1'>
                                <ActivityFeed businesses={businesses} bookings={bookings} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <Card className="border-none shadow-sm bg-white p-6">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase mb-6">Revenue Growth</CardTitle>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.revenueChartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="border-none shadow-sm bg-white p-6">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase mb-6">System Distribution</CardTitle>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.distributionData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {stats.distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'bookings' && (
    <div className='space-y-4'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm'>
            <div className='flex items-center gap-3 w-full md:w-auto'>
                <Search size={18} className='text-slate-400'/>
                <Input 
                    placeholder="Search client, service or email..." 
                    className="border-none focus-visible:ring-0 w-full md:w-80" 
                    onChange={(e) => setBookingSearchTerm(e.target.value.toLowerCase())}
                />
            </div>
            <div className='flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0'>
                {['all', 'Booked', 'Completed'].map((status) => (
                    <Button 
                        key={status}
                        variant={bookingStatusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBookingStatusFilter(status)}
                        className="capitalize whitespace-nowrap"
                    >
                        {status}
                    </Button>
                ))}
            </div>
        </div>
        <Card className="rounded-xl shadow-sm border-none overflow-hidden bg-white">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="pl-6">Client Info</TableHead>
                        <TableHead>Service & Provider</TableHead>
                        <TableHead>Appointment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                
<TableBody>
    {bookings
        .filter(b => {
            const status = b.bookingStatut?.toLowerCase();
            const bookingEndDate = moment(b.time, 'DD-MMM-YYYY').endOf('day');
            const isPast = moment().isAfter(bookingEndDate);

            // Determine effective status for filtering
            let effectiveStatus = status;
            if (isPast || status === 'completed') effectiveStatus = 'completed';

            if (bookingStatusFilter === 'all') return true;
            return effectiveStatus === bookingStatusFilter.toLowerCase();
        })
        .filter(b => 
            b.userName?.toLowerCase().includes(bookingSearchTerm) || 
            b.userEmail?.toLowerCase().includes(bookingSearchTerm) ||
            b.businessList?.name?.toLowerCase().includes(bookingSearchTerm)
        )
        .map((book) => {
            const status = book.bookingStatut?.toLowerCase();
            const isPast = moment().isAfter(moment(book.time, 'DD-MMM-YYYY').endOf('day'));
            
            // Determine display status
            const displayStatus = (isPast || status === 'completed') ? 'Completed' : book.bookingStatut;

            return (
                <TableRow key={book.id}>
                    <TableCell className="pl-6">
                        <div className='flex flex-col'>
                            <span className='font-bold text-slate-800'>{book.userName}</span>
                            <span className='text-[10px] text-slate-400'>{book.userEmail}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className='flex flex-col'>
                            <span className='font-medium text-slate-700'>{book.businessList?.name}</span>
                            <span className='text-[10px] text-blue-500 font-medium'>{book.businessList?.category?.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className='flex flex-col text-xs'>
                            <span className='font-semibold text-slate-600'>{book.date}</span>
                            <span className='text-slate-400'>{book.time}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            displayStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                            displayStatus?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                        }`}>
                            {displayStatus}
                        </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelBooking(book.id)}
                            title="Cancel Booking"
                        >
                            <X size={18} />
                        </Button>
                    </TableCell>
                </TableRow>
            );
        })
    }
</TableBody>
            </Table>
        </Card>
    </div>
)}
                {activeTab === 'providers' && (
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2 bg-white p-2 rounded-xl border w-fit'>
                                <Filter size={16} className='text-slate-400 ml-2'/>
                                <Select onValueChange={(v) => setProviderCategoryFilter(v)} defaultValue="all">
                                    <SelectTrigger className="w-[180px] border-none shadow-none font-medium">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <Dialog open={isProviderModalOpen} onOpenChange={setIsProviderModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2"><PlusCircle size={16}/> Add Provider</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader><DialogTitle>Register New Provider</DialogTitle></DialogHeader>
                                    <div className='grid grid-cols-2 gap-4 mt-4'>
                                        <Input placeholder="Business Name" onChange={(e)=>setNewBizData({...newBizData, name: e.target.value})}/>
                                        <Input placeholder="Contact Person" onChange={(e)=>setNewBizData({...newBizData, contactPerson: e.target.value})}/>
                                        <Input placeholder="Email" onChange={(e)=>setNewBizData({...newBizData, email: e.target.value})}/>
                                        <Input placeholder="Phone (e.g 677...)" type="number" onChange={(e)=>setNewBizData({...newBizData, phone: e.target.value})}/>
                                        <Input placeholder="Full Address" className="col-span-2" onChange={(e)=>setNewBizData({...newBizData, address: e.target.value})}/>
                                        <Select onValueChange={(v)=>setNewBizData({...newBizData, categoryId: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                            <SelectContent>{categories.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Input type="file" onChange={(e)=>setNewBizData({...newBizData, image: e.target.files[0]})}/>
                                        <Textarea placeholder="About the provider..." className="col-span-2" onChange={(e)=>setNewBizData({...newBizData, about: e.target.value})}/>
                                    </div>
                                    <DialogFooter><Button onClick={handleAddProvider} disabled={isCreatingProvider}>{isCreatingProvider ? <Loader2 className='animate-spin'/> : 'Create Provider'}</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card className="rounded-xl shadow-sm border-none overflow-hidden bg-white">
                            <Table>
                                <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-6">Name</TableHead><TableHead>Category</TableHead><TableHead className="text-right pr-6">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {businesses.filter(b => providerCategoryFilter==='all' || b.category?.name===providerCategoryFilter).map((biz) => (
                                        <TableRow key={biz.id}>
                                            <TableCell className="font-semibold pl-6">{biz.name}</TableCell>
                                            <TableCell><span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold'>{biz.category?.name}</span></TableCell>
                                            <TableCell className="text-right pr-6 flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteBusiness(biz.id)}><Trash2 size={16} className="text-red-400" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className='space-y-4'>
                        <div className='flex justify-end'>
                            <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-purple-600 hover:bg-purple-700 gap-2"><PlusCircle size={16}/> New Category</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
                                    <div className='flex flex-col gap-4 mt-4'>
                                        <Input placeholder="Category Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)}/>
                                        <div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2'>
                                            <Input type="file" className="hidden" id="cat-icon" onChange={(e)=>setCatFile(e.target.files[0])}/>
                                            <label htmlFor="cat-icon" className='cursor-pointer flex flex-col items-center'>
                                                <Plus className='text-slate-300' size={30}/>
                                                <span className='text-xs text-slate-400'>{catFile ? catFile.name : 'Upload Icon'}</span>
                                            </label>
                                        </div>
                                    </div>
                                    <DialogFooter><Button onClick={handleAddCategory} disabled={isCreatingCat} className="bg-purple-600">{isCreatingCat ? <Loader2 className='animate-spin'/> : 'Save Category'}</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {categories.map((cat) => (
                                <Card key={cat.id} className="border-none shadow-sm bg-white overflow-hidden group">
                                    <div className='p-6 flex flex-col items-center text-center'>
                                        <div className='w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                                            {cat.icon?.url && <Image src={cat.icon?.url} alt={cat.name} width={35} height={35} />}
                                        </div>
                                        <h3 className='font-bold text-slate-800'>{cat.name}</h3>
                                        <Button variant="ghost" size="sm" className='mt-4 text-red-400 hover:text-red-600 hover:bg-red-50' onClick={() => handleDeleteCategory(cat.id)}>
                                            <Trash2 size={14} className='mr-2'/> Remove
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }) {
    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
            </CardContent>
        </Card>
    );
}

function ActivityFeed({ businesses, bookings }) {
    const recentActivities = useMemo(() => {
        const joinedProviders = businesses.map(b => ({
            id: b.id,
            title: b.name,
            subtitle: `Joined as ${b.category?.name || 'Provider'}`,
            time: b.createdAt ? new Date(b.createdAt) : new Date(0),
            icon: <Users className="text-blue-500" size={16} />,
            color: 'bg-blue-50'
        }));

        const newBookings = bookings.map(b => ({
            id: b.id,
            title: b.userName,
            subtitle: `Booked ${b.businessList?.name || 'a service'}`,
            time: b.createdAt ? new Date(b.createdAt) : new Date(0),
            icon: <Calendar className="text-orange-500" size={16} />,
            color: 'bg-orange-50'
        }));

        return [...joinedProviders, ...newBookings]
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 10);
    }, [businesses, bookings]);

    return (
        <Card className="border-none shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="pb-4"><CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">Activity Feed</CardTitle></CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto max-h-[400px]">
                {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                        <div className={`p-2.5 rounded-full h-fit ${activity.color}`}>{activity.icon}</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{activity.title}</span>
                            <span className="text-[11px] text-slate-500">{activity.subtitle}</span>
                            <span className="text-[9px] text-slate-400 mt-1 italic">
                                {activity.time.getTime() === 0 ? "Syncing..." : moment(activity.time).fromNow()}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default AdminDashboard;