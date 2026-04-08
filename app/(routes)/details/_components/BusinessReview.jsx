"use client"
import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import GlobalApi from '@/app/_services/GlobalApi'
import moment from 'moment'

function BusinessReview({ businessId, userName }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false); 

  useEffect(() => {
    if (businessId) {
      getReviews();
    }
  }, [businessId]);

  const getReviews = () => {
    GlobalApi.getBusinessReviews(businessId).then(resp => {
      const sortedReviews = (resp || []).sort((a, b) => b.rating - a.rating);
      setReviews(sortedReviews);
    }).catch(err => {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    });
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return "0.0";
    const totalStars = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const average = totalStars / reviews.length;
    const finalRating = Math.min(average, 5);
    return finalRating.toFixed(1);
  };

  const onSubmit = () => {
    if (!userName) {
      toast.error("Please login to post a review");
      return;
    }
    setLoading(true);
    const numericRating = parseInt(rating);

    GlobalApi.createReviews(businessId, userName, numericRating, reviewText)
      .then(resp => {
        toast.success("Review added!");
        setReviewText('');
        setRating(0);
        getReviews();
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Failed to post review");
        setLoading(false);
      });
  };

  const displayReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <div className='mt-12 px-2 md:px-0 dark:bg-slate-900 dark:p-6 dark:rounded-lg dark:text-slate-400'>
      <h2 className='font-bold text-xl md:text-[25px] flex items-center gap-2'>
        <MessageSquare className='text-blue-600 shrink-0' /> 
        <span className='leading-tight dark:text-slate-200'>Client Feedback & Competence</span>
      </h2>
      
      <div className='p-4 md:p-6 border rounded-2xl bg-slate-50 mt-5 dark:bg-slate-800 dark:border-slate-700'>
          <h2 className='font-medium text-slate-600 mb-2 dark:text-slate-300'>Rate your experience</h2>
          <div className='flex gap-2 mb-4'>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24}
                className={`cursor-pointer transition-all duration-200 ${rating >= star ? 'text-orange-400 scale-110' : 'text-gray-300 hover:text-orange-200'}`} 
                onClick={() => setRating(star)} 
                fill={rating >= star ? "currentColor" : "none"} 
              />
            ))}
          </div>
          <textarea 
            className='w-full border rounded-lg p-3 md:p-4 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:ring-blue-500' 
            rows="3" 
            placeholder='Add a comment to help others trust this provider...' 
            onChange={(e) => setReviewText(e.target.value)} 
            value={reviewText}
          />
          <Button 
            disabled={!rating || !reviewText || loading} 
            className='mt-3 w-full md:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white' 
            onClick={onSubmit}
          >
            {loading ? "Posting..." : "Post Review"}
          </Button>
      </div>

      <div className='mt-10 space-y-4'>
        {reviews && reviews.length > 0 ? (
          <>
            {displayReviews.map((rev, index) => (
              <div key={index} className='border p-4 md:p-5 rounded-xl shadow-sm bg-white hover:border-blue-200 transition-all'>
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200'>
                        {rev.userName?.[0]?.toUpperCase()}
                      </div>
                      <div className='min-w-0'>
                        <h3 className='font-bold text-slate-800 text-sm md:text-base truncate'>{rev.userName}</h3>
                        <p className='text-[10px] text-slate-400'>{moment(rev.createdAt).fromNow()}</p>
                      </div>
                  </div>
                  <div className='flex gap-1 text-orange-400 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 shrink-0'>
                    <Star size={14} fill="currentColor"/> 
                    <span className='text-xs font-bold'>{rev.rating}</span>
                  </div>
                </div>
                <p className='text-slate-600 mt-4 text-sm md:text-base italic leading-relaxed'>"{rev.reviewText}"</p>
              </div>
            ))}

            {reviews.length > 2 && (
              <div className='flex justify-center mt-6'>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 font-semibold w-full md:w-auto"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <><ChevronUp size={20}/> View Less</>
                  ) : (
                    <><ChevronDown size={20}/> View More ({reviews.length - 2} more)</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='text-center p-10 border border-dashed rounded-xl text-slate-400 dark:text-slate-200'>
            No reviews yet. Be the first to rate this service!
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessReview;