'use client';

import { motion } from 'framer-motion';

interface RoomWindowProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export default function RoomWindow({ timeOfDay }: RoomWindowProps) {
  const skyGradients = {
    morning: 'linear-gradient(180deg, #ffb866 0%, #ffd699 45%, #ff9eb7 100%)',
    afternoon: 'linear-gradient(180deg, #87ceeb 0%, #b0d9ff 100%)',
    evening: 'linear-gradient(180deg, #1a193b 0%, #45345d 45%, #a35d68 72%, #181426 100%)',
    night: 'linear-gradient(180deg, #1a193b 0%, #45345d 45%, #a35d68 72%, #181426 100%)',
  };

  return (
    <>
      <div className="room-window">
        <div className="window-sky" style={{ background: skyGradients[timeOfDay] }}>
          {/* Moon for evening/night */}
          {(timeOfDay === 'evening' || timeOfDay === 'night') && (
            <motion.div
              className="moon"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Sun for morning/afternoon */}
          {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
            <motion.div
              className="sun"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Stars for night */}
          {timeOfDay === 'night' && (
            <div className="stars">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  className="star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 70}%`,
                    width: Math.random() > 0.7 ? '2px' : '1px',
                    height: Math.random() > 0.7 ? '2px' : '1px',
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.3, 0.8],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Clouds for day */}
          {timeOfDay !== 'night' && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="cloud"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${15 + Math.random() * 20}%`,
                    width: `${60 + Math.random() * 40}px`,
                  }}
                  animate={{
                    x: [0, 30, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}
            </>
          )}

          {/* City Skyline */}
          <div className="city-lights">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="building"
                style={{
                  left: `${i * 7}%`,
                  width: `${Math.random() * 12 + 6}%`,
                  height: `${Math.random() * 70 + 25}%`,
                }}
              >
                {[...Array(Math.floor(Math.random() * 8 + 4))].map((_, w) => (
                  <div
                    key={w}
                    className="window-light"
                    style={{
                      left: `${20 + (w % 3) * 30}%`,
                      top: `${15 + Math.floor(w / 3) * 20}%`,
                      background:
                        Math.random() > 0.5
                          ? 'rgba(255, 220, 120, 0.6)'
                          : 'rgba(100, 100, 150, 0.3)',
                      boxShadow:
                        Math.random() > 0.5 ? '0 0 3px rgba(255, 220, 120, 0.4)' : 'none',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Window Frame */}
        <div className="window-frame">
          <div className="frame-border" />
          <div className="frame-cross-h" />
          <div className="frame-cross-v" />
        </div>
      </div>

      <style jsx>{`
        .room-window {
          position: absolute;
          top: 0;
          left: 15%;
          right: 19%;
          height: 43%;
          overflow: hidden;
          border-left: 8px solid #221b29;
          border-right: 8px solid #221b29;
          box-shadow: inset 0 -40px 60px rgba(0, 0, 0, 0.4),
                      0 0 100px rgba(173, 108, 169, 0.12);
          z-index: 5;
        }

        .window-sky {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .moon {
          position: absolute;
          width: 58px;
          height: 58px;
          right: 18%;
          top: 15%;
          border-radius: 50%;
          background: #f2e8d0;
          box-shadow: 0 0 30px rgba(245, 230, 190, 0.28);
        }

        .sun {
          position: absolute;
          width: 70px;
          height: 70px;
          right: 18%;
          top: 12%;
          border-radius: 50%;
          background: radial-gradient(circle, #ffd97d 0%, #ffb866 100%);
          box-shadow: 0 0 80px rgba(255, 184, 102, 0.8),
                      0 0 120px rgba(212, 175, 55, 0.4);
        }

        .stars {
          position: absolute;
          inset: 0;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          background-color: #ffffff;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.9);
        }

        .cloud {
          position: absolute;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          filter: blur(8px);
        }

        .city-lights {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30%;
          opacity: 0.6;
        }

        .building {
          position: absolute;
          bottom: 0;
          background: linear-gradient(to top, rgba(20, 10, 30, 0.9), rgba(30, 20, 40, 0.7));
          border-radius: 2px 2px 0 0;
        }

        .window-light {
          position: absolute;
          width: 4px;
          height: 3px;
        }

        .window-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .frame-border {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(212, 175, 55, 0.2);
        }

        .frame-cross-h {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 8px;
          transform: translateY(-50%);
          background: linear-gradient(to right,
            rgba(45, 27, 61, 0.95),
            rgba(212, 175, 55, 0.3),
            rgba(45, 27, 61, 0.95)
          );
        }

        .frame-cross-v {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 8px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom,
            rgba(45, 27, 61, 0.95),
            rgba(212, 175, 55, 0.3),
            rgba(45, 27, 61, 0.95)
          );
        }

        @media (max-width: 800px) {
          .room-window {
            left: 7%;
            right: 7%;
            height: 37%;
          }
        }
      `}</style>
    </>
  );
}
