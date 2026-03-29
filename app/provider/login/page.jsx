"use client"
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Briefcase, Loader2, ArrowLeft } from 'lucide-react'
import GlobalApi from '@/app/_services/GlobalApi'

function ProviderLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify if the email belongs to a registered provider
      const business = await GlobalApi.getBusinessByEmail(email);
      
      if (!business) {
        toast.error("This email is not registered as a Service Provider.");
        setLoading(false);
        return;
      }

      // 2. Perform NextAuth Sign-in
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.ok) {
        toast.success("Welcome to your Artisan Dashboard!");
        router.push('/provider/dashboard'); 
      } else {
        toast.error("Invalid password. Please try again.");
      }
    } catch (err) {
      toast.error("System error during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 p-4'>
      <div className='w-full max-w-md p-8 bg-white shadow-xl rounded-3xl border border-slate-100'>
        
        {/* Back Button */}
        <button 
            onClick={() => router.push('/')}
            className='flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-xs mb-6'
        >
            <ArrowLeft size={14}/> Back to Website
        </button>

        <div className='flex flex-col items-center mb-8'>
          <div className='p-3 bg-blue-100 rounded-full mb-4'>
            <Briefcase className='text-blue-600' size={30} />
          </div>
          <h2 className='text-2xl font-bold text-slate-800 tracking-tight'>Artisan Portal</h2>
          <p className='text-slate-500 text-sm'>Manage your professional services</p>
        </div>

        <form onSubmit={onLogin} className='space-y-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider'>
                Professional Email
            </label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              required 
              className="rounded-xl h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <div className='flex justify-between items-center px-1'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                    Password
                </label>
                <button 
                    type="button"
                    onClick={() => router.push('/provider/forgot-password')}
                    className='text-[11px] text-blue-600 hover:text-blue-700 font-bold hover:underline'
                >
                    Forgot password?
                </button>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="rounded-xl h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl shadow-lg shadow-blue-200 mt-2 font-bold text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className='animate-spin mr-2' size={20}/> : "Sign In to Dashboard"}
          </Button>
        </form>
        
        <div className='mt-8 pt-6 border-t border-slate-50 text-center'>
            <p className='text-xs text-slate-400'>
                Want to join ServiceHub? <span className='text-blue-600 font-bold cursor-pointer hover:underline'>Apply as an Artisan</span>
            </p>
        </div>
      </div>
    </div>
  )
}

export default ProviderLogin;