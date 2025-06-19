import React from 'react';
import { Moon, Sun } from 'lucide-react';
import icon from "./../assets/icon.png";

const Header = ({ isDark, setIsDark }) => {
    const toggleDarkMode = () => {
        setIsDark(!isDark);
    };

    return (
        <header
            className={`flex items-center justify-between px-6 py-4 shadow-md transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}
        >
            <div className="flex items-center gap-3 text-xl font-semibold">
                <img
                    src={icon}
                    alt="App Icon"
                    className="w-8 h-8 rounded-full object-cover"
                />
                <span>CF Progress Monitor</span>
            </div>

            <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition ${isDark
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-300 hover:bg-gray-200'
                    }`}
                title="Toggle Theme"
            >
                {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-800" />
                )}
            </button>
        </header>
    );
};

export default Header;
