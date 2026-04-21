import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#0b1219] px-6 py-16 lg:px-10 transition-colors duration-500">
      <div className="mx-auto max-w-[1280px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[#137fec]">
              <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
              </svg>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                EstatePredict
              </h2>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
              Modern real estate analytics powered by advanced Machine Learning. Accurate, fast, and transparent.
            </p>
          </div>

          {/* Links Columns */}
          <FooterColumn 
            title="Product" 
            links={['Estimator', 'Market Trends', 'API for Enterprise']} 
          />
          <FooterColumn 
            title="Resources" 
            links={['Documentation', 'Research Papers', 'Support Center']} 
          />
          <FooterColumn 
            title="Company" 
            links={['About Us', 'Careers', 'Contact']} 
          />
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-200 dark:border-[#233648] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight opacity-80">
            © 2026 EstatePredict ML Labs. All rights reserved.
          </p>
          
          <div className="flex gap-8">
            {['language', 'group', 'policy'].map((icon) => (
              <button
                key={icon} 
                href="#" 
                className="text-slate-400 hover:text-[#137fec] transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-2xl">
                  {icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Component for Link Columns
const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 dark:text-slate-500">
      {title}
    </h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link}>
          <a 
            href="#" 
            className="text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-[#137fec] dark:hover:text-[#137fec] transition-colors"
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;