"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import GlobalApi from '@/app/_services/GlobalApi'
import { toast } from 'sonner'
import { Loader2, Camera, MapPin } from 'lucide-react'

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
        <div className='flex flex-col gap-6 mt-5 max-w-2xl'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Business Name</label>
                    <Input name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Contact Person</label>
                    <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
                </div>
                <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Email</label>
                    <Input name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Phone Number</label>
                    <Input name="phone" type="number" value={formData.phone} onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className='text-xs font-bold text-gray-500 uppercase flex items-center gap-1'>
                    <MapPin size={14}/> Town / City / Address (for location map)
                </label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Akwa, Douala" />
                <p className='text-[10px] text-gray-400 mt-1 italic'>Coordinates will be updated automatically based on this address.</p>
            </div>

            <div>
                <label className='text-xs font-bold text-gray-500 uppercase'>About / Bio</label>
                <Textarea name="about" value={formData.about} onChange={handleChange} className="h-24" />
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full md:w-fit px-10">
                {loading ? <Loader2 className='animate-spin mr-2' size={18} /> : null}
                Save Business Settings
            </Button>
        </div>
    )
}

export default EditProfile;