"use client"
import React, { useEffect, useState } from 'react'
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
    IndianRupee, Eye, Calendar, XCircle, LayoutDashboard, CheckCircle, Clock, Filter, Plus, Building2, TrendingUp
} from 'lucide-react'
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

    const ADMIN_EMAIL = "kemmoejunior043@gmail.com"; 

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user.email !== ADMIN_EMAIL)) {
            toast.error("Unauthorized Access");
            router.push('/');
        } else if (session && session.user.email === ADMIN_EMAIL) {
            fetchAdminData();
        }
    }, [session, status]);

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

    const handleEditProvider = (biz) => {
        setNewBizData({ ...biz, categoryId: biz.category?.id, image: null });
        setIsProviderModalOpen(true);
    };

    const handleEditCategory = (cat) => {
        setNewCatName(cat.name);
        setIsCatModalOpen(true);
    };

    const filteredBusinesses = businesses.filter(biz => 
        providerCategoryFilter === 'all' ? true : biz.category?.name === providerCategoryFilter
    );

    const filteredBookings = bookings.filter(item => {
        const bookingDateTime = moment(`${item.date} ${item.time}`, 'DD-MMM-YYYY h:mm A');
        const isPast = moment().isAfter(bookingDateTime) || item.bookingStatut === 'Completed';
        if (bookingStatusFilter === 'all') return true;
        if (bookingStatusFilter === 'completed') return isPast;
        if (bookingStatusFilter === 'pending') return !isPast;
        return true;
    });

    const calculateStats = () => {
        const now = moment();
        const todayStr = now.format('DD-MMM-YYYY');
        
        // Filter for completed/past bookings to count revenue
        const completedBookings = bookings.filter(item => {
            const bookingDateTime = moment(`${item.date} ${item.time}`, 'DD-MMM-YYYY h:mm A');
            return now.isAfter(bookingDateTime) || item.bookingStatut === 'Completed';
        });

        const completed = completedBookings.length;
        const pending = bookings.length - completed;
        const totalRevenue = completed * 2000;

        // Daily Gain
        const todayRevenue = completedBookings
            .filter(item => item.date === todayStr).length * 2000;

        // Revenue Breakdown per day
        const revenuePerDay = completedBookings.reduce((acc, item) => {
            acc[item.date] = (acc[item.date] || 0) + 2000;
            return acc;
        }, {});

        return { completed, pending, totalRevenue, todayRevenue, revenuePerDay };
    };

    const stats = calculateStats();

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
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;
    }

    return (
        <div className='flex min-h-screen bg-slate-50'>
            {/* --- REUSABLE CONFIRMATION DIALOG --- */}
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

            {/* --- SIDEBAR --- */}
            <div className='w-64 bg-white border-r p-6 flex flex-col gap-2 hidden md:flex'>
                <div className='text-2xl font-bold text-blue-600 mb-10 px-2 text-center tracking-tighter'>SERVICEHUB</div>
                {renderSidebarItem('dashboard', 'Dashboard', <LayoutDashboard size={18}/>)}
                {renderSidebarItem('providers', 'All Providers', <Users size={18}/>)}
                {renderSidebarItem('bookings', 'Manage Bookings', <Calendar size={18}/>)}
                {renderSidebarItem('categories', 'Categories', <LayoutGrid size={18}/>)}
                
                <div className='mt-auto border-t pt-4'>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-red-500" onClick={() => router.push('/')}>
                        <XCircle size={18} className='mr-2'/> Exit Admin
                    </Button>
                </div>
            </div>

            <div className='flex-1 p-8 overflow-y-auto'>
                <div className='flex justify-between items-center mb-8'>
                    <h2 className='text-2xl font-bold text-slate-800 capitalize'>{activeTab.replace(/([A-Z])/g, ' $1')}</h2>
                    <Button variant="outline" size="sm" onClick={fetchAdminData}>Refresh Data</Button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className='space-y-8'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                            <StatCard title="Total Revenue" value={`${stats.totalRevenue.toLocaleString()} XAF`} icon={<IndianRupee className="text-green-600"/>} />
                            <StatCard title="Revenue Today" value={`${stats.todayRevenue.toLocaleString()} XAF`} icon={<TrendingUp className="text-emerald-500"/>} />
                            <StatCard title="Total Providers" value={businesses.length} icon={<Users className="text-blue-500"/>} />
                            <StatCard title="Total Categories" value={categories.length} icon={<LayoutGrid className="text-purple-500"/>} />
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <StatCard title="Total Bookings" value={bookings.length} icon={<Calendar className="text-orange-500"/>} />
                            <StatCard title="Completed" value={stats.completed} icon={<CheckCircle className="text-emerald-500"/>} />
                            <StatCard title="Pending" value={stats.pending} icon={<Clock className="text-amber-500"/>} />
                        </div>

                        {/* DAILY REVENUE LOG */}
                        <Card className="p-6 border-none shadow-sm bg-white">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Revenue Gain Per Day</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.revenuePerDay).length > 0 ? (
                                    Object.entries(stats.revenuePerDay).reverse().map(([date, rev]) => (
                                        <div key={date} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                            <span className="text-sm font-medium text-slate-600">{date}</span>
                                            <span className="text-sm font-bold text-green-600">+{rev.toLocaleString()} XAF</span>
                                        </div>
                                    ))
                                ) : <div className='text-slate-400 text-sm'>No revenue data yet.</div>}
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- PROVIDERS TAB --- */}
                {activeTab === 'providers' && (
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2 bg-white p-2 rounded-xl border w-fit'>
                                <Filter size={16} className='text-slate-400 ml-2'/>
                                <Select onValueChange={(v) => setProviderCategoryFilter(v)} defaultValue="all">
                                    <SelectTrigger className="w-[180px] border-none focus:ring-0 shadow-none font-medium">
                                        <SelectValue placeholder="Filter Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Dialog open={isProviderModalOpen} onOpenChange={setIsProviderModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2"><PlusCircle size={16}/> Add Provider</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader><DialogTitle>{newBizData.id ? 'Edit' : 'Register'} Provider</DialogTitle></DialogHeader>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
                                        <Input placeholder="Name" value={newBizData.name} onChange={(e)=>setNewBizData({...newBizData, name: e.target.value})} />
                                        <Input placeholder="Email" value={newBizData.email} onChange={(e)=>setNewBizData({...newBizData, email: e.target.value})} />
                                        <Input placeholder="Phone" type="number" value={newBizData.phone} onChange={(e)=>setNewBizData({...newBizData, phone: e.target.value})} />
                                        <Select onValueChange={(v)=>setNewBizData({...newBizData, categoryId: v})} value={newBizData.categoryId}>
                                            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                                            <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <div className='col-span-full'><Textarea placeholder="About..." value={newBizData.about} onChange={(e)=>setNewBizData({...newBizData, about: e.target.value})} /></div>
                                        <div className='col-span-full'><Input type="file" onChange={(e)=>setNewBizData({...newBizData, image: e.target.files[0]})} /></div>
                                    </div>
                                    <DialogFooter><Button onClick={handleAddProvider} disabled={isCreatingProvider} className="w-full">{isCreatingProvider ? <Loader2 className='animate-spin'/> : 'Save Provider'}</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Card className="rounded-xl shadow-sm border-none overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-6">Name</TableHead><TableHead>Category</TableHead><TableHead>Email</TableHead><TableHead className="text-right pr-6">Action</TableHead></TableRow></TableHeader>
                                <TableBody className="bg-white">
                                    {filteredBusinesses.map((biz) => (
                                        <TableRow key={biz.id}>
                                            <TableCell className="font-semibold pl-6">{biz.name}</TableCell>
                                            <TableCell><span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase'>{biz.category?.name}</span></TableCell>
                                            <TableCell className="text-gray-500 text-sm">{biz.email}</TableCell>
                                            <TableCell className="text-right pr-6 flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditProvider(biz)}><Edit size={16} className="text-blue-400" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteBusiness(biz.id)}><Trash2 size={16} className="text-red-400" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}

                {/* --- BOOKINGS TAB --- */}
                {activeTab === 'bookings' && (
                    <div className='space-y-4'>
                         <div className='flex items-center gap-2 bg-white p-2 rounded-xl border w-fit'>
                            <Filter size={16} className='text-slate-400 ml-2'/>
                            <Select onValueChange={(v) => setBookingStatusFilter(v)} defaultValue="all">
                                <SelectTrigger className="w-[180px] border-none shadow-none font-medium"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <Card className="rounded-xl shadow-sm border-none overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-6">Client</TableHead><TableHead>Service</TableHead><TableHead>Date/Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right pr-6">Action</TableHead></TableRow></TableHeader>
                                <TableBody className="bg-white">
                                    {filteredBookings.map((book) => {
                                        const bookingDateTime = moment(`${book.date} ${book.time}`, 'DD-MMM-YYYY h:mm A');
                                        const isPast = moment().isAfter(bookingDateTime);
                                        return (
                                            <TableRow key={book.id}>
                                                <TableCell className="font-medium pl-6">{book.userName}</TableCell>
                                                <TableCell className="text-sm">{book.businessList?.name}</TableCell>
                                                <TableCell className="text-xs text-gray-400">{book.date} | {book.time}</TableCell>
                                                <TableCell><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isPast ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{isPast ? 'Completed' : 'Pending'}</span></TableCell>
                                                <TableCell className="text-right pr-6"><Button variant="ghost" size="icon" onClick={() => GlobalApi.deleteBooking(book.id).then(()=>fetchAdminData())}><Trash2 size={16} className="text-orange-300" /></Button></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
                
                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
                            <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700 gap-2"><Plus size={16}/> New Category</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                                <div className='space-y-4 py-4'>
                                    <Input placeholder="Category Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} />
                                    <Input type="file" onChange={(e)=>setCatFile(e.target.files[0])} />
                                </div>
                                <DialogFooter><Button onClick={handleAddCategory} disabled={isCreatingCat} className="w-full">{isCreatingCat ? <Loader2 className='animate-spin' /> : 'Create'}</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                            {categories.map((cat) => (
                                <div key={cat.id} className='relative group p-6 bg-white border rounded-2xl flex flex-col items-center gap-3 shadow-sm hover:border-blue-200'>
                                    <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <button onClick={() => handleEditCategory(cat)} className='p-1 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white'><Edit size={12}/></button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className='p-1 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white'><Trash2 size={12}/></button>
                                    </div>
                                    {cat.icon?.url && <Image src={cat.icon.url} alt={cat.name} width={40} height={40} />}
                                    <span className='font-bold text-gray-700 text-sm text-center'>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({title, value, icon}) {
    return (
        <Card className="shadow-sm border-none bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase flex justify-between items-center tracking-wider">
                    {title} {icon}
                </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-black text-slate-800">{value}</div></CardContent>
        </Card>
    )
}

export default AdminDashboard;