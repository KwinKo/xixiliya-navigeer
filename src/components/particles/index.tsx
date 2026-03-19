'use client';

import React, { useMemo, useState, useEffect } from 'react';

interface ParticlesProps {
  style: 'stars' | 'falling' | 'pulse' | 'float' | 'mixed';
  color: string;
  className?: string;
}

const Particles: React.FC<ParticlesProps> = ({ style, color, className = '' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const starStyles = useMemo(() => {
    if (!isMounted) return [];
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        background: color,
        animationDuration: `${Math.random() * 4 + 2}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    return stars;
  }, [color, isMounted]);

  const meteorStyles = useMemo(() => {
    if (!isMounted) return [];
    const meteors = [];
    for (let i = 0; i < 5; i++) {
      meteors.push({
        left: `${50 + Math.random() * 50}%`,
        top: `${Math.random() * 30}%`,
        animationDuration: `${Math.random() * 2 + 3}s`,
        animationDelay: `${i * 3 + Math.random() * 5}s`,
      });
    }
    return meteors;
  }, [isMounted]);

  const fallingStyles = useMemo(() => {
    if (!isMounted) return [];
    const particles = [];
    for (let i = 0; i < 80; i++) {
      const size = Math.random() * 6 + 4;
      particles.push({
        left: `${Math.random() * 100}%`,
        top: `${-Math.random() * 20}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        animationDuration: `${8 + Math.random() * 12}s`,
        animationDelay: `${Math.random() * 15}s`,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }
    return particles;
  }, [color, isMounted]);

  const pulseStyles = useMemo(() => {
    if (!isMounted) return [];
    const particles = [];
    for (let i = 0; i < 60; i++) {
      const size = Math.random() * 20 + 10;
      particles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        boxShadow: `0 0 ${size / 2}px ${color}`,
        animationDuration: `${2 + Math.random() * 3}s`,
        animationDelay: `${Math.random() * 5}s`,
      });
    }
    return particles;
  }, [color, isMounted]);

  const floatStyles = useMemo(() => {
    if (!isMounted) return [];
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const size = Math.random() * 30 + 15;
      particles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        opacity: 0.1 + Math.random() * 0.2,
        animationDuration: `${10 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 10}s`,
      });
    }
    return particles;
  }, [color, isMounted]);

  return (
    <div className={`particles-container fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      <style jsx>{`
        .star {
          position: absolute;
          border-radius: 50%;
          animation: twinkle var(--animation-duration) infinite ease-in-out;
        }
        
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${color}, transparent);
          border-radius: 50%;
          box-shadow: 0 0 10px 2px ${color};
          animation: shoot 3s linear infinite;
        }
        
        .falling-particle {
          position: absolute;
          border-radius: 50%;
          animation: fall var(--animation-duration) linear infinite;
        }
        
        .pulse-particle {
          position: absolute;
          border-radius: 50%;
          animation: pulse var(--animation-duration) infinite alternate;
        }
        
        .float-particle {
          position: absolute;
          border-radius: 50%;
          animation: float var(--animation-duration) ease-in-out infinite alternate;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes shoot {
          0% { 
            transform: translateX(-100vw) translateY(-100vh) rotate(45deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% { 
            transform: translateX(100vw) translateY(100vh) rotate(45deg);
            opacity: 0;
          }
        }
        
        @keyframes fall {
          0% { 
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0% { 
            transform: scale(1);
            opacity: 0.5;
          }
          100% { 
            transform: scale(1.5);
            opacity: 0.8;
          }
        }
        
        @keyframes float {
          0% { 
            transform: translate(0, 0) rotate(0deg);
          }
          100% { 
            transform: translate(20px, -20px) rotate(360deg);
          }
        }
      `}</style>
      
      {(style === 'stars' || style === 'mixed') && (
        <>
          {starStyles.map((s, i) => (
            <div
              key={`star-${i}`}
              className="star"
              style={{
                left: s.left,
                top: s.top,
                width: s.width,
                height: s.height,
                background: s.background,
                opacity: s.opacity,
                ['--animation-duration' as any]: s.animationDuration,
                animationDelay: s.animationDelay,
              }}
            />
          ))}
          {meteorStyles.map((m, i) => (
            <div
              key={`meteor-${i}`}
              className="shooting-star"
              style={{
                left: m.left,
                top: m.top,
                ['--animation-duration' as any]: m.animationDuration,
                animationDelay: m.animationDelay,
              }}
            />
          ))}
        </>
      )}
      {(style === 'falling' || style === 'mixed') &&
        fallingStyles.map((p, i) => (
          <div
            key={`falling-${i}`}
            className="falling-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              background: p.background,
              ['--animation-duration' as any]: p.animationDuration,
              animationDelay: p.animationDelay,
              opacity: p.opacity,
            }}
          />
        ))}
      {(style === 'pulse' || style === 'mixed') &&
        pulseStyles.map((p, i) => (
          <div
            key={`pulse-${i}`}
            className="pulse-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              background: p.background,
              boxShadow: p.boxShadow,
              ['--animation-duration' as any]: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      {(style === 'float' || style === 'mixed') &&
        floatStyles.map((p, i) => (
          <div
            key={`float-${i}`}
            className="float-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              background: p.background,
              opacity: p.opacity,
              ['--animation-duration' as any]: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
    </div>
  );
};

export default Particles;