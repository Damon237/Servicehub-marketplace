import Image from 'next/image'
import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

function BusinessDescription({business}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Navigation Logic
  const showNext = useCallback((e) => {
    e?.stopPropagation();
    const nextIndex = (selectedIndex + 1) % business.images.length;
    setSelectedIndex(nextIndex);
    setSelectedImage(business.images[nextIndex].url);
  }, [selectedIndex, business?.images]);

  const showPrev = useCallback((e) => {
    e?.stopPropagation();
    const prevIndex = (selectedIndex - 1 + business.images.length) % business.images.length;
    setSelectedIndex(prevIndex);
    setSelectedImage(business.images[prevIndex].url);
  }, [selectedIndex, business?.images]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, showNext, showPrev]);

  // Touch Support (Mobile Swiping)
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 70) showNext(); // Swipe Left
    if (touchStart - touchEnd < -70) showPrev(); // Swipe Right
    setTouchStart(null);
  };

  return business?.name&&(
    <div className='flex flex-col gap-6 mt-10 dark:bg-slate-900 dark:p-6 dark:rounded-lg dark:text-slate-400'>
      <h2 className='font-bold text-[25px] dark:text-white'>Description</h2>
      <p className='mt-4 text-lg text-gray-700 dark:text-gray-300'>{business.about}</p>

      <h2 className='font-bold text-[25px] mt-8 dark:text-white'>Gallary</h2>
      
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
            onClick={() => {
              setSelectedImage(item.url);
              setSelectedIndex(index);
            }}
          />
        ))}
      </div>

      {selectedImage && (
        <div 
          className='fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300'
          onClick={() => setSelectedImage(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button 
            className='absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-[110]'
            onClick={() => setSelectedImage(null)}
          >
            <X size={30} />
          </button>

          {/* Navigation Arrows (PC Only) */}
          <button 
            className='hidden md:flex absolute left-5 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 z-[110]' 
            onClick={showPrev}
          >
            <ChevronLeft size={40} />
          </button>
          
          <button 
            className='hidden md:flex absolute right-5 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 z-[110]' 
            onClick={showNext}
          >
            <ChevronRight size={40} />
          </button>
          
          <div className='relative w-full max-w-5xl h-[80vh] flex items-center justify-center'>
            <Image 
              src={selectedImage} 
              alt="Full view" 
              fill
              unoptimized
              className='object-contain select-none'
            />
          </div>

          {/* Image Counter */}
          <div className='absolute bottom-10 text-white bg-black/50 px-4 py-1 rounded-full text-sm'>
            {selectedIndex + 1} / {business.images.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDescription