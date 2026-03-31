"use client"
import GlobalApi from '@/app/_services/GlobalApi';
import { signIn, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import BusinessInfo from '../_components/BusinessInfo';
import SuggestedBusinessList from '../_components/SuggestedBusinessList';
import BusinessDescription from '../_components/BusinessDescription';
import BusinessReview from '../_components/BusinessReview';

function BusinessDetail({params}) {
    const {data, status} = useSession();
    const [business, setBusiness] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    useEffect(() => {
      if (params) {
        getbusinessById();
        getReviews(); 
      }
    }, [params]);

    useEffect(() => {
      checkUserAuth();
    }, [status]); 

    const getbusinessById = () => {
      GlobalApi.getBusinessById(params.businessId).then(resp => {
        setBusiness(resp.businessList);
      })
    }

    const getReviews = () => {
      GlobalApi.getBusinessReviews(params.businessId).then(resp => {
        setReviews(resp || []);
      })
    }

    const checkUserAuth = () => {
      if (status == 'loading') return; 
      if (status == 'unauthenticated') signIn('descope');
    }

  if (status == 'loading') return (
    <div className='flex justify-center items-center h-screen text-blue-500 font-medium'>
        <div className="animate-pulse">Loading service details...</div>
    </div>
  );

  return status == 'authenticated' && business && (
    <div className='py-6 md:py-16 px-4 sm:px-8 md:px-16 lg:px-36'>
        {/* Top Section: Business Header Info */}
        <div className='w-full'>
            <BusinessInfo business={business} reviews={reviews} />
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 mt-8 md:mt-12 gap-8 lg:gap-12'>
          
          {/* Left Column: Description and Reviews */}
          <div className='md:col-span-2 space-y-10 order-2 md:order-1'>
            <div className='bg-white rounded-2xl'>
                <BusinessDescription business={business}/>
            </div>
            
            <div className='bg-white rounded-2xl'>
                <BusinessReview 
                  businessId={business.id} 
                  userName={data?.user?.name} 
                  refreshReviews={getReviews} 
                />
            </div>
          </div>

          {/* Right Column: Sidebar / Suggested Items */}
          <div className='order-1 md:order-2'>
            <div className='sticky top-24'>
                <SuggestedBusinessList business={business}/>
            </div>
          </div>

        </div>
    </div>
  )
}
export default BusinessDetail;