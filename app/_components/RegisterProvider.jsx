"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import GlobalApi from '@/app/_services/GlobalApi'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, BriefcaseIcon, Building2 } from 'lucide-react'

function RegisterProvider() {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isProvider, setIsProvider] = useState(false); // New State

    useEffect(() => {
        if (session?.user?.email) {
            checkUserIsProvider();
            getCategoryList();
        }
    }, [session]);

    // Check if the current logged-in user is already an artisan
    const checkUserIsProvider = () => {
        GlobalApi.getBusinessByEmail(session.user.email).then(resp => {
            if (resp) {
                setIsProvider(true);
            }
        });
    }

    const getCategoryList = () => {
        GlobalApi.getCategory().then(resp => {
            setCategoryList(resp.categories);
        });
    }

    const onRegister = async () => {
        if (!name || !address || !phone || !categoryId) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        const data = {
            name: name,
            address: address,
            email: session?.user?.email,
            contactPerson: session?.user?.name,
            phone: parseInt(phone), 
            categoryId: categoryId 
        }

        try {
            const resp = await GlobalApi.createNewBusiness(data);
            if (resp) {
                toast.success("Professional Profile Activated! 🎉");
                window.location.href = '/provider-dashboard';
            }
        } catch (error) {
            toast.error("Error: Phone number must be unique and valid.");
        } finally {
            setLoading(false);
        }
    }

    // If they are already a provider, don't show the registration button
    if (isProvider) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="flex gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md transition-all active:scale-95">
                    <BriefcaseIcon size={18} /> Become a Provider
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">Register Business</DialogTitle>
                    <DialogDescription>
                        Complete the form to list your services and start earning.
                    </DialogDescription>
                </DialogHeader>
                
                <div className='flex flex-col gap-4 mt-4'>
                    {/* Form Inputs remain the same as your code */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Business Name</label>
                        <Input placeholder="e.g. Douala Plumbers" onChange={(e) => setName(e.target.value)} className="rounded-xl"/>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Address</label>
                        <Input placeholder="e.g. Akwa, Douala" onChange={(e) => setAddress(e.target.value)} className="rounded-xl"/>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                        <Input type="number" placeholder="670000000" onChange={(e) => setPhone(e.target.value)} className="rounded-xl"/>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Service Category</label>
                        <Select onValueChange={(value) => setCategoryId(value)}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {categoryList.map((cat, index) => (
                                    <SelectItem key={index} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        onClick={onRegister} 
                        disabled={loading}
                        className="w-full mt-4 h-12 rounded-xl text-lg font-bold"
                    >
                        {loading ? <Loader2 className='animate-spin' /> : 'Launch Profile'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RegisterProvider