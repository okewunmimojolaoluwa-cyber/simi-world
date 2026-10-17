/**
 * Media Uploader - Drag & drop file upload with progress
 */

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaUploaderProps {
  onUploadComplete: () => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'music'>('photo');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    setError('');
    setSuccess('');
    setProgress(0);

    // Validate file type
    const file = files[0];
    const validTypes = {
      photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      music: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    };

    if (!validTypes[mediaType].includes(file.type)) {
      setError(`Please select a valid ${mediaType} file`);
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaType);
      if (caption) {
        formData.append('caption', caption);
      }

      // Simulate progress (since we can't track real upload progress easily)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully!`);
      setCaption('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent
      setTimeout(() => {
        setSuccess('');
        setProgress(0);
        onUploadComplete();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Media Type Selector */}
      <div className="flex gap-2">
        {(['photo', 'video', 'music'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMediaType(type)}
            disabled={uploading}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${mediaType === type
                ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:text-gray-300'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {type === 'photo' && '📷'} 
            {type === 'video' && '🎥'} 
            {type === 'music' && '🎵'} 
            {' '}{type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Caption Input */}
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={`Caption for ${mediaType} (optional)`}
        disabled={uploading}
        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all disabled:opacity-50"
      />

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-yellow-400 bg-yellow-400/10'
            : uploading
            ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed'
            : 'border-gray-600 hover:border-yellow-400/50 hover:bg-gray-800/20'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={
            mediaType === 'photo'
              ? 'image/*'
              : mediaType === 'video'
              ? 'video/*'
              : 'audio/*'
          }
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="text-4xl">⏳</div>
            <p className="text-yellow-400 font-medium">Uploading...</p>
            <div className="max-w-xs mx-auto bg-gray-700/30 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-pink-400"
              />
            </div>
            <p className="text-gray-400 text-sm">{progress}%</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">
              {mediaType === 'photo' && '📷'}
              {mediaType === 'video' && '🎥'}
              {mediaType === 'music' && '🎵'}
            </div>
            <p className="text-gray-300 font-medium mb-1">
              Click to browse or drag & drop
            </p>
            <p className="text-gray-500 text-sm">
              {mediaType === 'photo' && 'JPG, PNG, GIF, WEBP up to 50MB'}
              {mediaType === 'video' && 'MP4, WEBM, MOV up to 50MB'}
              {mediaType === 'music' && 'MP3, WAV, OGG up to 50MB'}
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 text-green-300 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
