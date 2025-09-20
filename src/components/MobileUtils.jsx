import React from 'react'
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'

// Mobile-optimized button with better touch targets
export const MobileButton = ({
  children,
  className = '',
  size = 'lg',
  touchTarget = true,
  ...props
}) => {
  const touchClass = touchTarget ? 'mobile-touch-target' : ''

  return (
    <CButton
      className={`${touchClass} ${className}`}
      size={size}
      {...props}
    >
      {children}
    </CButton>
  )
}

// Mobile-optimized card with better spacing
export const MobileCard = ({
  children,
  className = '',
  header,
  ...props
}) => {
  return (
    <CCard className={`mobile-card ${className}`} {...props}>
      {header && (
        <CCardHeader className="mobile-card-header">
          {header}
        </CCardHeader>
      )}
      <CCardBody className="mobile-card-body">
        {children}
      </CCardBody>
    </CCard>
  )
}

// Touch gesture handler for mobile interactions
export const useTouchGestures = (callbacks = {}) => {
  const touchStartRef = React.useRef(null)
  const touchEndRef = React.useRef(null)

  const handleTouchStart = React.useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = React.useCallback((e) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = touchEnd.time - touchStartRef.current.time
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Swipe detection
    const minSwipeDistance = 50
    const maxSwipeTime = 300

    if (deltaTime < maxSwipeTime) {
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight()
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft()
        }
      } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown()
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp()
        }
      }
    }

    // Tap detection (short touch)
    if (deltaTime < 200 && absDeltaX < 10 && absDeltaY < 10 && callbacks.onTap) {
      callbacks.onTap()
    }

    touchStartRef.current = null
  }, [callbacks])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }
}

// Mobile viewport utilities
export const useMobileViewport = () => {
  const [viewport, setViewport] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  })

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// CSS styles for mobile optimization
export const mobileStyles = `
  .mobile-touch-target {
    min-height: 44px !important;
    min-width: 44px !important;
    padding: 12px 16px !important;
  }

  .mobile-card {
    margin-bottom: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .mobile-card-header {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0 !important;
    font-weight: 600;
  }

  .mobile-card-body {
    padding: 1.25rem;
  }

  @media (max-width: 768px) {
    .mobile-hide-on-small {
      display: none !important;
    }

    .mobile-full-width {
      width: 100% !important;
    }

    .mobile-text-center {
      text-align: center !important;
    }

    .mobile-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-stack > * {
      flex: 1;
    }
  }

  @media (max-width: 576px) {
    .mobile-card-body {
      padding: 1rem;
    }

    .mobile-touch-target {
      font-size: 16px !important; /* Prevents zoom on iOS */
    }
  }

  /* Smooth scrolling for better mobile experience */
  * {
    -webkit-overflow-scrolling: touch;
  }

  /* Better focus indicators for accessibility */
  .mobile-touch-target:focus {
    outline: 3px solid #007bff;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0,123,255,0.25);
  }

  /* Prevent text selection on touch devices for buttons */
  .mobile-touch-target {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`

export default {
  MobileButton,
  MobileCard,
  useTouchGestures,
  useMobileViewport,
  mobileStyles
}
