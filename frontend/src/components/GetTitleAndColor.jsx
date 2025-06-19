// src/utils/getTitleAndColor.js

export const getColorByRating = (rating) => {
    if (rating >= 3000) return 'text-red-600';
    if (rating >= 2600) return 'text-red-600';
    if (rating >= 2400) return 'text-red-600';
    if (rating >= 2300) return 'text-orange-500';
    if (rating >= 2100) return 'text-orange-400';
    if (rating >= 1900) return 'text-violet-500';
    if (rating >= 1600) return 'text-blue-500';
    if (rating >= 1400) return 'text-cyan-500';
    if (rating >= 1200) return 'text-green-500';
    return 'text-gray-500';
};

export const getTitleByRating = (rating) => {
    if (rating >= 3000) return 'Legendary Grandmaster';
    if (rating >= 2600) return 'International Grandmaster';
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2300) return 'International Master';
    if (rating >= 2100) return 'Master';
    if (rating >= 1900) return 'Candidate Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    return 'Newbie';
};
  
export const getColorByProblemCount = (count) => {
    if (count >= 8) return 'bg-red-700';
    if (count === 7) return 'bg-red-500';
    if (count === 6) return 'bg-orange-600';
    if (count === 5) return 'bg-orange-500';
    if (count === 4) return 'bg-orange-400';
    if (count === 3) return 'bg-yellow-400';
    if (count === 2) return 'bg-green-400';
    if (count === 1) return 'bg-green-300';
    return 'bg-gray-400'; // 0 submissions
};
