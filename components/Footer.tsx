
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface FooterData {
  company: { name: string; description: string; tagline: string };
  contact: { address: string; phone: string; email: string };
  social: { facebook: string; twitter: string; instagram: string; linkedin: string };
  links: { quick_links: Array<{ name: string; url: string }>; categories: Array<{ name: string; url: string }> };
  newsletter: { enabled: boolean; title: string; description: string };
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFooterData(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !footerData) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-8 bg-gray-700 rounded mb-4 w-32"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded mb-6 w-1/2"></div>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                </div>
              </div>
              <div className="lg:col-span-2"></div>
              <div className="lg:col-span-1">
                <div className="h-6 bg-gray-700 rounded mb-4 w-24"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const data = footerData;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-book-line text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold font-pacifico">
                {data.company.name}
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {data.company.description}
            </p>
            <div className="flex space-x-4">
              {data.social.facebook && (
                <a href={data.social.facebook} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <i className="ri-facebook-fill text-lg"></i>
                </a>
              )}
              {data.social.twitter && (
                <a href={data.social.twitter} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer">
                  <i className="ri-twitter-fill text-lg"></i>
                </a>
              )}
              {data.social.instagram && (
                <a href={data.social.instagram} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                  <i className="ri-instagram-fill text-lg"></i>
                </a>
              )}
              {data.social.linkedin && (
                <a href={data.social.linkedin} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <i className="ri-linkedin-fill text-lg"></i>
                </a>
              )}
            </div>
          </div>
          
          {/* Empty space for layout balance */}
          <div className="lg:col-span-2"></div>
          
          {/* Menu Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {data.links.quick_links.map((link, index) => (
                <li key={index}>
                  <Link href={link.url} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 {data.company.name}. All rights reserved.
          </p>
        </div>
        
        {/* Created with Love */}
        <div className="border-t border-gray-800 mt-4 pt-4 flex justify-center">
          <p className="text-gray-400 text-sm flex items-center space-x-1">
            <span>Created with</span>
            <i className="ri-heart-fill text-red-500 animate-heartbeat"></i>
            <span>by</span>
            <a 
              href="https://bio.scaleitpro.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              ScaleITPro
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
