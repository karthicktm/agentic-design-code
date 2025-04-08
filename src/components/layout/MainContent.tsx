"use client"

import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="flex-1 overflow-auto pt-14 pb-10 px-4 md:px-6 lg:pl-64">
      <div className="container py-6 mx-auto">
        {children}
      </div>
    </main>
  );
};

export default MainContent;
