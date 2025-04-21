import React from 'react';
import { FaStar } from 'react-icons/fa';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: string;
  color?: string;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = '1em',
  color = '#ffc107', // Bootstrap warning color (yellow)
  showValue = true
}) => {
  const { t } = useTranslation();
  
  const getStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={`star-${i}`} 
          size={size} 
          style={{ color }}
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar && stars.length < maxRating) {
      stars.push(
        <FaStarHalfAlt 
          key="half-star" 
          size={size} 
          style={{ color }}
        />
      );
    }

    // Fill remaining with empty stars
    while (stars.length < maxRating) {
      stars.push(
        <FaRegStar 
          key={`empty-star-${stars.length}`} 
          size={size} 
          style={{ color }}
        />
      );
    }

    return stars;
  };

  return (
    <div className="d-inline-flex align-items-center">
      {getStars()}
      {showValue && rating > 0 && (
        <span className="ms-1 small text-muted" title={t('product.rating')}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating; 