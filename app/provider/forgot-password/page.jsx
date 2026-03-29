"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { KeyRound, ArrowLeft, Mail } from 'lucide-react'
import GlobalApi from '@/app/_services/GlobalApi'

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const router = useRouter();

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if provider exists
            const business = await GlobalApi.getBusinessByEmail(email);
            
            if (!business) {
                toast.error("No account found with this email.");
            } else {
                // In a full system, you'd trigger a Nodemailer/Resend email here.
                // For now, we simulate success and give instructions.
                setIsSent(true);
                toast.success("Reset request received.");
            }
        } catch (err) {
            toast.error("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-slate-50 p-4'>
            <div className='w-full max-w-md p-8 bg-white shadow-xl rounded-3xl border border-slate-100'>
                <button 
                    onClick={() => router.back()}
                    className='flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-sm mb-6'
                >
                    <ArrowLeft size={16}/> Back to Login
                </button>

                {!isSent ? (
                    <>
                        <div className='flex flex-col items-center mb-8'>
                            <div className='p-4 bg-blue-50 rounded-full mb-4'>
                                <KeyRound className='text-blue-600' size={32} />
                            </div>
                            <h2 className='text-2xl font-bold text-slate-800'>Forgot Password?</h2>
                            <p className='text-slate-500 text-sm text-center mt-2'>
                                Enter your email and we'll send you instructions to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleResetRequest} className='space-y-4'>
                            <Input 
                                type="email" 
                                placeholder="Enter your professional email" 
                                required 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 h-12 rounded-xl text-lg font-semibold"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Reset Password"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className='text-center py-6'>
                        <div className='p-4 bg-green-50 rounded-full w-fit mx-auto mb-4'>
                            <Mail className='text-green-600' size={32} />
                        </div>
                        <h2 className='text-2xl font-bold text-slate-800'>Check your Email</h2>
                        <p className='text-slate-500 text-sm mt-4 leading-relaxed'>
                            If an account exists for <b>{email}</b>, you will receive a reset link shortly. 
                            Please check your spam folder if you don't see it.
                        </p>
                        <Button 
                            onClick={() => router.push('/provider/login')}
                            variant="outline"
                            className="mt-8 w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                            Return to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword;