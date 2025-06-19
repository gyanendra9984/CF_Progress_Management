import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Userlist from './components/Userlist';
import Userprofile from './components/Userprofile';
import ContestHistory from './components/ContestHistory';
import ProblemHistory from './components/ProblemHistory';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [isHome, setIsHome] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);


  // Sync dark mode class on root
  // useEffect(() => {
  //   if (isDark) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [isDark]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50">
        <Header isDark={isDark} setIsDark={setIsDark} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isHome ? (
          <Userlist isDark={isDark} setIsHome={setIsHome} setSelectedStudentId={setSelectedStudentId} />
        ) : (
          <>
              <Userprofile isDark={isDark} setIsHome={setIsHome} selectedStudentId={selectedStudentId} />
            <ContestHistory isDark={isDark} selectedStudentId={selectedStudentId} />
            <ProblemHistory isDark={isDark} selectedStudentId={selectedStudentId} />
          </>
        )}
      </div>
    </div>


  );
};

export default App;
