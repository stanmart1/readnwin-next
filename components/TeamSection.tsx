'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  twitter: string;
}

export default function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          setTeam(data.team || []);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The passionate individuals behind ReadnWin&apos;s mission to revolutionize reading
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-full flex flex-col">
                <div className="relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={256}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/team/placeholder-avatar.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3">
                      <a href={member.linkedin} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                        <i className="ri-linkedin-fill text-sm"></i>
                      </a>
                      <a href={member.twitter} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                        <i className="ri-twitter-fill text-sm"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 min-h-[2.5rem] flex items-center justify-center">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-4 min-h-[1.5rem] flex items-center justify-center">
                    {member.role}
                  </p>
                  <div 
                    className="text-gray-600 text-sm prose prose-sm max-w-none flex-1 flex items-start"
                    dangerouslySetInnerHTML={{ __html: member.bio }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}