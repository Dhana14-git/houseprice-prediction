import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 dark:border-[#233648] py-8 bg-white dark:bg-[#101922]">
            <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="size-5 text-[#137fec]">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"></path>
                        </svg>
                    </div>
                    <span className="text-slate-400 text-sm font-medium leading-none">© 2026 EstatePredict AI. All rights reserved.</span>
                </div>
                
                <div className="flex gap-8">
                    {/* Fixed: Replaced href="#" with standard routes to fix ESLint warnings */}
                    <a className="text-slate-400 hover:text-[#137fec] text-sm transition-colors font-medium" href="/privacy-policy">Privacy Policy</a>
                    <a className="text-slate-400 hover:text-[#137fec] text-sm transition-colors font-medium" href="/terms-of-service">Terms of Service</a>
                    <a className="text-slate-400 hover:text-[#137fec] text-sm transition-colors font-medium" href="/support">Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;