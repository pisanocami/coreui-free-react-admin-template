import React, { useState, useRef, useEffect } from 'react'
import { CImage } from '@coreui/react'

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters the viewport
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad && onLoad()
  }

  const handleError = () => {
    setHasError(true)
    onError && onError()
  }

  return (
    <div ref={imgRef} className={`optimized-image-container ${className}`}>
      {!isInView && (
        <CImage
          src={placeholder}
          alt="Loading..."
          className="optimized-image-placeholder"
          width={width}
          height={height}
          style={{
            filter: 'blur(2px)',
            transform: 'scale(1.1)',
            transition: 'all 0.3s ease-in-out'
          }}
        />
      )}

      {isInView && (
        <CImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {hasError && (
        <div
          className="optimized-image-error d-flex align-items-center justify-content-center bg-light border"
          style={{ width, height, minHeight: '100px' }}
        >
          <div className="text-center text-muted">
            <i className="fas fa-image fa-2x mb-2"></i>
            <br />
            <small>Image failed to load</small>
          </div>
        </div>
      )}

      <style jsx>{`
        .optimized-image-container {
          position: relative;
          overflow: hidden;
        }

        .optimized-image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
        }

        .optimized-image.loading {
          position: absolute;
          top: 0;
          left: 0;
        }

        .optimized-image.loaded {
          position: relative;
        }
      `}</style>
    </div>
  )
}

export default OptimizedImage
