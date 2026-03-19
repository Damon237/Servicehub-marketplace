"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Hammer, Send, ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function BeAProvider() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    skill: '',
    specialty: '',
    description: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Handle Image Selection and Validation
  const handleImageChange = (e) => {
    const file = e.target.files;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        e.target.value = null; // Reset input
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const phoneNumber = "237653416598"; 

    const message = `*New Service Provider Application*%0A` +
                    `--------------------------%0A` +
                    `*Name:* ${encodeURIComponent(formData.name)}%0A` +
                    `*Phone:* ${encodeURIComponent(formData.phone)}%0A` +
                    `*Email:* ${encodeURIComponent(formData.email)}%0A` +
                    `*Skill:* ${encodeURIComponent(formData.skill)}%0A` +
                    `*Specialty:* ${encodeURIComponent(formData.specialty)}%0A` +
                    `*Address:* ${encodeURIComponent(formData.address)}%0A` +
                    `*Description:* ${encodeURIComponent(formData.description)}%0A` +
                    `*Images:* ${selectedImage ? "✅ Yes, I have professional photos ready to send" : "❌ No images attached"}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className='p-5 md:px-20 lg:px-40 mt-10 mb-20'>
      <Button variant="ghost" onClick={() => router.back()} className="flex gap-2 items-center mb-5 hover:bg-blue-50">
        <ArrowLeft className='h-4 w-4' /> Back to Home
      </Button>

      <div className='flex flex-col items-center justify-center border p-8 rounded-3xl shadow-lg bg-white'>
        <div className='bg-blue-600 p-4 rounded-2xl mb-4 shadow-blue-200 shadow-lg'>
          <Hammer className='h-10 w-10 text-white' />
        </div>
        <h2 className='font-bold text-3xl text-center text-slate-800'>Join the Expert Network</h2>
        <p className='text-gray-500 text-center mt-2 max-w-md'>
          Complete your profile. You can upload one professional image (max 2MB) to show your work.
        </p>

        <form onSubmit={onSubmit} className='w-full max-w-2xl mt-10 flex flex-col gap-6'>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold text-sm text-slate-600'>Full Name</label>
              <Input name="name" placeholder="Enter full name" required onChange={handleChange} className="h-12 rounded-xl" />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold text-sm text-slate-600'>WhatsApp Number</label>
              <Input name="phone" type="tel" placeholder="e.g. 237..." required onChange={handleChange} className="h-12 rounded-xl" />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-sm text-slate-600'>Email Address</label>
            <Input name="email" type="email" placeholder="example@mail.com" required onChange={handleChange} className="h-12 rounded-xl" />
          </div>

          {/* Image Upload Section */}
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-sm text-slate-600'>Professional Work Image (Max 2MB)</label>
            <div className='border-2 border-dashed border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-blue-50/30 hover:bg-blue-50 transition-all cursor-pointer relative'>
              {!selectedImage ? (
                <>
                  <ImageIcon className='h-8 w-8 text-blue-400 mb-2' />
                  <p className='text-sm text-blue-600 font-medium'>Click to upload image</p>
                  <p className='text-xs text-gray-400'>PNG, JPG or JPEG</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                  />
                </>
              ) : (
                <div className='relative w-full flex flex-col items-center'>
                  <img src={selectedImage} alt="Preview" className='h-40 w-full object-cover rounded-xl border' />
                  <Button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 h-8 w-8 rounded-full p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold text-sm text-slate-600'>Main Skill</label>
              <Input name="skill" placeholder="e.g. Electrician" required onChange={handleChange} className="h-12 rounded-xl" />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-semibold text-sm text-slate-600'>Specialty</label>
              <Input name="specialty" placeholder="e.g. Solar Installations" required onChange={handleChange} className="h-12 rounded-xl" />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-sm text-slate-600'>Location / City</label>
            <Input name="address" placeholder="Where is your business based?" required onChange={handleChange} className="h-12 rounded-xl" />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-sm text-slate-600'>Work Description</label>
            <Textarea 
              name="description" 
              placeholder="Briefly describe your services..." 
              className="h-32 rounded-xl resize-none" 
              required
              onChange={handleChange} 
            />
          </div>

          <Button type="submit" className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold gap-3 rounded-2xl transition-all shadow-lg shadow-green-100">
            <Send className='h-5 w-5' /> Submit via WhatsApp
          </Button>
          <p className='text-center text-xs text-gray-400'>
            By submitting, you agree to be contacted by our team for verification.
          </p>
        </form>
      </div>
    </div>
  )
}

export default BeAProvider