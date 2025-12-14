import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='ml-64'>
        <main className='p-8'>{children}</main>
      </div>
    </div>
  );
}
