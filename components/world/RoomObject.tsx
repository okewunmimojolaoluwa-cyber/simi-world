'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface RoomObjectProps extends Partial<MotionProps> {
  type: string;
  position: { left: string; top: string };
  label: string;
  onClick?: () => void;
  children: ReactNode;
}

export default function RoomObject({
  type,
  position,
  label,
  onClick,
  children,
  animate,
  transition,
  ...motionProps
}: RoomObjectProps) {
  return (
    <>
      <motion.button
        className={`room-object ${type}-object`}
        style={position}
        onClick={onClick}
        whileHover={{ scale: 1.06, y: -5 }}
        whileTap={{ scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        initial={{ opacity: 0, scale: 0.8 }}
        {...motionProps}
      >
        {children}
        <span className="object-label">{label}</span>
      </motion.button>

      <style jsx>{`
        .room-object {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          z-index: 20;
          padding: 0;
        }

        .object-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 193, 224, 0.8);
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          text-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);
        }

        .room-object:hover .object-label {
          opacity: 1;
          transform: translateY(0);
        }

        /* Gift */
        :global(.gift) {
          position: relative;
          width: 74px;
          height: 70px;
          filter: drop-shadow(0 20px 35px rgba(255, 107, 157, 0.3));
        }

        :global(.gift-box) {
          position: absolute;
          bottom: 0;
          width: 74px;
          height: 54px;
          border-radius: 6px;
          background: linear-gradient(135deg, #ff6b9d, #d4a5d4);
          box-shadow: 0 8px 20px rgba(255, 107, 157, 0.4);
        }

        :global(.gift-lid) {
          position: absolute;
          top: 7px;
          width: 78px;
          height: 16px;
          border-radius: 5px;
          background: linear-gradient(135deg, #ffc1e0, #ff9eb7);
          z-index: 2;
          box-shadow: 0 4px 12px rgba(255, 193, 224, 0.5);
        }

        :global(.gift-ribbon) {
          position: absolute;
          left: 31px;
          top: 0;
          width: 12px;
          height: 70px;
          background: linear-gradient(180deg, #ffd700, #ffe8a8);
          z-index: 3;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }

        /* Controller */
        :global(.controller) {
          width: 78px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background: linear-gradient(145deg, #6b4ba6, #4a2f5c);
          box-shadow: 0 18px 40px rgba(107, 75, 166, 0.4),
                      inset 0 1px rgba(255, 255, 255, 0.15);
          color: #ffc1e0;
        }

        /* Photos */
        :global(.photos-stack) {
          position: relative;
          width: 110px;
          height: 110px;
        }

        :global(.photo) {
          position: absolute;
          width: 68px;
          height: 82px;
          padding: 5px;
          background: #fff8f0;
          box-shadow: 0 15px 35px rgba(155, 123, 222, 0.4);
          border-radius: 3px;
        }

        :global(.photo-one) {
          transform: rotate(-10deg);
          background: linear-gradient(135deg, #ffc1e0, #d4a5d4);
        }

        :global(.photo-two) {
          transform: rotate(7deg);
          background: linear-gradient(135deg, #d4a5d4, #9b7ede);
        }

        :global(.photo-three) {
          transform: rotate(-2deg) translateY(3px);
          background: linear-gradient(135deg, #ff9eb7, #ffc1e0);
        }

        /* Turntable */
        :global(.turntable) {
          width: 90px;
          height: 58px;
          border-radius: 10px;
          background: linear-gradient(145deg, #2d1b3d, #1a0f1e);
          box-shadow: 0 20px 40px rgba(155, 123, 222, 0.3);
          position: relative;
        }

        :global(.record) {
          position: absolute;
          width: 56px;
          height: 56px;
          margin: 1px 0 0 10px;
          border-radius: 50%;
          background: repeating-radial-gradient(
            circle,
            #1a0f1e 0px,
            #1a0f1e 2px,
            #2d1b3d 3px
          );
          animation: spin 6s linear infinite;
          animation-play-state: paused;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
        }

        .music-object:hover :global(.record) {
          animation-play-state: running;
        }

        :global(.record-center) {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b9d, #ffc1e0);
          box-shadow: 0 0 10px rgba(255, 107, 157, 0.8);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Envelope */
        :global(.envelope) {
          width: 82px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffc1e0, #d4a5d4);
          box-shadow: 0 20px 40px rgba(255, 107, 157, 0.4);
          color: #6b4ba6;
        }

        /* Pet - Cat gets special styling */
        :global(.pet) {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: transparent;
          transform: translateZ(0);
        }

        /* Crystal */
        :global(.crystal) {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.2),
            rgba(255, 193, 224, 0.1)
          );
          box-shadow: 0 0 50px rgba(255, 215, 0, 0.4);
          color: #ffd700;
        }

        /* Mood */
        :global(.mood-object) {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          color: #d4a5d4;
        }

        @media (max-width: 800px) {
          .room-object {
            transform: scale(0.9);
          }
        }
      `}</style>
    </>
  );
}
