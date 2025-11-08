'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface MediaFile {
  id: string
  url: string
  filename: string
  original_filename: string
  file_type: string
  file_size: number
  width?: number
  height?: number
  duration?: number
}

interface MediaGalleryProps {
  files: MediaFile[]
  onRemove?: (fileId: string) => void
  showDetails?: boolean
  columns?: number
  className?: string
}

interface LightboxProps {
  file: MediaFile
  isOpen: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
}

function Lightbox({ file, isOpen, onClose, onPrevious, onNext }: LightboxProps) {
  if (!isOpen) return null

  const isVideo = file.file_type.startsWith('video/')

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation buttons */}
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Media content */}
        <div className="flex items-center justify-center max-w-screen-lg max-h-screen">
          {isVideo ? (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-full"
              autoPlay
            />
          ) : (
            <Image
              src={file.url}
              alt={file.original_filename}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              unoptimized
            />
          )}
        </div>

        {/* File info */}
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 rounded-lg p-3">
          <p className="font-medium">{file.original_filename}</p>
          <p className="text-sm text-gray-300">
            {file.file_type} • {formatFileSize(file.file_size)}
            {file.width && file.height && ` • ${file.width}×${file.height}`}
            {file.duration && ` • ${formatDuration(file.duration)}`}
          </p>
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MediaGallery({ 
  files, 
  onRemove, 
  showDetails = false, 
  columns = 3,
  className = '' 
}: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!files || files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2">No media files</p>
      </div>
    )
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  }[columns] || 'grid-cols-3'

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const goToPrevious = () => {
    setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : files.length - 1)
  }

  const goToNext = () => {
    setLightboxIndex(prev => prev !== null && prev < files.length - 1 ? prev + 1 : 0)
  }

  return (
    <div className={className}>
      <div className={`grid ${gridCols} gap-4`}>
        {files.map((file, index) => {
          const isVideo = file.file_type.startsWith('video/')
          
          return (
            <div key={file.id} className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square">
              {/* Media preview */}
              <div 
                className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                {isVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={file.url}
                    alt={file.original_filename}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
              </div>

              {/* File type indicator */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {isVideo ? '🎥' : '📷'}
              </div>

              {/* Remove button */}
              {onRemove && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* File details overlay */}
              {showDetails && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">{file.original_filename}</p>
                  <p className="text-xs text-gray-300">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          file={files[lightboxIndex]}
          isOpen={true}
          onClose={closeLightbox}
          onPrevious={files.length > 1 ? goToPrevious : undefined}
          onNext={files.length > 1 ? goToNext : undefined}
        />
      )}
    </div>
  )
}