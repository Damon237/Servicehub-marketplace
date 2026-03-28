"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GlobalApi from '@/app/_services/GlobalApi'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, BriefcaseIcon } from 'lucide-react'

// ✅ onRegistrationSuccess added as a prop
function RegisterProvider({ onRegistrationSuccess }) {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        getCategoryList();
    }, []);

    const getCategoryList = () => {
        GlobalApi.getCategory().then(resp => setCategoryList(resp.categories));
    }

    const onRegister = () => {
        setLoading(true);
        const data = {
            name: name,
            address: address,
            email: session?.user?.email,
            contactPerson: session?.user?.name,
            phone: parseInt(phone),
            categoryId: categoryId,
            // You can add default coordinates or use a geolocation picker here
            location: { latitude: 4.0511, longitude: 9.7679 } 
        };

        GlobalApi.createNewBusiness(data).then(resp => {
            if (resp) {
                toast.success("Business Registered Successfully!");
                setOpen(false);
                // ✅ Trigger refresh in the Admin Dashboard
                if (onRegistrationSuccess) onRegistrationSuccess();
            }
            setLoading(false);
        }).catch(e => {
            toast.error("Error creating profile");
            setLoading(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <BriefcaseIcon size={16}/> Add Provider
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Register New Provider</DialogTitle>
                    <DialogDescription>Fill in the details to list a new service provider.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <Input placeholder="Business Name" onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
                    <Input type="number" placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />
                    
                    <Select onValueChange={(value) => setCategoryId(value)}>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                            {categoryList.map((cat, index) => (
                                <SelectItem key={index} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={onRegister} disabled={loading} className="w-full">
                        {loading ? <Loader2 className='animate-spin' /> : 'Register Provider'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RegisterProvider;