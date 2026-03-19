"use client"
import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

function Header() {
  const { data } = useSession();

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className='p-5 shadow-sm flex justify-between'>
      <div className='flex items-center gap-8 '>
        {/* <Image src='/logo.svg' alt='logo' width={180} height={100} /> */}
       <div className='text-3xl text-blue-500 cursor-pointer '> SERVICEHUB</div>
        <div className='md:flex items-center gap-6 hidden'>
          <Link href='/' className='hover:scale-105 hover:text-blue-500 cursor-pointer'>Home</Link>
          <h2 className='hover:scale-105 hover:text-blue-500 cursor-pointer' >Services</h2>
          <h2 className='hover:scale-105 hover:text-blue-500 cursor-pointer'>About Us</h2>
        </div>
      </div>

      <div>
        {data?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Image
                src={data?.user?.image || '/default-user.png'}
                alt='user'
                width={40}
                height={40}
                className='rounded-full bg-blue-500'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href='/mybooking'>My Booking</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => signIn('google')}>
            Login / Sign Up
          </Button>
        )}
      </div>
    </div>
  )
}

export default Header;