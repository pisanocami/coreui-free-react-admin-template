import React from 'react'

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    cls: null, // Cumulative Layout Shift
    fid: null, // First Input Delay
    ttfb: null // Time to First Byte
  })

  React.useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      // Dynamically import web-vitals for better performance
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          setMetrics(prev => ({ ...prev, cls: metric.value }))
          console.log('CLS:', metric.value)
        })

        getFID((metric) => {
          setMetrics(prev => ({ ...prev, fid: metric.value }))
          console.log('FID:', metric.value)
        })

        getFCP((metric) => {
          setMetrics(prev => ({ ...prev, fcp: metric.value }))
          console.log('FCP:', metric.value)
        })

        getLCP((metric) => {
          setMetrics(prev => ({ ...prev, lcp: metric.value }))
          console.log('LCP:', metric.value)
        })

        getTTFB((metric) => {
          setMetrics(prev => ({ ...prev, ttfb: metric.value }))
          console.log('TTFB:', metric.value)
        })
      }).catch(err => {
        console.warn('Web Vitals not available:', err)
      })
    }

    // Basic performance monitoring fallback
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart
          })
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] })
    } catch (e) {
      console.warn('Performance Observer not supported')
    }

    return () => observer.disconnect()
  }, [])

  const logPerformance = React.useCallback((action, duration) => {
    console.log(`Performance: ${action} took ${duration}ms`)
  }, [])

  return { metrics, logPerformance }
}

// Component performance wrapper
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const startTime = React.useRef(performance.now())

    React.useEffect(() => {
      const mountTime = performance.now() - startTime.current
      console.log(`Component ${componentName} mounted in ${mountTime.toFixed(2)}ms`)
    }, [])

    React.useEffect(() => {
      return () => {
        const unmountTime = performance.now() - startTime.current
        console.log(`Component ${componentName} lived for ${unmountTime.toFixed(2)}ms`)
      }
    })

    return <WrappedComponent {...props} ref={ref} />
  })
}

// Network request monitoring
export const useNetworkMonitor = () => {
  const [networkStatus, setNetworkStatus] = React.useState({
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection || null
  })

  React.useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, online: true }))
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, online: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor connection changes if available
    if ('connection' in navigator) {
      const connection = navigator.connection
      const handleConnectionChange = () => {
        setNetworkStatus(prev => ({
          ...prev,
          connection: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          }
        }))
      }

      connection.addEventListener('change', handleConnectionChange)
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return networkStatus
}

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = React.useState(null)

  React.useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = performance.memory
        setMemoryUsage({
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024),
          percentage: Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100)
        })
      }
    }

    const interval = setInterval(checkMemory, 5000) // Check every 5 seconds
    checkMemory() // Initial check

    return () => clearInterval(interval)
  }, [])

  return memoryUsage
}

// Resource loading monitor
export const useResourceMonitor = () => {
  const [resources, setResources] = React.useState([])

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const resourceEntries = entries
        .filter(entry => entry.entryType === 'resource')
        .map(entry => ({
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          size: entry.transferSize || 0,
          cached: !entry.transferSize
        }))

      setResources(prev => [...prev, ...resourceEntries].slice(-50)) // Keep last 50 entries
    })

    try {
      observer.observe({ entryTypes: ['resource'] })
    } catch (e) {
      console.warn('Resource monitoring not supported')
    }

    return () => observer.disconnect()
  }, [])

  return resources
}

export default {
  usePerformanceMonitor,
  useNetworkMonitor,
  useMemoryMonitor,
  useResourceMonitor,
  withPerformanceMonitoring
}
