'use client';

import { useRef, useState, useEffect } from 'react';
import WorkModal from './WorkModal';

export default function WorksCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<{
    id: number;
    src: string;
    alt: string;
    title: string;
    description: string;
  } | null>(null);
  const [truncatedWorks, setTruncatedWorks] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);



  const [worksImages, setWorksImages] = useState<Array<{
    id: number;
    src: string;
    alt: string;
    title: string;
    description: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorks();
  }, []);

  // Initialize infinite scroll position
  useEffect(() => {
    if (worksImages.length > 0 && carouselRef.current) {
      // Start at the first real item (skip the cloned last item)
      const cardWidth = getCardWidth();
      const gap = 24;
      const initialScroll = cardWidth + gap;
      carouselRef.current.scrollLeft = initialScroll;
    }
  }, [worksImages]);

  // Handle infinite scroll boundaries
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || worksImages.length === 0) return;

    const handleScroll = () => {
      const cardWidth = getCardWidth();
      const gap = 24;
      const scrollLeft = carousel.scrollLeft;
      const maxScroll = (cardWidth + gap) * (worksImages.length + 1);
      
      // If scrolled to the cloned first item at the end
      if (scrollLeft >= maxScroll) {
        carousel.scrollLeft = cardWidth + gap; // Jump to real first item
      }
      // If scrolled to the cloned last item at the beginning
      else if (scrollLeft <= 0) {
        carousel.scrollLeft = (cardWidth + gap) * worksImages.length; // Jump to real last item
      }
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [worksImages]);

  // Additional check for text truncation after component mounts and DOM is ready
  useEffect(() => {
    if (worksImages.length > 0) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        worksImages.forEach((work) => {
          const cardElement = document.querySelector(`[data-work-id="${work.id}"] .line-clamp-2`);
          if (cardElement) {
            const isActuallyTruncated = cardElement.scrollHeight > cardElement.clientHeight;
            if (isActuallyTruncated && !truncatedWorks.has(work.id)) {
              setTruncatedWorks(prev => new Set(prev).add(work.id));
            }
          }
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [worksImages, truncatedWorks]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/works');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const works = data.works.map((work: any) => ({
          id: work.id,
          src: work.image_path,
          alt: work.alt_text,
          title: work.title,
          description: work.description
        }));
        
        setWorksImages(works);
        
        // Check for text truncation after setting works
        works.forEach((work: { id: number; description: string; title: string }) => {
          checkTextTruncation(work.id, work.description || '', work.title);
        });
      } else {
        setError(data.error || 'Failed to fetch works');
      }
    } catch (error) {
      console.error('Error fetching works:', error);
      setError('Error loading works');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || worksImages.length === 0) return;

    const interval = setInterval(() => {
      // Check if user is interacting with the page and not transitioning
      if (!isTransitioning && document.hasFocus()) {
        scrollToNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, worksImages.length, isTransitioning]);

  const getCardWidth = () => {
    if (!carouselRef.current) return 0;
    const containerWidth = carouselRef.current.offsetWidth;
    const gap = 24; // 1.5rem = 24px
    
    if (containerWidth >= 1024) return (containerWidth - gap * 2) / 3; // lg: 3 cards
    if (containerWidth >= 768) return (containerWidth - gap) / 2; // md: 2 cards
    return containerWidth; // sm: 1 card
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current || worksImages.length === 0) return;
    
    setIsTransitioning(true);
    const cardWidth = getCardWidth();
    const gap = 24;
    // Add 1 to account for the cloned last item at the beginning
    const scrollAmount = (cardWidth + gap) * (index + 1);
    
    carouselRef.current.scrollTo({ 
      left: scrollAmount, 
      behavior: 'smooth' 
    });
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const scrollToNext = () => {
    if (isTransitioning || worksImages.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % worksImages.length;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  const scrollToPrev = () => {
    if (isTransitioning || worksImages.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? worksImages.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning) return;
    setCurrentIndex(index);
    scrollToIndex(index);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const openModal = (work: {
    id: number;
    src: string;
    alt: string;
    title: string;
    description: string;
  }) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
  };



  const checkTextTruncation = (workId: number, description: string, title: string) => {
    // Check if description is longer than ~60 characters (definitely more than 2 lines)
    // Using a very conservative character count to ensure consistent 2-line display
    const isLongDescription = description.length > 60;
    
    if (isLongDescription) {
      setTruncatedWorks(prev => new Set(prev).add(workId));
    }
  };

  if (loading) {
    return (
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Some Of Our Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our innovative projects and creative solutions that transform the reading experience
            </p>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Some Of Our Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our innovative projects and creative solutions that transform the reading experience
            </p>
          </div>
          <div className="text-center py-12">
            <i className="ri-error-warning-line text-6xl text-red-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Works</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (worksImages.length === 0) {
    return (
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Some Of Our Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our innovative projects and creative solutions that transform the reading experience
            </p>
          </div>
          <div className="text-center py-12">
            <i className="ri-image-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Works Available</h3>
            <p className="text-gray-600">Check back soon for our latest projects and innovations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Some Of Our Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our innovative projects and creative solutions that transform the reading experience
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollToPrev}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
            aria-label="Previous work"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>

          <button
            onClick={scrollToNext}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300"
            aria-label="Next work"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>

          {/* Works Carousel */}
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Render infinite loop */}
            {worksImages.length > 0 && [
              ...worksImages.slice(-1), // Clone last item at beginning
              ...worksImages, // Original items
              ...worksImages.slice(0, 1) // Clone first item at end
            ].map((work, index) => (
              <div key={`${work.id}-${index}`} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3" data-work-id={work.id}>
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden h-[480px] flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <img
                      src={work.src}
                      alt={work.alt}
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 h-14">
                      {work.title}
                    </h3>
                    <div className="flex-1 flex flex-col justify-between min-h-[100px]">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 h-10">
                        {work.description || 'Innovative solutions that enhance the digital reading experience and connect readers with their favorite books.'}
                      </p>
                      {truncatedWorks.has(work.id) && (
                        <button
                          onClick={() => openModal(work)}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 self-start mt-3 text-sm shadow-md hover:shadow-lg"
                        >
                          <span>Read More</span>
                          <i className="ri-arrow-right-line text-sm"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {worksImages.length > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {worksImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

                  {/* Auto-play toggle */}
          <div className="text-center mt-8">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center space-x-2 text-gray-600 transition-colors"
            >
              <i className={`text-xl ${isAutoPlaying ? 'ri-pause-circle-line' : 'ri-play-circle-line'}`}></i>
              <span className="text-sm font-medium">
                {isAutoPlaying ? 'Pause' : 'Play'} Auto-scroll
              </span>
            </button>
          </div>
      </div>
      
      {/* Work Modal */}
      <WorkModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        work={selectedWork}
      />
    </div>
  );
} 