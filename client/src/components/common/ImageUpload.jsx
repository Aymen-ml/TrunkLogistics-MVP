import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10, 
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  label = 'Truck Images',
  required = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  
  // Process images to ensure they have preview URLs
  const processedImages = React.useMemo(() => {
    try {
      return images.map(img => {
        // If it's already processed, return as is
        if (img && img.preview) return img;
        
        // If it's a File object
        if (img instanceof File) {
          return {
            file: img,
            preview: URL.createObjectURL(img),
            name: img.name,
            type: img.type,
            size: img.size
          };
        }
        
        // If it's a string URL
        if (typeof img === 'string') {
          return {
            preview: img,
            name: img.split('/').pop(),
            isExisting: true
          };
        }
        
        // If it's an object with file_path
        if (img && img.file_path) {
          return {
            preview: img.file_path,
            name: img.file_name || img.file_path.split('/').pop(),
            isExisting: true
          };
        }
        
        return null;
      }).filter(Boolean);
    } catch (err) {
      console.error('Error processing images:', err);
      setError(err.message);
      return [];
    }
  }, [images]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      handleImageUpload(newFiles);
    }
  }, [images, maxImages, maxSize, onImagesChange]);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      handleImageUpload(newFiles);
    }
  }, [images, maxImages, maxSize, onImagesChange]);

  // Process uploaded images
  const handleImageUpload = useCallback((files) => {
    try {
      const validFiles = [];
      const errors = [];

      files.forEach(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} is not an image file`);
          return;
        }

        // Check file size
        if (file.size > maxSize) {
          errors.push(`${file.name} is too large (max ${Math.round(maxSize / (1024 * 1024))}MB)`);
          return;
        }

        // Check total count
        if (processedImages.length + validFiles.length >= maxImages) {
          errors.push(`Maximum ${maxImages} images allowed`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      if (validFiles.length > 0) {
        const newImages = [
          ...processedImages,
          ...validFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: URL.createObjectURL(file)
          }))
        ];
        onImagesChange(newImages);
      }
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError(err.message);
    }
  }, [processedImages, maxImages, maxSize, onImagesChange]);

  // Remove image
  const removeImage = useCallback((index) => {
    try {
      const newImages = [...processedImages];
      const removedImage = newImages[index];
      
      // Revoke URL object if it's a local preview
      if (removedImage && removedImage.preview && !removedImage.isExisting) {
        URL.revokeObjectURL(removedImage.preview);
      }
      
      newImages.splice(index, 1);
      onImagesChange(newImages);
    } catch (err) {
      console.error('Error removing image:', err);
      setError(err.message);
    }
  }, [processedImages, onImagesChange]);
    // This line was part of a duplicate block that needs to be removed

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      processedImages.forEach(image => {
        if (image && image.preview && !image.isExisting) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [processedImages]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Photography Guidelines */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📸 Photography Guidelines</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">⚠️ REQUIRED: At least one image must clearly show the license plate (matricule)</p>
            </div>
            <p><strong>Recommended shots:</strong></p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li><strong>Front view</strong> - Show matricule (license plate) clearly visible ⭐ <em>Required</em></li>
              <li><strong>Rear view</strong> - Include rear license plate if different</li>
              <li><strong>Left & Right sides</strong> - Full profile view of the truck</li>
              <li><strong>Cargo area</strong> - Inside view of loading space</li>
            </ul>
            <p className="mt-2"><strong>Tips:</strong> Take photos in good lighting, ensure matricule is readable, avoid blurry images</p>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {processedImages.length > 0 ? <ImageIcon /> : <Upload />}
            </div>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
              >
                <span>Upload images</span>
                <input
                  id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                  name="images"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {Math.round(maxSize / (1024 * 1024))}MB
            </p>
            <p className="text-xs text-gray-500">
              {processedImages.length}/{maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      <div className="flex flex-wrap gap-4">
        {processedImages.map((image, index) => (
          <div key={index} className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={image.preview}
                alt={image.name || `Upload preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.target.src !== 'https://via.placeholder.com/150?text=Error') {
                    console.error('Error loading image:', image.preview);
                    e.target.src = 'https://via.placeholder.com/150?text=Error';
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
