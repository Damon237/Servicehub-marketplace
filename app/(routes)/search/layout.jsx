import React from 'react'
import CategorySideBar from './_components/CategorySideBar'

function layout({children}) {
  return (
    <div className="px-4 md:px-0"> {/* Added padding for mobile edges */}
        <div className='grid grid-cols-1 md:grid-cols-4 mt-8 gap-6'>
            {/* Sidebar: Hidden on mobile, shows as 1st col on desktop */}
            <div className='col-span-1'>
             <CategorySideBar/>
            </div>
            
            {/* Main Content: Full width on mobile, 3 cols on desktop */}
            <div className='col-span-1 md:col-span-3'>
            {children}
            </div>
        </div>
    </div>
  )
}

export default layout