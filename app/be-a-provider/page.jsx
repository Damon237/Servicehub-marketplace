"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Hammer, Send, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

function BeAProvider() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    experience: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const onSubmit = (e) => {
    e.preventDefault();

    // Your WhatsApp Number (with country code, no +)
    const phoneNumber = "237653416598"; 

    const message = `*New Service Provider Application*%0A` +
                    `--------------------------%0A` +
                    `*Name:* ${formData.name}%0A` +
                    `*Phone:* ${formData.phone}%0A` +
                    `*Skill:* ${formData.skill}%0A` +
                    `*Address:* ${formData.address}%0A` +
                    `*Experience:* ${formData.experience}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className='p-5 md:px-20 lg:px-40 mt-10'>
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="flex gap-2 items-center mb-5">
        <ArrowLeft className='h-4 w-4' /> Back
      </Button>

      <div className='flex flex-col items-center justify-center border p-8 rounded-2xl shadow-sm bg-white'>
        <div className='bg-blue-50 p-4 rounded-full mb-4'>
          <Hammer className='h-10 w-10 text-blue-600' />
        </div>
        <h2 className='font-bold text-3xl text-center'>Join as a Service Provider</h2>
        <p className='text-gray-500 text-center mt-2'>Fill out your details below and we will contact you via WhatsApp.</p>

        <form onSubmit={onSubmit} className='w-full max-w-lg mt-10 flex flex-col gap-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='font-medium'>Full Name</label>
              <Input name="name" placeholder="John Doe" required onChange={handleChange} />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-medium'>Phone Number</label>
              <Input name="phone" type="tel" placeholder="e.g. 677..." required onChange={handleChange} />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Your Main Skill (e.g. Plumber)</label>
            <Input name="skill" placeholder="What do you do best?" required onChange={handleChange} />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Business Address / City</label>
            <Input name="address" placeholder="Where are you located?" required onChange={handleChange} />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-medium'>Experience / Special Notes</label>
            <Textarea 
              name="experience" 
              placeholder="Tell us a bit about your work experience..." 
              className="h-32" 
              onChange={handleChange} 
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg gap-2">
            <Send className='h-5 w-5' /> Submit via WhatsApp
          </Button>
        </form>
      </div>
    </div>
  )
}

export default BeAProvider