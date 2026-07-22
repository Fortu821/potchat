// src/components/MediaUpload.jsx
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MediaUpload({ onUpload, onRemove }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileType, setFileType] = useState(null)

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Formato non supportato. Usa immagini o video.')
      return
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setError('L\'immagine supera i 10MB')
      return
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setError('Il video supera i 50MB')
      return
    }

    // Anteprima
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      setFileType(isImage ? 'image' : 'video')
    }
    reader.readAsDataURL(file)

    // Upload su Supabase Storage
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      setUploadProgress(100)
      onUpload(urlData.publicUrl, isImage ? 'image' : 'video')
      setUploading(false)

    } catch (err) {
      console.error('❌ Errore upload:', err)
      setError('Errore durante il caricamento del file')
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileType(null)
    setError(null)
    setUploadProgress(0)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove()
  }

  return (
    <div className="media-upload">
      <div className="media-upload-trigger" onClick={() => fileInputRef.current?.click()}>
        <span className="media-upload-icon">📎</span>
        <span className="media-upload-text">Allega foto o video</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {preview && (
        <div className="media-preview">
          {fileType === 'image' ? (
            <img src={preview} alt="Anteprima" className="media-preview-image" />
          ) : (
            <video src={preview} controls className="media-preview-video" />
          )}
          <button
            onClick={handleRemove}
            className="media-preview-remove"
            disabled={uploading}
          >
            ✕
          </button>
        </div>
      )}

      {uploading && (
        <div className="media-upload-progress">
          <div 
            className="media-upload-progress-bar"
            style={{ width: `${Math.round(uploadProgress)}%` }}
          />
          <span className="media-upload-progress-text">
            {Math.round(uploadProgress)}%
          </span>
        </div>
      )}

      {error && (
        <div className="media-upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}