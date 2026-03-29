"use client"
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // The specific email required for Admin access
  const ADMIN_EMAIL = "kemmoejunior043@gmail.com";
  // The default password set to "admin"
  const DEFAULT_ADMIN_PASSWORD = "admin";

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validate Email first
    if (email !== ADMIN_EMAIL) {
      toast.error("Access Denied: This email is not registered as an administrator.");
      setLoading(false);
      return;
    }

    // 2. Validate Password (must be "admin")
    if (password !== DEFAULT_ADMIN_PASSWORD) {
        toast.error("Invalid Admin Password. Please try again.");
        setLoading(false);
        return;
    }

    try {
      // 3. Perform NextAuth Sign-in
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.ok) {
        toast.success("Welcome back, System Administrator!");
        router.push('/admin'); // Redirect to admin dashboard
      } else {
        toast.error("Authentication failed. Check system logs.");
      }
    } catch (err) {
        toast.error("A system error occurred during login.");
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
            <ArrowLeft size={14}/> Exit Portal
        </button>

        <div className='flex flex-col items-center mb-8'>
          <div className='p-3 bg-red-100 rounded-full mb-4'>
            <Lock className='text-red-600' size={30} />
          </div>
          <h2 className='text-2xl font-bold text-slate-800 tracking-tight'>Admin Control</h2>
          <p className='text-slate-500 text-sm'>Secure login for ServiceHub management</p>
        </div>

        <form onSubmit={onLogin} className='space-y-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider'>
                Admin Email
            </label>
            <Input 
              type="email" 
              placeholder="kemmoe... @gmail.com" 
              required 
              className="rounded-xl h-11 border-slate-200 focus:border-red-400 focus:ring-red-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider'>
                System Password
            </label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="rounded-xl h-11 border-slate-200 focus:border-red-400 focus:ring-red-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-black h-12 rounded-xl shadow-lg shadow-slate-200 mt-2 font-bold text-base transition-all"
            disabled={loading}
          >
            {loading ? <Loader2 className='animate-spin mr-2' size={20}/> : "Launch Admin Console"}
          </Button>
        </form>
        
        <div className='mt-8 pt-6 border-t border-slate-50 text-center'>
            <p className='text-[10px] text-slate-400 uppercase font-bold tracking-widest'>
                Authorized Personnel Only
            </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin;