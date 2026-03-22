"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import GlobalApi from '@/app/_services/GlobalApi'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function EditProfile({ businessData, onUpdate }) {
    const [name, setName] = useState(businessData?.name);
    const [about, setAbout] = useState(businessData?.about);
    const [address, setAddress] = useState(businessData?.address);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await GlobalApi.updateBusinessProfile(businessData.id, {
                name,
                about,
                address
            });
            toast("Profile updated successfully!");
            onUpdate(); // Refresh the data in the parent component
        } catch (error) {
            toast("Error updating profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-5 mt-5 max-w-xl'>
            <div>
                <label className='text-sm text-gray-500'>Business Name</label>
                <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Douala Tech Services"
                />
            </div>
            <div>
                <label className='text-sm text-gray-500'>About / Bio</label>
                <Textarea 
                    value={about} 
                    onChange={(e) => setAbout(e.target.value)} 
                    placeholder="Describe your expertise..."
                    className="h-32"
                />
            </div>
            <div>
                <label className='text-sm text-gray-500'>Physical Address</label>
                <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="e.g. Akwa, Rue Pau"
                />
            </div>
            
            <Button 
                onClick={handleUpdate} 
                disabled={loading}
                className="w-fit"
            >
                {loading ? <Loader2 className='animate-spin mr-2' size={18} /> : null}
                Save Changes
            </Button>
        </div>
    )
}

export default EditProfile