"use client"
import BusinessList from '@/app/_components/BusinessList';
import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react'

function BusinessByCategory({params}) {
    const [businessList, setBusinessList] = useState([]);
    
    useEffect(() => {
        if (params) {
            getBusinessList()
        }
    }, [params]);

    const getBusinessList = () => {
        GlobalApi.getBusinessByCategory(params.category)
        .then(resp => {
            setBusinessList(resp?.businessLists);
        })
    }

  return (
    <div className='w-full'> {/* Ensure container is full width */}
        <BusinessList 
            title={decodeURIComponent(params.category)} // Decode for proper display
            businessList={businessList} 
        />
    </div>
  )
}

export default BusinessByCategory