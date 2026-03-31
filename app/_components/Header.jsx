"use client"
import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { ModeToggle } from './ModeToggle'

function Header() {
  const { data } = useSession();

  const NavigationLinks = ({ className }) => (
    <div className={className}>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer dark:text-slate-200 dark:hover:text-blue-400'>Home</Link>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer dark:text-slate-200 dark:hover:text-blue-400'>Services</Link>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer dark:text-slate-200 dark:hover:text-blue-400'>About Us</Link>
    </div>
  );

  return (
    <div className='p-5 shadow-sm flex justify-between items-center bg-white dark:bg-slate-950 dark:shadow-slate-900'>
      <div className='flex items-center gap-8 '>
        
        <div className='text-2xl md:text-3xl font-bold text-blue-500 cursor-pointer'>SERVICEHUB</div>
        
        {/* Desktop Navigation */}
        <NavigationLinks className='md:flex items-center gap-6 hidden' />
      </div>

      <div className='flex items-center gap-3'>
        {/* Dark Mode Toggle */}
        <ModeToggle />

        {/* Mobile Navigation (Hamburger) */}
        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="dark:border-slate-800">
                <Menu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="dark:bg-slate-950">
              <div className='flex flex-col gap-5 mt-10 text-lg font-medium'>
                 <NavigationLinks className='flex flex-col gap-5' />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {data?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Image
                src={data?.user?.image || '/default-user.png'}
                alt='user'
                width={40}
                height={40}
                className='rounded-full bg-blue-500 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-slate-900 dark:border-slate-800">
              <DropdownMenuLabel className="dark:text-slate-200">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-slate-800">
                <Link href='/mybooking' className="w-full">My Booking</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut()} 
                className="cursor-pointer text-red-500 focus:text-red-500 dark:focus:bg-red-950/30"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => signIn('google')}>
            Login/SignUp
          </Button>
        )}
      </div>
    </div>
  )
}

export default Header