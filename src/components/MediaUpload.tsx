'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface MediaUploadProps {
  onUpload: (files: UploadedFile[]) => void
  onError: (error: string) => void
  maxFiles?: number
  maxSizePerFile?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

interface UploadedFile {
  id: string
  url: string
  filename: string
  original_filename: string
  file_type: string
  file_size: number
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]

export default function MediaUpload({
  onUpload,
  onError,
  maxFiles = 5,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className = ''
}: MediaUploadProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSizePerFile) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSizePerFile)}.`
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported.`
    }
    
    return null
  }, [maxSizePerFile, acceptedTypes, formatFileSize])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!user) {
      onError('Please sign in to upload files')
      return
    }

    if (files.length === 0) return

    // Validate all files first
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        onError(error)
        return
      }
    }

    if (files.length > maxFiles) {
      onError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsUploading(true)
    setUploadProgress({})

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      })

      // Simulate progress for better UX (since we can't track real progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          Object.keys(newProgress).forEach(fileName => {
            if (newProgress[fileName] < 90) {
              newProgress[fileName] = Math.min(90, newProgress[fileName] + Math.random() * 30)
            }
          })
          return newProgress
        })
      }, 200)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Complete progress
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        Object.keys(newProgress).forEach(fileName => {
          newProgress[fileName] = 100
        })
        return newProgress
      })

      // Wait a moment to show completion
      setTimeout(() => {
        setUploadProgress({})
        onUpload(data.files)
      }, 500)

    } catch (error) {
      setUploadProgress({})
      onError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [user, maxFiles, onError, onUpload, validateFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      uploadFiles(files)
    }
  }, [uploadFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      uploadFiles(files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (!user) {
    return (
      <div className={`p-6 border-2 border-dashed border-gray-300 rounded-lg text-center ${className}`}>
        <p className="text-gray-500">Please sign in to upload files</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`relative p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          {isUploading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-indigo-600 font-medium">Uploading files...</p>
            </div>
          ) : (
            <>
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {dragActive ? 'Drop files here' : 'Upload media files'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop or click to select files
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Max {maxFiles} files, {formatFileSize(maxSizePerFile)} each
              </p>
              <p className="text-xs text-gray-400">
                Supports: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, WebM, MOV)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Upload Progress:</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate max-w-xs">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}