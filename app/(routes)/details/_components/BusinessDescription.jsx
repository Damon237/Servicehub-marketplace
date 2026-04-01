import Image from 'next/image'
import React, { useState } from 'react'
import { X } from 'lucide-react'

function BusinessDescription({business}) {
  const [selectedImage, setSelectedImage] = useState(null);

  return business?.name&&(
    <div>
      <h2 className='font-bold text-[25px] '>Description</h2>
      <p className='mt-4 text-lg text-gray-600'>{business.about}</p>

      <h2 className='font-bold text-[25px] mt-8'>Gallary</h2>
      
      {/* Gallery Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5'>
        {business?.images?.map((item,index)=>(
          <Image 
            src={item?.url} 
            key={index}
            alt='image'
            width={700}
            height={200}
            unoptimized
            className='rounded-lg w-full h-[150px] object-cover cursor-pointer hover:scale-105 transition-all' 
            onClick={() => setSelectedImage(item.url)}
          />
        ))}
      </div>

      {/* Full-Screen Image Viewer (Lightbox) */}
      {selectedImage && (
        <div 
          className='fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300'
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className='absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors'
            onClick={() => setSelectedImage(null)}
          >
            <X size={30} />
          </button>
          
          <div className='relative w-full max-w-5xl h-[80vh]'>
            <Image 
              src={selectedImage} 
              alt="Full view" 
              fill
              unoptimized
              className='object-contain'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDescription