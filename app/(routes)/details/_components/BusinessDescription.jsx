import Image from 'next/image'
import React, { useState } from 'react'
import { X } from 'lucide-react'

function BusinessDescription({business}) {
  const [selectedImage, setSelectedImage] = useState(null);

  return business?.name&&(
    <div className='px-4 md:px-0'>
      <h2 className='font-bold text-xl md:text-[25px]'>Description</h2>
      <p className='mt-4 text-base md:text-lg text-gray-600 leading-relaxed'>{business.about}</p>

      <h2 className='font-bold text-xl md:text-[25px] mt-8'>Gallary</h2>
      
      {/* Gallery Grid - Responsive columns for all devices */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mt-5'>
        {business?.images?.map((item,index)=>(
          <div key={index} className='overflow-hidden rounded-lg'>
            <Image 
              src={item?.url} 
              alt='gallery-image'
              width={700}
              height={200}
              unoptimized
              className='rounded-lg w-full h-[120px] md:h-[150px] object-cover cursor-pointer hover:scale-105 transition-all duration-300' 
              onClick={() => setSelectedImage(item.url)}
            />
          </div>
        ))}
      </div>

      {/* Full-Screen Image Viewer (Lightbox) - Optimized for mobile touch and notches */}
      {selectedImage && (
        <div 
          className='fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-2 md:p-4 transition-all animate-in fade-in duration-300'
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button - Positioned for easy thumb reach on mobile */}
          <button 
            className='absolute top-6 right-6 text-white bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors z-[110]'
            onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
            }}
          >
            <X size={24} className="md:w-8 md:h-8" />
          </button>
          
          <div className='relative w-full h-full max-w-5xl flex items-center justify-center'>
            <Image 
              src={selectedImage} 
              alt="Full view" 
              fill
              unoptimized
              className='object-contain select-none'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDescription