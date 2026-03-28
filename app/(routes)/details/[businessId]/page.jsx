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
    // Added state to hold reviews at the page level
    const [reviews, setReviews] = useState([]);
    
    useEffect(() => {
      if (params) {
        getbusinessById();
        getReviews(); // Fetch reviews when params/id changes
      }
    }, [params]);

    useEffect(() => {
      checkUserAuth();
    }, [status]); // Added status dependency for better auth handling

    const getbusinessById = () => {
      GlobalApi.getBusinessById(params.businessId).then(resp => {
        setBusiness(resp.businessList);
      })
    }

    // New function to fetch reviews for this specific business
    const getReviews = () => {
      GlobalApi.getBusinessReviews(params.businessId).then(resp => {
        setReviews(resp || []);
      })
    }

    const checkUserAuth = () => {
      if (status == 'loading') return; 
      if (status == 'unauthenticated') signIn('descope');
    }

  if (status == 'loading') return <div className='flex justify-center items-center h-screen'>Loading...</div>;

  return status == 'authenticated' && business && (
    <div className='py-8 md:py-20 px-4 sm:px-10 md:px-36'>
        {/* Pass the reviews prop to BusinessInfo so the Star Rating updates */}
        <BusinessInfo business={business} reviews={reviews} />

        <div className='grid grid-cols-1 md:grid-cols-3 mt-8 md:mt-16 gap-8'>
          <div className='col-span-3 md:col-span-2 order-last md:order-first'>
            <BusinessDescription business={business}/>
            
            {/* Reviews Section */}
            <BusinessReview 
              businessId={business.id} 
              userName={data?.user?.name} 
              // Optional: pass getReviews so the list refreshes after a new post
              refreshReviews={getReviews} 
            />
          </div>
          <div className=''>
            <SuggestedBusinessList business={business}/>
          </div>
        </div>
    </div>
  )
}
export default BusinessDetail;