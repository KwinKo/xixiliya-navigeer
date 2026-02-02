import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface BackToTopButtonProps {
  isMinimalMode?: boolean;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({ isMinimalMode = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Button styles based on mode
  const buttonStyle = {
    backgroundColor: isMinimalMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderColor: isMinimalMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    color: isMinimalMode ? '#333' : '#fff',
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={buttonStyle}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:scale-105 active:scale-95"
      aria-label="Back to top"
    >
      <FontAwesomeIcon 
        icon="arrow-up" 
        size="lg" 
        className="transition-transform duration-300 hover:translate-y-[-2px]"
      />
    </button>
  );
};

export default BackToTopButton;