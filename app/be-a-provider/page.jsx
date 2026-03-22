"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Loader2, BriefcaseIcon, Building2, MapPin, Phone, ArrowLeft, ImagePlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

function BeAProviderPage() {
    const { data: session } = useSession();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isProvider, setIsProvider] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            checkUserIsProvider();
            getCategoryList();
        }
    }, [session]);

    const checkUserIsProvider = () => {
        GlobalApi.getBusinessByEmail(session.user.email).then(resp => {
            if (resp) {
                setIsProvider(true);
                toast.info("You already have a professional profile!");
                router.push('/provider-dashboard');
            }
        });
    }

    const getCategoryList = () => {
        GlobalApi.getCategory().then(resp => {
            setCategoryList(resp.categories);
        });
    }

    const onFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const onRegister = async () => {
        if (!name || !address || !phone || !categoryId || !selectedFile) {
            toast.error("Please fill all fields and upload a business image");
            return;
        }

        setLoading(true);
        try {
            // STEP 1: Upload the Image to Hygraph Assets
           const assetResp = await GlobalApi.uploadAsset(selectedFile);
            const imageId = assetResp?.id;

            if (!imageId) {
                throw new Error("Image upload failed");
            }

            // STEP 2: Create the Business with the Image ID
            const data = {
                name: name,
                address: address,
                email: session?.user?.email,
                contactPerson: session?.user?.name,
                phone: parseInt(phone), 
                categoryId: categoryId,
                imageId: imageId 
            }

            const resp = await GlobalApi.createNewBusiness(data);
            if (resp) {
                toast.success("Professional Profile Activated! 🎉");
                router.push('/provider-dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error("Error: Registration failed. Ensure all details are correct.");
        } finally {
            setLoading(false);
        }
    }

    if (isProvider) return null;

    return (
        <div className='p-5 md:px-20 lg:px-40 mt-10 mb-20'>
            <Button variant="ghost" onClick={() => router.back()} className="flex gap-2 items-center mb-5">
                <ArrowLeft className='h-4 w-4' /> Back
            </Button>

            <div className='flex flex-col items-center justify-center border p-8 rounded-3xl shadow-lg bg-white max-w-2xl mx-auto'>
                <div className='bg-primary p-4 rounded-2xl mb-4 shadow-lg text-white'>
                    <BriefcaseIcon className='h-10 w-10' />
                </div>
                
                <h2 className='font-bold text-3xl text-center text-slate-800'>Join the Expert Network</h2>
                <p className='text-gray-500 text-center mt-2'>
                    Provide your details and upload a photo of your work or shop to get started.
                </p>

                <div className='flex flex-col gap-6 mt-10 w-full'>
                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Business Cover Image</label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative min-h-[150px]">
                            {!filePreview ? (
                                <label className="flex flex-col items-center cursor-pointer w-full py-6">
                                    <ImagePlus className="h-10 w-10 text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-500 font-medium">Click to upload shop or work photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={onFileSelect} />
                                </label>
                            ) : (
                                <div className="relative w-full aspect-video">
                                    <img src={filePreview} className="rounded-xl object-cover w-full h-full" alt="Preview" />
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow-md"
                                        onClick={() => {setFilePreview(null); setSelectedFile(null);}}
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex gap-2 items-center text-slate-600"><Building2 size={16}/> Business Name</label>
                            <Input placeholder="e.g. Douala Plumbers" onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex gap-2 items-center text-slate-600"><Phone size={16}/> WhatsApp Number</label>
                            <Input type="number" placeholder="670000000" onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold flex gap-2 items-center text-slate-600"><MapPin size={16}/> Business Location</label>
                        <Input placeholder="e.g. Akwa, Douala" onChange={(e) => setAddress(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Service Category</label>
                        <Select onValueChange={(value) => setCategoryId(value)}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none">
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
                        className="w-full mt-4 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className='animate-spin' /> : 'Create Professional Account'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BeAProviderPage