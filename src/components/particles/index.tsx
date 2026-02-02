import React, { useMemo } from 'react';

interface ParticlesProps {
  style: 'stars' | 'falling' | 'pulse' | 'float' | 'mixed';
  color: string;
}

const Particles: React.FC<ParticlesProps> = ({ style, color }) => {
  const starStyles = useMemo(() => {
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
  }, [color]);

  const meteorStyles = useMemo(() => {
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
  }, []);

  const fallingStyles = useMemo(() => {
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
  }, [color]);

  const pulseStyles = useMemo(() => {
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
  }, [color]);

  const floatStyles = useMemo(() => {
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
  }, [color]);

  return (
    <div className="particles-container">
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
                animationDuration: s.animationDuration,
                animationDelay: s.animationDelay,
                opacity: s.opacity,
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
                animationDuration: m.animationDuration,
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
              animationDuration: p.animationDuration,
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
              animationDuration: p.animationDuration,
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
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
    </div>
  );
};

export default Particles;
