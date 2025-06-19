import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
} from 'recharts';
import axios from 'axios';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div className="p-3 w-64 rounded shadow text-sm bg-white text-black dark:bg-gray-700 dark:text-white">
                <p><strong>Date:</strong> {label}</p>
                <p><strong>Rating:</strong> {data.rating}</p>
                <p><strong>Contest:</strong> {data.contestName}</p>
                <p><strong>Rank:</strong> {data.rank}</p>
            </div>
        );
    }
    return null;
};

const ContestHistory = ({ isDark, selectedStudentId }) => {
    const [filter, setFilter] = useState(30);
    const [showDropdown, setShowDropdown] = useState(false);
    const [contests, setContests] = useState([]);
    const [page, setPage] = useState(0);

    const maxPerPage = 5;

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/contests/get_contests/${selectedStudentId}`);
                setContests(res.data);
                setPage(0); // Reset page on student change
            } catch (err) {
                console.error("Failed to fetch contests:", err);
            }
        };

        fetchContest();
    }, [selectedStudentId]);

    const toggleDropdown = () => setShowDropdown(!showDropdown);
    const handleFilterSelect = (days) => {
        setFilter(days);
        setShowDropdown(false);
        setPage(0);
    };

    const filteredContests = contests.filter((contest) => {
        const contestDate = new Date(contest.date);
        const now = new Date();
        const diffDays = (now - contestDate) / (1000 * 60 * 60 * 24);
        return diffDays <= filter;
    });

    const pageCount = Math.ceil(filteredContests.length / maxPerPage);
    const paginatedContests = filteredContests.slice(page * maxPerPage, (page + 1) * maxPerPage);

    const ratingData = filteredContests.map(c => ({
        date: c.date,
        rating: c.newRating,
        contestName: c.name,
        rank: c.rank,
    })).reverse(); // reverse to make latest on right


    const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-200';
    const textClass = isDark ? 'text-gray-200' : 'text-gray-800';
    const tableHeadBg = isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-50';
    const hoverRow = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const dropdownBg = isDark ? 'bg-gray-800 text-white ring-gray-600' : 'bg-white text-gray-700 ring-gray-200';
    const dropdownHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    return (
        <div className={`my-5 p-5 rounded-lg shadow ${bgClass} ${textClass}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Contest History</h2>
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border ${isDark
                            ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Last {filter} Days
                    </button>
                    {showDropdown && (
                        <div className={`absolute right-0 z-10 mt-2 w-32 rounded shadow-lg ring-1 ${dropdownBg}`}>
                            {[30, 90, 365].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => handleFilterSelect(days)}
                                    className={`block w-full text-left px-4 py-2 text-sm ${filter === days
                                        ? 'bg-blue-500 text-white font-semibold'
                                        : dropdownHover
                                        }`}
                                >
                                    Last {days} Days
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Rating Chart */}
                <div className={`w-full md:w-1/2 p-2 md:p-4 rounded shadow-inner ${isDark ? 'bg-gray-800' : 'bg-gray-50'} h-[400px]`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={ratingData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ccc'} />
                            <XAxis
                                dataKey="date"
                                angle={-40}
                                textAnchor="end"
                                stroke={isDark ? '#aaa' : '#000'}
                                interval={Math.floor(ratingData.length / 6)}
                                tick={{ fontSize: 10, fill: isDark ? '#aaa' : '#000' }}
                            />
                            <YAxis
                                domain={[0, 4000]}
                                tick={{ fontSize: 10, fill: isDark ? '#aaa' : '#000' }}
                                width={30}
                                stroke={isDark ? '#aaa' : '#000'}
                            />
                            {/* Color Zones */}
                            <ReferenceArea y1={0} y2={1200} fill="#CCCCCC" stroke="none" />
                            <ReferenceArea y1={1200} y2={1400} fill="#77FF77" stroke="none" />
                            <ReferenceArea y1={1400} y2={1600} fill="#77DDBB" stroke="none" />
                            <ReferenceArea y1={1600} y2={1900} fill="#AAAAFF" stroke="none" />
                            <ReferenceArea y1={1900} y2={2100} fill="#FF88FF" stroke="none" />
                            <ReferenceArea y1={2100} y2={2300} fill="#FFCC88" stroke="none" />
                            <ReferenceArea y1={2300} y2={2400} fill="#FFBB55" stroke="none" />
                            <ReferenceArea y1={2400} y2={2600} fill="#FF7777" stroke="none" />
                            <ReferenceArea y1={2600} y2={3000} fill="#FF3333" stroke="none" />
                            <ReferenceArea y1={3000} y2={4000} fill="#AA0000" stroke="none" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="rating" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className={`w-full md:w-1/2 p-2 md:p-4 rounded shadow-inner ${isDark ? 'bg-gray-800' : 'bg-gray-50'} h-[400px] flex flex-col`}>
                    <div className="overflow-auto flex-grow scrollbar-hide">
                        <table className={`min-w-full text-sm border ${borderClass} rounded`}>
                            <thead className={tableHeadBg}>
                                <tr>
                                    <th className="px-4 py-2 border-b">#</th>
                                    <th className="px-4 py-2 border-b text-left">Contest</th>
                                    <th className="px-4 py-2 border-b">Rank</th>
                                    <th className="px-4 py-2 border-b">Unsolved</th>
                                    <th className="px-4 py-2 border-b">Δ Rating</th>
                                    <th className="px-4 py-2 border-b">New Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedContests.map((contest, idx) => (
                                    <tr
                                        key={idx}
                                        className={`${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-200'} transition`}
                                    >
                                        <td className={`px-4 py-2 border-b text-center ${borderClass}`}>{(page * maxPerPage) + idx + 1}</td>
                                        <td className={`px-4 py-2 border-b ${borderClass} text-blue-400 underline`}>{contest.name}</td>
                                        <td className={`px-4 py-2 border-b text-center ${borderClass}`}>{contest.rank}</td>
                                        <td className={`px-4 py-2 border-b text-center ${borderClass}`}>{contest.unsolved}</td>
                                        <td className={`px-4 py-2 border-b text-center font-semibold ${borderClass} ${contest.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                                        </td>
                                        <td className={`px-4 py-2 border-b text-center ${borderClass}`}>{contest.newRating || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                            disabled={page + 1 >= pageCount}
                            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default ContestHistory;
