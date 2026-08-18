import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';

function PageLayout({ children, mainClassName = '' }) {
  const { sidebarOpen, closeSidebar } = useSidebar();

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <div className="magazine-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className={`magazine-main ${sidebarOpen ? 'sidebar-open' : ''} ${mainClassName}`.trim()}>
          {children}
        </div>
      </div>
    </>
  );
}

export default PageLayout;
