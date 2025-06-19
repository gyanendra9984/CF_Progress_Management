import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getColorByProblemCount } from './GetTitleAndColor';

const ProblemHistory = ({ isDark, selectedStudentId }) => {
    const [filter, setFilter] = useState(30);
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/problems/get_problems/${selectedStudentId}`);
                setProblems(res.data);
            } catch (err) {
                console.error("Failed to fetch problem history:", err);
            }
        };

        if (selectedStudentId) fetchProblems();
    }, [selectedStudentId]);

    const filteredProblems = problems.filter(p => {
        const problemDate = new Date(p.date);
        const today = new Date();
        const diffDays = (today - problemDate) / (1000 * 60 * 60 * 24);
        return diffDays <= filter;
    });
//  console.log(filteredProblems);
    const totalSolved = filteredProblems.length;
    const mostDifficult = Math.max(...filteredProblems.map(p => p.rating), 0);
    const avgRating = totalSolved > 0 ? Math.round(filteredProblems.reduce((acc, p) => acc + p.rating, 0) / totalSolved) : 0;
    const avgPerDay = (totalSolved / filter).toFixed(2);

    const buckets = Array.from({ length: 17 }, (_, i) => i * 100 + 800);
    const ratingData = buckets.map(rating => ({
        rating: rating.toString(),
        count: filteredProblems.filter(p => p.rating === rating).length,
    }));

    // Map problems to date count
    const dateCounts = {};
    filteredProblems.forEach(p => {
        const dateStr = p.date;
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
console.log(dateCounts);
    const heatmap = Array.from({ length: 7 }, () => Array(16).fill(0));
    const today = new Date();

    // Start from today and fill backwards
    let row = today.getDay(); // 0 (Sun) to 6 (Sat)
    let col = 0;

    for (let i = 0; i < 112; i++) { // 16 cols * 7 rows = 112 days max
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (col >= 16) break; // safety check

        // Assign count if present
        if (dateCounts[dateStr]) {
            heatmap[row][col] = dateCounts[dateStr];
        }

        // Move to next row (day of week), wrap if needed
        row++;
        if (row === 7) {
            row = 0;
            col++;
        }
    }

 console.log(heatmap);
    const darkModeClasses = isDark
        ? {
            container: 'bg-gray-900 text-gray-200',
            card: 'bg-gray-800 text-white shadow-md',
            buttonActive: 'bg-blue-600 text-white border-blue-600',
            button: 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600',
        }
        : {
            container: 'bg-gray-200 text-gray-800',
            card: 'bg-gray-50 text-gray-800 shadow-inner',
            buttonActive: 'bg-blue-600 text-white border-blue-600',
            button: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
        };

    return (
        <div className={`w-full max-w-screen-xl mx-auto my-5 p-4 rounded-lg shadow mr-2 ${darkModeClasses.container}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
                <h2 className="text-lg font-bold">Problem History</h2>
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-xs">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setFilter(days)}
                            className={`px-3 py-1 rounded-full font-medium transition-all duration-200
                                ${filter === days ? darkModeClasses.buttonActive : darkModeClasses.button}`}
                        >
                            Last {days} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Stats + Bar Chart */}
                <div className={`flex-grow min-w-0 rounded p-3 ${darkModeClasses.card}`}>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-center text-xs">
                        <div>
                            <p>Most Difficult</p>
                            <p className="text-base font-bold">{mostDifficult}</p>
                        </div>
                        <div>
                            <p>Total Solved</p>
                            <p className="text-base font-bold">{totalSolved}</p>
                        </div>
                        <div>
                            <p>Avg. Rating</p>
                            <p className="text-base font-bold">{avgRating}</p>
                        </div>
                        <div>
                            <p>Avg. / Day</p>
                            <p className="text-base font-bold">{avgPerDay}</p>
                        </div>
                    </div>
                    <h3 className="text-xs font-semibold mb-1">Solved per Rating</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={ratingData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ccc"} />
                            <XAxis dataKey="rating" stroke={isDark ? "#ccc" : "#000"} fontSize={9} />
                            <YAxis stroke={isDark ? "#ccc" : "#000"} allowDecimals={false} fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderColor: isDark ? '#555' : '#ccc', fontSize: '0.75rem' }} />
                            <Bar dataKey="count" fill="#3b82f6" barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Heatmap */}
                <div className={`flex-grow min-w-0 rounded p-3 ${darkModeClasses.card}`}>
                    <h3 className="text-base font-semibold mb-2">Submission Heatmap</h3>

                    {/* Top horizontal labels */}
                    <div className="ml-12 md:ml-20 mb-1 flex justify-start gap-[2px] sm:gap-[6px] md:gap-[9px] pl-[2px] text-xs md:text-[15px] font-semibold">
                        {Array.from({ length: 16 }, (_, i) => (
                            <div key={i} className="w-3 md:w-4 text-center">{i}</div>
                        ))}
                    </div>

                    <div className="flex overflow-x-auto">
                        {/* Day labels */}
                        <div className="flex flex-col justify-between ml-3 md:ml-5 text-xs md:text-[15px] font-medium shrink-0">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div
                                    key={day}
                                    className="h-3 md:h-4 flex items-center justify-end pr-1 my-[2px] md:my-[5px] mr-3 md:mr-6"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-16 grid-rows-7 gap-[2px] md:gap-[5px] shrink-0">
                            {heatmap.map((row, rowIndex) =>
                                row.map((count, colIndex) => {
                                    const colorClass = getColorByProblemCount(count);
                                    return (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            title={`Solved: ${count}`}
                                            className={`rounded ${colorClass} w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5`}
                                            style={{
                                                gridRowStart: rowIndex + 1,
                                                gridColumnStart: colIndex + 1,
                                            }}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemHistory;