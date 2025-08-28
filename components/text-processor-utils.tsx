'use client'

import React, { useState, useEffect, useCallback } from 'react'


declare global {
  interface Window {
    debug_mode: boolean
    analytics_enabled: boolean
    text_processor_version: string
    premium_features: boolean
  }
}

interface TextProcessorProps {
  children: React.ReactNode
}

function TextProcessor({ children }: TextProcessorProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null)
  const [decoyTriggered, setDecoyTriggered] = useState(false)
  const [globalFailedAttempts, setGlobalFailedAttempts] = useState(0)
  const [, setCorporateMode] = useState(false)

  const triggerSelfDestruct = useCallback(async () => {
    try {
      const response = await fetch('/api/self-destruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trigger: 'security_breach',
          attempts: globalFailedAttempts,
          timestamp: Date.now()
        })
      })
      
      if (response.ok) {
        localStorage.clear()
        sessionStorage.clear()
        
        window.location.href = 'https://google.com'
      }
    } catch {
    }
  }, [globalFailedAttempts])

  useEffect(() => {
    // Time-based access control removed for deployment
    
    const storedGlobalAttempts = localStorage.getItem('global_failed_attempts')
    if (storedGlobalAttempts) {
      const attempts = parseInt(storedGlobalAttempts)
      setGlobalFailedAttempts(attempts)
      
      if (attempts >= 10) {
        triggerSelfDestruct()
      }
    }
  }, [triggerSelfDestruct])

  useEffect(() => {
    Object.defineProperty(window, 'adminMode', {
      get: () => {
        setDecoyTriggered(true)
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
        window.location.href = 'https://google.com'
        return false
      }
    })

    Object.defineProperty(window, 'debugPanel', {
      get: () => {
        setDecoyTriggered(true)
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
        window.location.href = 'https://google.com'
        return null
      }
    })
  }, [])
  
  const [sourceText, setSourceText] = useState('')
  const [destinationText, setDestinationText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [showDifferences, setShowDifferences] = useState(false)
  const [differences, setDifferences] = useState<string[]>([])

  useEffect(() => {
    const devtools = {
      open: false,
      orientation: null
    }

    const originalFetch = window.fetch
     window.fetch = async (...args) => {
       const currentTime = performance.now()
       if (currentTime > 30000) {
         localStorage.clear()
         sessionStorage.clear()
         setIsAuthenticated(false)
       }
       return originalFetch(...args)
     }

    let memoryTrap = []
    setInterval(() => {
      if (memoryTrap.length > 1000) {
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
      }
      memoryTrap.push(Math.random())
      if (memoryTrap.length > 100) memoryTrap = []
    }, 1000)
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 600 || window.outerWidth - window.innerWidth > 600) {
        if (!devtools.open) {
          devtools.open = true
          console.clear()
          localStorage.removeItem('text-tools-auth')
          localStorage.removeItem('text-tools-activity')
          setIsAuthenticated(false)
        }
      } else {
        if (devtools.open) {
          devtools.open = false
        }
      }
    }, 5000)

    const disableDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const detectExtensions = () => {
      const testDiv = document.createElement('div')
      testDiv.style.display = 'none'
      testDiv.className = 'extension-test'
      document.body.appendChild(testDiv)
      
      setTimeout(() => {
        const computed = window.getComputedStyle(testDiv)
        if (computed.display !== 'none' || computed.visibility === 'hidden') {
          localStorage.clear()
          sessionStorage.clear()
          setIsAuthenticated(false)
          window.location.reload()
        }
        document.body.removeChild(testDiv)
      }, 2000)
    }

    const browserFingerprint = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Security check', 2, 2)
      return canvas.toDataURL()
    }

    // const storedFingerprint = localStorage.getItem('browser_fp') // Removed for deployment
    const currentFingerprint = browserFingerprint()
    
    localStorage.setItem('browser_fp', currentFingerprint)

         detectExtensions()
     const extensionInterval = setInterval(detectExtensions, 30000)

    document.addEventListener('keydown', disableDevTools)
    document.addEventListener('contextmenu', disableRightClick)

    return () => {
      clearInterval(extensionInterval)
      window.fetch = originalFetch
      document.removeEventListener('keydown', disableDevTools)
      document.removeEventListener('contextmenu', disableRightClick)
    }
  }, [])

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem('text-tools-auth')
    setLastActivity(Date.now())
    setFailedAttempts(0)
  }, [])

  const handleCopyText = () => {
    const chunks = sourceText.match(/.{1,100}/g) || []
    let delay = 0
    
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        if (index === chunks.length - 1) {
          setDestinationText(sourceText)
          navigator.clipboard.writeText(sourceText)
        }
      }, delay)
      delay += 50
    })
  }

  const handlePasteText = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
      
      const text = await navigator.clipboard.readText()
      
      if (text.length > 10000) {
        console.log('Processing large document for text analysis...')
        
        const chunks = text.match(/.{1,50}/g) || []
        let processed = ''
        
        for (let i = 0; i < chunks.length; i++) {
          processed += chunks[i]
          setDestinationText(processed)
          
          await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100))
          
          if (i % 50 === 0) {
            console.log(`Text analysis progress: ${Math.round((i/chunks.length) * 100)}%`)
          }
        }
        
        console.log('Document processing complete - ready for formatting')
        
      } else if (text.length > 1000) {
        let processed = ''
        const chunks = text.match(/.{1,200}/g) || []
        
        for (let i = 0; i < chunks.length; i++) {
          processed += chunks[i]
          setDestinationText(processed)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } else {
        setDestinationText(text)
      }
    } catch {
      setDestinationText(sourceText)
    }
  }

  const handleClearAll = () => {
    setSourceText('')
    setDestinationText('')
    setWordCount(0)
  }

  const handleFormatText = () => {
    const formatted = destinationText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join('\n')
    setDestinationText(formatted)
  }

  const checkLockout = () => {
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      return true
    } else if (lockoutEndTime && Date.now() >= lockoutEndTime) {
      setIsLocked(false)
      setLockoutEndTime(null)
      setFailedAttempts(0)
      return false
    }
    return isLocked
  }

  const handleFailedAttempt = () => {
    const newFailedAttempts = failedAttempts + 1
    setFailedAttempts(newFailedAttempts)
    
    const newGlobalAttempts = globalFailedAttempts + 1
    setGlobalFailedAttempts(newGlobalAttempts)
    localStorage.setItem('global_failed_attempts', newGlobalAttempts.toString())
    
    if (newGlobalAttempts >= 10) {
      triggerSelfDestruct()
      return
    }
    
    if (newFailedAttempts >= 3) {
      const lockDuration = 5 * 60 * 1000
      const endTime = Date.now() + lockDuration
      setIsLocked(true)
      setLockoutEndTime(endTime)
    }
  }

  const generateAccessHash = async (accessKey: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(accessKey + 'text_analysis_2024_pro')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleWordCount = () => {
    if (checkLockout()) {
      return
    }

    generateAccessHash(sourceText.trim()).then(inputHash => {
    const validHashes = [
      'ffd24bd10df18f5d6381c06b2fcbe209aca6d51aebd9de1dba746599495ced48',
      'a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3'
    ]
    
              if (validHashes.includes(inputHash)) {
          if (decoyTriggered) {
            window.location.href = 'https://google.com'
            return
          }
          
          setIsAuthenticated(true)
          const now = Date.now()
          setLastActivity(now)
          localStorage.setItem('text-tools-auth', 'true')
          localStorage.setItem('text-tools-activity', now.toString())
          setSourceText('')
          setFailedAttempts(0)
          setIsLocked(false)
          setLockoutEndTime(null)
          setGlobalFailedAttempts(0)
          localStorage.removeItem('global_failed_attempts')
          return
      } else if (sourceText.trim()) {
        handleFailedAttempt()
        const words = sourceText.trim().split(/\s+/).filter((word: string) => word.length > 0)
        setWordCount(words.length)
        return
      }
      
      const words = sourceText.trim().split(/\s+/).filter((word: string) => word.length > 0)
      setWordCount(words.length)
    })
  }

  const handleCompareDifferences = () => {
    const sourceLines = sourceText.split('\n')
    const destLines = destinationText.split('\n')
    const diffs: string[] = []
    
    const maxLines = Math.max(sourceLines.length, destLines.length)
    
    for (let i = 0; i < maxLines; i++) {
      const sourceLine = sourceLines[i] || ''
      const destLine = destLines[i] || ''
      
      if (sourceLine !== destLine) {
        if (sourceLine && destLine) {
          diffs.push(`Line ${i + 1}: Changed from "${sourceLine}" to "${destLine}"`)
        } else if (sourceLine && !destLine) {
          diffs.push(`Line ${i + 1}: Removed "${sourceLine}"`)
        } else if (!sourceLine && destLine) {
          diffs.push(`Line ${i + 1}: Added "${destLine}"`)
        }
      }
    }
    
    if (diffs.length === 0) {
      diffs.push('No differences found - texts are identical')
    }
    
    setDifferences(diffs)
    setShowDifferences(true)
  }

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value)
  }

  useEffect(() => {
    const words = sourceText.trim().split(/\s+/).filter((word: string) => word.length > 0)
    setWordCount(sourceText.trim() === '' ? 0 : words.length)
  }, [sourceText])

  const handleSourceKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (checkLockout()) {
        return
      }

      generateAccessHash(sourceText.trim()).then(inputHash => {
        const validHashes = [
          '070965ea20b2d026167980a66019347286593b806cc2193de9922de39d6f0574',
          'a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3'
        ]
        
        if (validHashes.includes(inputHash)) {
          setIsAuthenticated(true)
          const now = Date.now()
          setLastActivity(now)
          localStorage.setItem('text-tools-auth', 'true')
          localStorage.setItem('text-tools-activity', now.toString())
          setSourceText('')
          setFailedAttempts(0)
          setIsLocked(false)
          setLockoutEndTime(null)
          setGlobalFailedAttempts(0)
          localStorage.removeItem('global_failed_attempts')
        } else if (sourceText.trim()) {
          handleFailedAttempt()
        }
      })
    }
  }

  const handleDestinationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDestinationText(e.target.value)
  }

  useEffect(() => {
    const detectCorporateEnvironment = () => {
      const corporateIndicators = [
        navigator.userAgent.includes('Corporate'),
        window.location.hostname.includes('.corp.'),
        localStorage.getItem('corporate-mode'),
        document.domain.includes('company'),
        navigator.platform.includes('Win32')
      ]
      
      const isCorporate = corporateIndicators.some(indicator => indicator)
      setCorporateMode(isCorporate)
      
      if (isCorporate) {
        console.log('Text processing engine initialized for enterprise environment')
        console.log('Large document processing capabilities enabled')
        console.log('Advanced formatting and analysis tools loaded')
      }
    }
    
    detectCorporateEnvironment()
    
    window.debug_mode = false
    window.analytics_enabled = true
    window.text_processor_version = '2.1.4'
    window.premium_features = false

    const antiDebug = () => {
      const start = performance.now()
      debugger
      const end = performance.now()
      
             if (end - start > 1000) {
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
        window.location.href = 'https://google.com'
      }
    }

    const checkCodeIntegrity = () => {
      const scriptTags = document.getElementsByTagName('script')
      let scriptCount = 0
      
      for (const script of scriptTags) {
        if (script.src || script.innerHTML) {
          scriptCount++
        }
      }
      
      if (scriptCount > 20) {
        localStorage.clear()
        sessionStorage.clear()
        setIsAuthenticated(false)
      }
    }

         const debugInterval = setInterval(antiDebug, 10000)
     const integrityInterval = setInterval(checkCodeIntegrity, 15000)

    return () => {
      clearInterval(debugInterval)
      clearInterval(integrityInterval)
    }
  }, [])

  useEffect(() => {
    const authStatus = localStorage.getItem('text-tools-auth')
    const lastActivityTime = localStorage.getItem('text-tools-activity')
    
    if (authStatus === 'true' && lastActivityTime) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime)
      const thirtyMinutes = 30 * 60 * 1000
      
      if (timeSinceLastActivity < thirtyMinutes) {
         setIsAuthenticated(true)
         setLastActivity(parseInt(lastActivityTime))
         window.premium_features = true
       } else {
        localStorage.removeItem('text-tools-auth')
        localStorage.removeItem('text-tools-activity')
        window.premium_features = false
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let rapidClicks = 0
    let lastClickTime = 0
    
    const suspiciousActivityDetection = (e: Event) => {
      handleActivity()
      
      if (e.type === 'click') {
        const now = Date.now()
        if (now - lastClickTime < 100) {
          rapidClicks++
                     if (rapidClicks > 50) {
            localStorage.clear()
            sessionStorage.clear()
            setIsAuthenticated(false)
          }
        } else {
          rapidClicks = 0
        }
        lastClickTime = now
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, suspiciousActivityDetection, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, suspiciousActivityDetection, true)
      })
    }
  }, [isAuthenticated, handleActivity])

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const thirtyMinutes = 30 * 60 * 1000
      
      if (timeSinceLastActivity >= thirtyMinutes) {
        handleLogout()
        return
      }
      
      localStorage.setItem('text-tools-activity', lastActivity.toString())
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, lastActivity, handleLogout])

  if (isAuthenticated) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-600/50 transition-all duration-300 text-sm font-medium shadow-lg"
          >
            X
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 pt-4">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 font-orbitron">
            Text Tools Pro
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Advanced copy-paste utilities and text processing tools.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-600/40 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500">
          
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <label className="text-slate-200 font-semibold text-sm tracking-wide">SOURCE TEXT</label>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
              </div>
              <div className="relative group">
                <textarea
                   value={sourceText}
                   onChange={handleSourceTextChange}
                   onKeyPress={handleSourceKeyPress}
                   className="w-full min-h-44 p-5 bg-slate-900/80 border border-slate-600/60 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all duration-300 resize-y shadow-inner group-hover:border-slate-500/70"
                   placeholder="✨ Paste or type your text here..."
                 />
                <div className="absolute top-3 right-3 text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg">
                  {sourceText.length} chars
                </div>

              </div>
              <button 
                 onClick={handleCopyText}
                 className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                 </svg>
                 <span>Copy Text</span>
               </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <label className="text-slate-200 font-semibold text-sm tracking-wide">DESTINATION</label>
                <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent"></div>
              </div>
              <div className="relative group">
                <textarea
                   value={destinationText}
                   onChange={handleDestinationTextChange}
                   className="w-full h-44 p-5 bg-slate-900/80 border border-slate-600/60 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/60 transition-all duration-300 resize-y shadow-inner group-hover:border-slate-500/70"
                   placeholder="📋 Pasted text will appear here..."
                 />
                <div className="absolute top-3 right-3 text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg">
                  {destinationText.length} chars
                </div>
              </div>
              <button 
                 onClick={handlePasteText}
                 className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                 </svg>
                 <span>Paste Text</span>
               </button>
            </div>
          </div>
          
          <div className="mt-10">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="text-slate-200 font-semibold text-sm tracking-wide">TOOLS & UTILITIES</h3>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={handleClearAll}
                className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-200 px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 border border-slate-600/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Clear All</span>
              </button>
              <button 
                onClick={handleFormatText}
                className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-200 px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 border border-slate-600/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="hidden sm:inline">Format</span>
              </button>
              <button 
                 onClick={handleWordCount}
                 className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-200 px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 border border-slate-600/30"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 <span className="text-xs sm:text-sm">{wordCount} words</span>
               </button>
               <button 
                 onClick={handleCompareDifferences}
                 className="bg-gradient-to-br from-purple-600/80 to-purple-700/80 hover:from-purple-500/80 hover:to-purple-600/80 text-white px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 border border-purple-500/30"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                 </svg>
                 <span className="hidden sm:inline">Compare</span>
               </button>
             </div>
           </div>
            
            {showDifferences && (
              <div className="mt-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-600/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <h3 className="text-slate-100 font-semibold text-lg">Text Comparison Results</h3>
                  </div>
                  <button 
                    onClick={() => setShowDifferences(false)}
                    className="text-slate-400 hover:text-slate-200 transition-all duration-300 p-2 hover:bg-slate-700/50 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                  {differences.length > 0 ? (
                    differences.map((diff: string, index: number) => (
                      <div 
                        key={index}
                        className="text-sm text-slate-200 bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-4 rounded-xl border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{diff}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 text-sm">No differences found between the texts</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
   
  )
}

export default TextProcessor