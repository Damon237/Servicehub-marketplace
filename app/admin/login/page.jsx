"use client"
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock } from 'lucide-react'

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ADMIN_EMAIL = "kemmoejunior043@gmail.com";

  const onLogin = async (e) => {
    e.preventDefault();
    
    if (email !== ADMIN_EMAIL) {
      toast.error("Access Denied: Not an admin email.");
      return;
    }

    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (res?.ok) {
      toast.success("Welcome back, Admin!");
      router.push('/admin'); // Redirect to dashboard
    } else {
      toast.error("Invalid Credentials");
    }
    setLoading(false);
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50'>
      <div className='w-full max-w-md p-8 bg-white shadow-xl rounded-2xl border border-slate-100'>
        <div className='flex flex-col items-center mb-8'>
          <div className='p-3 bg-blue-100 rounded-full mb-4'>
            <Lock className='text-blue-600' size={30} />
          </div>
          <h2 className='text-2xl font-bold text-slate-800'>Admin Portal</h2>
          <p className='text-slate-500 text-sm'>Login to manage ServiceHub</p>
        </div>

        <form onSubmit={onLogin} className='space-y-4'>
          <Input 
            type="email" 
            placeholder="Admin Email" 
            required 
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            required 
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin;