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

function Header() {
  const { data } = useSession();

  const NavigationLinks = ({ className }) => (
    <div className={className}>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer'>Home</Link>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer'>Services</Link>
      <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer'>About Us</Link>
    </div>
  );

  return (
    <div className='p-5 shadow-sm flex justify-between items-center'>
      <div className='flex items-center gap-8 '>
        
        <div className='text-2xl md:text-3xl font-bold text-blue-500 cursor-pointer'>SERVICEHUB</div>
        
        {/* Desktop Navigation */}
        <NavigationLinks className='md:flex items-center gap-6 hidden' />
      </div>

      <div className='flex items-center gap-2'>
        {/* Mobile Navigation (Hamburger) */}
        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
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
                className='rounded-full bg-blue-500 cursor-pointer'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator />
              <DropdownMenuItem><Link href='/mybooking'>My Booking</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
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