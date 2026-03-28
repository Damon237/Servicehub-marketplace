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
  const [showAll, setShowAll] = useState(false); // State to toggle "View More"

  useEffect(() => {
    if (businessId) {
      getReviews();
    }
  }, [businessId]);

  const getReviews = () => {
    GlobalApi.getBusinessReviews(businessId).then(resp => {
      // Sort reviews by rating (highest first) then by date
      const sortedReviews = (resp || []).sort((a, b) => b.rating - a.rating);
      setReviews(sortedReviews);
    }).catch(err => {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    });
  };

const calculateAverageRating = () => {
  if (!reviews || reviews.length === 0) {
    return "0.0"; // Or "5.0" if you want new businesses to look perfect
  }

  const totalStars = reviews.reduce((acc, rev) => acc + rev.rating, 0);
  const average = totalStars / reviews.length;

  // Math.min(average, 5) ensures it NEVER goes above 5
  // Number(...) converts it back to a number to remove trailing zeros if needed
  const finalRating = Math.min(average, 5);

  return finalRating % 1 === 0 ? finalRating.toFixed(1) : finalRating.toFixed(1);
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

  // Logic to determine which reviews to display
  const displayReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <div className='mt-12'>
      <h2 className='font-bold text-[25px] flex items-center gap-2'>
        <MessageSquare className='text-blue-600' /> Client Feedback & Competence
      </h2>
      
      {/* INPUT SECTION */}
      <div className='p-6 border rounded-2xl bg-slate-50 mt-5'>
          <h2 className='font-medium text-slate-600 mb-2'>Rate your experience</h2>
          <div className='flex gap-2 mb-4'>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`cursor-pointer transition-all duration-200 ${rating >= star ? 'text-orange-400 scale-110' : 'text-gray-300 hover:text-orange-200'}`} 
                onClick={() => setRating(star)} 
                fill={rating >= star ? "currentColor" : "none"} 
              />
            ))}
          </div>
          <textarea 
            className='w-full border rounded-lg p-4 bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all' 
            rows="3" 
            placeholder='Add a comment to help others trust this provider...' 
            onChange={(e) => setReviewText(e.target.value)} 
            value={reviewText}
          />
          <Button 
            disabled={!rating || !reviewText || loading} 
            className='mt-3 bg-blue-600 hover:bg-blue-700' 
            onClick={onSubmit}
          >
            {loading ? "Posting..." : "Post Review"}
          </Button>
      </div>

      {/* REVIEWS LIST SECTION */}
      <div className='mt-10 space-y-4'>
        {reviews && reviews.length > 0 ? (
          <>
            {displayReviews.map((rev, index) => (
              <div key={index} className='border p-5 rounded-xl shadow-sm bg-white hover:border-blue-200 transition-all animate-in fade-in duration-500'>
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200'>
                        {rev.userName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className='font-bold text-slate-800'>{rev.userName}</h3>
                        <p className='text-[10px] text-slate-400'>{moment(rev.createdAt).fromNow()}</p>
                      </div>
                  </div>
                  <div className='flex gap-1 text-orange-400 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100'>
                    <Star size={14} fill="currentColor"/> 
                    <span className='text-xs font-bold'>{rev.rating}</span>
                  </div>
                </div>
                <p className='text-slate-600 mt-4 italic leading-relaxed'>"{rev.reviewText}"</p>
              </div>
            ))}

            {/* VIEW MORE / LESS BUTTON */}
            {reviews.length > 2 && (
              <div className='flex justify-center mt-6'>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 font-semibold"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <><ChevronUp size={20}/> View Less</>
                  ) : (
                    <><ChevronDown size={20}/> View More Comments ({reviews.length - 2} more)</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='text-center p-10 border border-dashed rounded-xl text-slate-400'>
            No reviews yet. Be the first to rate this service!
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessReview;