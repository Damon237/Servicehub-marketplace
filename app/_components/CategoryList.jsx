import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function CategoryList({categoryList}) {
  return (
    <div className='mx-4 sm:mx-10 md:mx-22 lg:mx-52 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
        {categoryList.length>0?categoryList.map((category,index)=>(
            <Link href={'/search/'+category.name}  key={index} className={`flex flex-col items-center
             justify-center gap-2
             bg-purple-50 dark:bg-slate-900 dark:border dark:border-slate-800 p-5 rounded-lg
             cursor-pointer hover:scale-110 transition-all ease-in-out
             `}>
                
                <Image src={category?.icon?.url}
                alt='icon'
                width={35}
                height={35}
                />
                <h2 className='text-blue-500 dark:text-blue-400 font-medium'>{category.name}</h2>
            </Link>
        )):
            [1,2,3,4,5,6].map((item,index)=>(
                <div key={index} className='h-[120px]
                w-full bg-slate-200 dark:bg-slate-800 animate-pulse
                rounded-lg'>

                </div>
            ))
        }
    </div>
  )
}

export default CategoryList