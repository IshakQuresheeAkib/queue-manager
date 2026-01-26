'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ImageCropUploadProps {
  onImageCropped: (file: File) => void | Promise<void>;
  currentImage?: string;
  aspectRatio?: number;
  maxSize?: number; // in MB
  loading?: boolean;
}

export const ImageCropUpload: React.FC<ImageCropUploadProps> = ({
  onImageCropped,
  currentImage,
  aspectRatio = 1,
  maxSize = 5,
  loading = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image size must be less than ${maxSize}MB`);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setIsModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const createCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.95);
      });
    } catch (e) {
      console.error('Error creating cropped image:', e);
      setError('Failed to crop image');
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleCropConfirm = async () => {
    const croppedFile = await createCroppedImage();
    if (croppedFile) {
      await onImageCropped(croppedFile);
      setIsModalOpen(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-3">
        {currentImage && (
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5 border-2 border-white/10">
            <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
          </div>
        )}
        
        <label
          htmlFor="image-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Choose Image
            </>
          )}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <Modal isOpen={isModalOpen} onClose={handleCancel} title="Crop Image">
        <div className="space-y-4">
          <div className="relative w-full h-64 sm:h-80 bg-black/50 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={handleCancel} icon={<X size={18} />} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCropConfirm} icon={<Check size={18} />} className="flex-1">
              Crop & Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper function to create image from src
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
