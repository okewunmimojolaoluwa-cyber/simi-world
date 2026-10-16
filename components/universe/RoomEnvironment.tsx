'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RoomEnvironmentProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  mood: any;
  birthdayMode: boolean;
}

export default function RoomEnvironment({ timeOfDay, mood, birthdayMode }: RoomEnvironmentProps) {
  const [time, setTime] = useState('');
  const [imageError, setImageError] = useState(false);

  // Multiple beautiful bedroom images with flowers and decorations
  const bedroomImages = [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=90',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=90',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=90',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&q=90'
  ];

  const [currentImage, setCurrentImage] = useState(bedroomImages[0]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageError = () => {
    const currentIndex = bedroomImages.indexOf(currentImage);
    if (currentIndex < bedroomImages.length - 1) {
      setCurrentImage(bedroomImages[currentIndex + 1]);
    } else {
      setImageError(true);
    }
  };

  // Sky colors based on time
  const skyGradients = {
    morning: 'from-[#ffb866] via-[#ffd699] to-[#ff9eb7]',
    afternoon: 'from-[#87ceeb] to-[#b0d9ff]',
    evening: 'from-[#ff8066] via-[#ff9eb7] to-[#845ec2]',
    night: 'from-[#0f0a1a] via-[#1e2a4a] to-[#2d1b3d]'
  };

  // Particles based on mood
  const particleCount = mood?.atmosphere.particles === 'none' ? 0 : 20;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Real Cozy Bedroom Background Image - Beautiful bedroom with flowers and decorations - VERY BRIGHT */}
      <div className="absolute inset-0 opacity-80 md:opacity-85">
        {!imageError ? (
          <img
            src={currentImage}
            alt="Cozy bedroom with flowers and decorations"
            className="w-full h-full object-cover"
            style={{
              filter: 'blur(0px) brightness(1.3) contrast(1.1)',
            }}
            onError={handleImageError}
            loading="eager"
          />
        ) : (
          /* Fallback pattern if image fails to load */
          <div 
            className="w-full h-full"
            style={{
              background: 'linear-gradient(135deg, rgba(132,94,194,0.4) 0%, rgba(255,158,183,0.4) 100%)',
            }}
          />
        )}
      </div>
      
      {/* Very light overlay gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(26,15,30,0.3) 0%, 
              rgba(45,27,61,0.2) 50%, 
              rgba(58,42,61,0.35) 100%
            )
          `
        }}
      />
      
      {/* Base bedroom floor with wood texture */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(26,15,30,0) 0%, 
              rgba(45,27,61,0.4) 50%, 
              rgba(58,42,61,0.8) 100%
            )
          `
        }}
      />
      
      {/* Bedroom wall texture/pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
          `
        }}
      />
      
      {/* Ambient warm glow from lamps - gold accent */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 15% 75%, rgba(212,175,55,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 600px 500px at 85% 60%, rgba(255,184,102,0.12) 0%, transparent 40%),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(255,158,183,0.08) 0%, transparent 60%)
          `
        }}
      />

      {/* Large Window with City View - Responsive */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute rounded-xl md:rounded-2xl overflow-hidden shadow-2xl"
        style={{
          top: '5%',
          right: '5%',
          width: 'min(280px, 35vw)',
          height: 'min(350px, 45vh)',
          transform: 'perspective(1500px) rotateY(-12deg) rotateX(4deg)',
          border: '6px solid rgba(45, 27, 61, 0.9)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(212,175,55,0.1)'
        }}
      >
        <div className={`w-full h-full bg-gradient-to-b ${skyGradients[timeOfDay]}`}>
          {/* Stars at night */}
          {timeOfDay === 'night' && (
            <>
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() > 0.7 ? '2px' : '1px',
                    height: Math.random() > 0.7 ? '2px' : '1px',
                    backgroundColor: '#ffffff',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 70}%`,
                    boxShadow: '0 0 4px rgba(255,255,255,0.9)'
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.3, 0.8]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </>
          )}
          
          {/* Sun/Moon with gold glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: timeOfDay === 'night' ? '60px' : '70px',
              height: timeOfDay === 'night' ? '60px' : '70px',
              top: timeOfDay === 'morning' ? '12%' : timeOfDay === 'night' ? '20%' : '30%',
              right: '12%',
              background: timeOfDay === 'night' 
                ? 'radial-gradient(circle, #f5f5f5 0%, #d9d9d9 100%)'
                : 'radial-gradient(circle, #ffd97d 0%, #ffb866 100%)',
              boxShadow: timeOfDay === 'night' 
                ? '0 0 50px rgba(255,255,255,0.5), inset -12px -12px 25px rgba(0,0,0,0.15)'
                : '0 0 80px rgba(255,184,102,0.8), 0 0 120px rgba(212,175,55,0.4)'
            }}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Clouds for day time */}
          {timeOfDay !== 'night' && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${15 + Math.random() * 20}%`,
                    width: `${60 + Math.random() * 40}px`,
                    height: '20px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '50px',
                    filter: 'blur(8px)'
                  }}
                  animate={{
                    x: [0, 30, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              ))}
            </>
          )}
          
          {/* City silhouette with lit windows */}
          <div className="absolute bottom-0 left-0 right-0 h-40 opacity-40">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${i * 7}%`,
                  width: `${Math.random() * 12 + 6}%`,
                  height: `${Math.random() * 70 + 25}%`,
                  background: 'linear-gradient(to top, rgba(20,10,30,0.9), rgba(30,20,40,0.7))',
                  borderRadius: '2px 2px 0 0'
                }}
              >
                {/* Building windows */}
                {[...Array(Math.floor(Math.random() * 8 + 4))].map((_, w) => (
                  <div
                    key={w}
                    className="absolute"
                    style={{
                      width: '4px',
                      height: '3px',
                      left: `${20 + (w % 3) * 30}%`,
                      top: `${15 + Math.floor(w / 3) * 20}%`,
                      background: Math.random() > 0.5 ? 'rgba(255,220,120,0.6)' : 'rgba(100,100,150,0.3)',
                      boxShadow: Math.random() > 0.5 ? '0 0 3px rgba(255,220,120,0.4)' : 'none'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Window frame with gold accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            border: '2px solid rgba(212, 175, 55, 0.2)'
          }} />
          <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2" style={{
            background: 'linear-gradient(to right, rgba(45, 27, 61, 0.95), rgba(212, 175, 55, 0.3), rgba(45, 27, 61, 0.95))'
          }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2" style={{
            background: 'linear-gradient(to bottom, rgba(45, 27, 61, 0.95), rgba(212, 175, 55, 0.3), rgba(45, 27, 61, 0.95))'
          }} />
        </div>
        
        {/* Curtain with gold trim */}
        <motion.div
          className="absolute -left-6 top-0 w-16 h-full"
          style={{
            background: 'linear-gradient(to right, rgba(132, 94, 194, 0.6), rgba(132, 94, 194, 0.3), transparent)',
            borderLeft: '2px solid rgba(212, 175, 55, 0.4)'
          }}
          animate={{
            x: [0, 6, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* Elegant Desk Lamp with Gold Accents - Responsive */}
      <motion.div
        className="absolute hidden md:block"
        style={{
          bottom: 'min(7rem, 20vh)',
          left: 'min(5rem, 8vw)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          {/* Lamp base with gold */}
          <div className="w-24 h-5 rounded-full shadow-2xl" style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.4) 0%, rgba(45,27,61,0.9) 50%, rgba(212,175,55,0.3) 100%)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.6), inset 0 2px 4px rgba(212,175,55,0.3)'
          }} />
          
          {/* Lamp stem with gold accent */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-4 h-24 rounded-sm" style={{
            background: 'linear-gradient(to top, rgba(45,27,61,0.9), rgba(212,175,55,0.2), rgba(58,42,74,0.9))',
            boxShadow: 'inset 0 0 8px rgba(212,175,55,0.2)'
          }} />
          
          {/* Lampshade with warm gold glow */}
          <div 
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-28 h-20"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,184,102,0.4), rgba(255,214,153,0.6))',
              clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
              borderBottom: '3px solid rgba(212,175,55,0.7)',
              boxShadow: '0 5px 20px rgba(255,184,102,0.3), inset 0 -5px 15px rgba(212,175,55,0.4)'
            }}
          />
          
          {/* Warm golden light glow */}
          {timeOfDay === 'evening' || timeOfDay === 'night' ? (
            <>
              <motion.div
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none"
                animate={{
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.5) 0%, rgba(255,184,102,0.3) 25%, rgba(255,214,153,0.15) 50%, transparent 75%)',
                    filter: 'blur(25px)'
                  }}
                />
              </motion.div>
              
              {/* Additional sparkle effect */}
              <motion.div
                className="absolute bottom-28 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{
                  background: 'rgba(212,175,55,0.9)',
                  boxShadow: '0 0 15px rgba(212,175,55,0.8)'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </>
          ) : null}
        </div>
      </motion.div>

      {/* Bedside Table Lamp (right side) with gold - Responsive */}
      <motion.div
        className="absolute hidden lg:block"
        style={{
          bottom: 'min(10rem, 25vh)',
          right: 'min(8rem, 12vw)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="relative">
          {/* Small lamp base */}
          <div className="w-16 h-4 rounded-full" style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(45,27,61,0.8), rgba(212,175,55,0.2))',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
          }} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-16" style={{
            background: 'linear-gradient(to top, rgba(45,27,61,0.9), rgba(212,175,55,0.15))'
          }} />
          
          {/* Small lampshade */}
          <div 
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-20 h-14"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,158,183,0.3), rgba(255,184,102,0.5))',
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              borderBottom: '2px solid rgba(212,175,55,0.6)'
            }}
          />
          
          {/* Soft pink-gold glow */}
          {timeOfDay === 'evening' || timeOfDay === 'night' ? (
            <motion.div
              className="absolute bottom-18 left-1/2 -translate-x-1/2 w-32 h-32"
              animate={{
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255,158,183,0.4), rgba(212,175,55,0.2), transparent)',
                  filter: 'blur(20px)'
                }}
              />
            </motion.div>
          ) : null}
        </div>
      </motion.div>

      {/* Floating Particles with gold sparkles */}
      {particleCount > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
                backgroundColor: i % 3 === 0 ? '#d4af37' : (mood?.atmosphere.accent || '#ffb866'),
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: i % 3 === 0 
                  ? `0 0 ${Math.random() * 15 + 10}px rgba(212,175,55,0.8)` 
                  : `0 0 ${Math.random() * 10 + 5}px ${mood?.atmosphere.accent || '#ffb866'}50`
              }}
              animate={{
                y: [0, -180, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 0.9, 0],
                scale: [0, 2, 0]
              }}
              transition={{
                duration: Math.random() * 7 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Digital Clock with gold frame */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute top-8 left-8 px-4 py-2 rounded-lg"
        style={{
          background: 'rgba(26,15,30,0.7)',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 3px rgba(212,175,55,0.2)'
        }}
      >
        <div className="text-text-primary text-base font-mono tracking-wider" style={{
          textShadow: '0 0 10px rgba(212,175,55,0.5)'
        }}>
          {time}
        </div>
      </motion.div>

      {/* Framed Photos on Wall with gold frames */}
      <motion.div
        className="absolute top-32 left-36 w-28 h-32 rounded-md shadow-2xl overflow-hidden cursor-pointer"
        initial={{ opacity: 0, rotate: -4 }}
        animate={{ opacity: 1, rotate: -3 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.1, rotate: 0, y: -5 }}
        style={{
          border: '6px solid rgba(212,175,55,0.7)',
          background: 'linear-gradient(135deg, rgba(132, 94, 194, 0.3), rgba(255, 158, 183, 0.2))',
          boxShadow: '0 15px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.2)'
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-5xl">📸</span>
        </div>
      </motion.div>

      {/* Second photo frame */}
      <motion.div
        className="absolute top-48 left-12 w-24 h-28 rounded-md shadow-2xl overflow-hidden cursor-pointer"
        initial={{ opacity: 0, rotate: 3 }}
        animate={{ opacity: 1, rotate: 2 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1, rotate: 0, y: -5 }}
        style={{
          border: '5px solid rgba(212,175,55,0.6)',
          background: 'linear-gradient(135deg, rgba(255, 158, 183, 0.3), rgba(132, 94, 194, 0.2))',
          boxShadow: '0 12px 35px rgba(0,0,0,0.5), inset 0 0 15px rgba(212,175,55,0.15)'
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl">�</span>
        </div>
      </motion.div>

      {/* Potted Plant with gold pot */}
      <motion.div
        className="absolute bottom-16 right-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))' }}
      >
        <div className="relative">
          {/* Gold-accented pot */}
          <div className="w-20 h-24 rounded-t-2xl" style={{
            background: 'linear-gradient(135deg, rgba(45,27,61,0.9) 0%, rgba(212,175,55,0.3) 50%, rgba(45,27,61,0.9) 100%)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6), inset 0 5px 15px rgba(212,175,55,0.2)',
            border: '2px solid rgba(212,175,55,0.4)'
          }} />
          
          {/* Decorative gold band on pot */}
          <div className="absolute top-1/2 left-0 right-0 h-1" style={{
            background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.7), transparent)'
          }} />
          
          {/* Plant leaves */}
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-20 left-1/2 rounded-full"
              style={{
                width: '32px',
                height: '55px',
                background: 'linear-gradient(to top, #4a6741, #6a8761, #8ab581)',
                transformOrigin: 'bottom center',
                rotate: `${i * 40 - 160}deg`,
                translateX: '-50%',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3), inset 0 -5px 10px rgba(0,0,0,0.2)'
              }}
              animate={{
                rotate: `${i * 40 - 160 + Math.sin(Date.now() / 1000 + i) * 10}deg`
              }}
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Decorative Books Stack */}
      <motion.div
        className="absolute bottom-24 right-64"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-20 h-4 mb-1 rounded-sm"
            style={{
              background: i === 1 
                ? 'linear-gradient(135deg, rgba(212,175,55,0.6), rgba(255,184,102,0.4))'
                : `linear-gradient(135deg, rgba(132,94,194,${0.5 - i * 0.1}), rgba(255,158,183,${0.4 - i * 0.1}))`,
              transform: `rotate(${(i - 1.5) * 2}deg)`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              border: i === 1 ? '1px solid rgba(212,175,55,0.5)' : 'none'
            }}
          />
        ))}
      </motion.div>

      {/* Candles with gold holders */}
      <motion.div
        className="absolute bottom-52 left-44"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <div className="flex gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="relative">
              {/* Candle holder (gold) */}
              <div 
                className="w-6 h-8 rounded-t-lg"
                style={{
                  background: 'linear-gradient(to top, rgba(212,175,55,0.7), rgba(255,214,153,0.4))',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.5), inset 0 2px 5px rgba(212,175,55,0.5)'
                }}
              />
              {/* Flame */}
              {timeOfDay === 'evening' || timeOfDay === 'night' ? (
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  animate={{
                    scale: [1, 1.2, 1],
                    y: [0, -2, 0]
                  }}
                  transition={{
                    duration: 1.5 + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div 
                    className="w-3 h-5 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,214,153,1), rgba(255,184,102,0.8), rgba(212,175,55,0.6))',
                      boxShadow: '0 0 15px rgba(255,184,102,0.8)',
                      filter: 'blur(0.5px)'
                    }}
                  />
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ambient Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${mood?.atmosphere.accent || '#d4af37'}15 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
