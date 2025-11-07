import React from 'react';
import NavigationHero from './NavigationHero';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

const OfficerLayout: React.FC<OfficerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Hero - giống người dân */}
      <NavigationHero />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Hệ thống Quản lý Trợ cấp Xã hội - Tỉnh Lạng Sơn
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OfficerLayout;
