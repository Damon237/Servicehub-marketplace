"use client"
import GlobalApi from '@/app/_services/GlobalApi';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function CategorySideBar() {
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const params = usePathname();

    useEffect(() => {
      getCategoryList();
    }, [])

    useEffect(() => {
      if (params) {
        setSelectedCategory(params.split('/')[2])
      }
    }, [params])
  
    const getCategoryList = () => {
      GlobalApi.getCategory().then(resp => {
        setCategoryList(resp.categories);
      })
    }

  return (
    <div>
        <h2 className='font-bold mb-3 text-lg text-primary'>Categories</h2>
        {/* Added flex-row and overflow-x-auto for Android horizontal scrolling */}
        <div className='flex flex-row md:flex-col overflow-x-auto gap-3 pb-4 md:pb-0 scrollbar-hide'>
            {categoryList.map((category, index) => (
                <Link href={'/search/'+category.name} 
                key={index} className={`flex gap-2 p-3 
                border rounded-lg min-w-[150px] md:min-w-full
                md:mr-10 cursor-pointer
                hover:bg-purple-50
                hover:shadow-md
                items-center
                justify-center md:justify-start
                hover:text-primary
                 hover:border-primary
                 ${selectedCategory == category.name &&
                  'border-primary text-primary shadow-md bg-purple-50'}
                 `}>
                    <Image src={category?.icon?.url}
                    alt='icon'
                    width={30}
                    height={30}/>
                    <h2 className='text-sm md:text-base'>{category.name}</h2>
                </Link>
            ))}
        </div>
    </div>
  )
}

export default CategorySideBar