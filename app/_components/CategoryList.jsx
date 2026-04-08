"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

function CategoryList({categoryList}) {
    // State to handle the "View All" toggle
    const [showAll, setShowAll] = useState(false);

    // Determines how many to show (6 represents the first full line on desktop)
    const displayCount = showAll ? categoryList.length : 6;

    return (
        <div className='flex flex-col items-center w-full'>
            <div className='mx-4 sm:mx-10 md:mx-22 lg:mx-52 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {categoryList.length > 0 ? categoryList.slice(0, displayCount).map((category, index) => (
                    <Link href={'/search/' + category.name} key={index} className={`flex flex-col items-center
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
                )) :
                    // Restored the missing array here to fix the "Expression expected" error
                   [1,2,3,4,5,6].map((item, index) => (
                        <div key={index} className='h-[120px]
                        w-full bg-slate-200 dark:bg-slate-800 animate-pulse
                        rounded-lg'>
                        </div>
                    ))
                }
            </div>

            {/* View All / Show Less Button - Only appears if more than 6 categories exist */}
            {categoryList.length > 6 && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className='mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer'
                >
                    {showAll ? 'Show Less' : 'View All'}
                </button>
            )}
        </div>
    )
}

export default CategoryList