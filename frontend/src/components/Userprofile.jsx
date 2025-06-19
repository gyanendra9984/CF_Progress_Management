import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getColorByRating, getTitleByRating } from './GetTitleAndColor';

// const user = {
//   name: 'Alice Wonderland',
//   handle: 'Alice_Coder',
//   rating: 1450,
//   maxRating: 1620,
//   contests: 42,
//   problemsSolved: 785,
//   averageRank: '250th',
//   bestRank: 1920,
// };
const Userprofile = ({ isDark, setIsHome, selectedStudentId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const borderClass = isDark ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/get_profile/${selectedStudentId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [selectedStudentId]);

  if (loading) return <div className={`p-6 ${bgClass}`}>Loading...</div>;
  if (!user) return <div className={`p-6 ${bgClass}`}>User not found</div>;

  const currentColor = getColorByRating(user.rating);
  const maxColor = getColorByRating(user.maxRating);

  return (
    <div className={`p-6 min-h-screen transition-all ${bgClass}`}>
      {/* Back Button */}
      <div className={`flex items-center gap-2 text-sm mb-4 cursor-pointer hover:underline ${textSecondary}`}>
        <ArrowLeft size={16} />
        <span onClick={() => setIsHome(true)}>Back to Student Table</span>
      </div>

      {/* Title */}
      <h1 className={`text-2xl font-bold mb-4 text-center ${textPrimary}`}>Student Profile</h1>

      {/* Profile Card */}
      <div className={`${cardBg} shadow rounded-lg p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <img
            src={user.image}
            alt={user.name}
            className={`w-20 h-20 rounded-full border-2 ${borderClass}`}
          />
          <div>
            <h2 className={`text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2 ${textPrimary}`}>
              {user.name}
              <span className={`text-lg sm:text-xl ${currentColor} px-2 py-0.5 rounded-full`}>
                {getTitleByRating(user.rating)}
              </span>
            </h2>
            <p className={`text-sm ${textSecondary}`}>
              Codeforces Handle: <span className="font-semibold">{user.handle}</span>
            </p>
            <div className="mt-2 text-sm">
              <span className={`text-sm ${textSecondary}`}>Contest rating: </span>
              <span className={`font-bold ${currentColor}`}>{user.rating}</span>
              <span className="text-gray-500">
                {' '} (max. <span className={`font-semibold ${maxColor}`}>{getTitleByRating(user.maxRating)}</span>,{' '}
                <span className={`font-bold ${maxColor}`}>{user.maxRating}</span>)
              </span>
            </div>
          </div>
        </div>
        <a
          href={`https://codeforces.com/profile/${user.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm flex items-center gap-1 border ${borderClass} px-3 py-1.5 rounded ${hoverBg} ${textPrimary}`}
        >
          View Public Profile <ExternalLink size={16} />
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
        {[
          {
            value: user.contests,
            label: 'Total Contests',
            description: 'Rated contests in last 365 days.',
          },
          {
            value: user.problemsSolved,
            label: 'Problems Solved',
            description: 'Unique problems in last 90 days.',
          },
          {
            value: user.averageRank,
            label: 'Average Rank',
            description: 'Avg. rank in last 365 days.',
          },
          {
            value: user.bestRank,
            label: 'Best Rank',
            description: 'Top rank in last 365 days.',
          },
        ].map((stat, idx) => (
          <div key={idx} className={`${cardBg} rounded-lg shadow p-4 sm:p-6`}>
            <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
            <p className={`text-sm mt-1 ${textSecondary}`}>{stat.label}</p>
            <p className={`text-xs mt-1 ${textMuted}`}>{stat.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Userprofile;
