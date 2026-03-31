"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import GlobalApi from '@/app/_services/GlobalApi'
import { toast } from 'sonner'
import { Loader2, Camera, MapPin, Building2, User2, Mail, Phone } from 'lucide-react'

function EditProfile({ businessData, onUpdate }) {
    const [formData, setFormData] = useState({
        name: businessData?.name || '',
        contactPerson: businessData?.contactPerson || '',
        email: businessData?.email || '',
        phone: businessData?.phone || '',
        address: businessData?.address || '',
        about: businessData?.about || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    // Dynamic Location Logic: Converts address string to Lat/Lng
    const getCoords = async (address) => {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await resp.json();
            if (data && data.length > 0) {
                return { lat: data[0].lat, lng: data[0].lon };
            }
            // Default to center of Cameroon if not found
            return { lat: 7.3697, lng: 12.3547 }; 
        } catch (error) {
            console.error("Geocoding error", error);
            return { lat: 7.3697, lng: 12.3547 };
        }
    }

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // 1. Get Lat/Lng dynamically based on the address
            const coords = await getCoords(formData.address);
            
            // 2. Update Profile
            await GlobalApi.updateBusinessProfile(businessData.id, {
                ...formData,
                lat: coords.lat,
                lng: coords.lng
            });

            toast.success("Profile updated with location coordinates!");
            onUpdate(); 
        } catch (error) {
            toast.error("Error updating profile");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-6 mt-5 w-full max-w-4xl mx-auto'>
            {/* Main Form Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
                <div className='space-y-1.5'>
                    <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <Building2 size={13} className='text-blue-500'/> Business Name
                    </label>
                    <Input name="name" value={formData.name} onChange={handleChange} className="rounded-lg border-slate-200 focus:ring-blue-500" />
                </div>

                <div className='space-y-1.5'>
                    <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <User2 size={13} className='text-blue-500'/> Contact Person
                    </label>
                    <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="rounded-lg border-slate-200" />
                </div>

                <div className='space-y-1.5'>
                    <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <Mail size={13} className='text-blue-500'/> Email Address
                    </label>
                    <Input name="email" value={formData.email} onChange={handleChange} className="rounded-lg border-slate-200" />
                </div>

                <div className='space-y-1.5'>
                    <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                        <Phone size={13} className='text-blue-500'/> Phone Number
                    </label>
                    <Input name="phone" type="number" value={formData.phone} onChange={handleChange} className="rounded-lg border-slate-200" />
                </div>
            </div>

            {/* Location Section */}
            <div className='space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100'>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2'>
                    <MapPin size={14} className='text-amber-500'/> Town / City / Address (for location map)
                </label>
                <Input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="e.g. Akwa, Douala" 
                    className="rounded-lg border-slate-200 bg-white"
                />
                <p className='text-[10px] text-slate-400 mt-2 italic px-1'>
                    Our system automatically detects coordinates for your business based on this address.
                </p>
            </div>

            {/* About Section */}
            <div className='space-y-1.5'>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>About Business / Bio</label>
                <Textarea 
                    name="about" 
                    value={formData.about} 
                    onChange={handleChange} 
                    className="h-32 rounded-lg border-slate-200 resize-none" 
                    placeholder="Describe your services..."
                />
            </div>

            {/* Action Button */}
            <div className='pt-2'>
                <Button 
                    onClick={handleUpdate} 
                    disabled={loading} 
                    className="w-full md:w-fit px-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                    {loading ? <Loader2 className='animate-spin mr-2' size={18} /> : null}
                    Save Business Settings
                </Button>
            </div>
        </div>
    )
}

export default EditProfile;