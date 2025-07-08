'use client'

import { useState, useEffect, useCallback } from 'react'

interface PasswordProtectionProps {
  children: React.ReactNode
}

function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  // Fake copy-paste tool states
  const [sourceText, setSourceText] = useState('')
  const [destinationText, setDestinationText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [showDifferences, setShowDifferences] = useState(false)
  const [differences, setDifferences] = useState<string[]>([])

  // Auto-logout functionality
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem('ezzy-authenticated')
    setLastActivity(Date.now())
  }, [])

  // Fake copy-paste tool functions
  const handleCopyText = () => {
    setDestinationText(sourceText)
    navigator.clipboard.writeText(sourceText)
  }

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setDestinationText(text)
    } catch {
      // Fallback if clipboard access is denied
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
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
    setDestinationText(formatted)
  }

  const handleWordCount = () => {
    // Check if source text contains the correct password
    const correctPassword = '123#' // Change this to your desired password
    
    if (sourceText.trim() === correctPassword) {
      // Authenticate user
      setIsAuthenticated(true)
      const now = Date.now()
      setLastActivity(now)
      localStorage.setItem('ezzy-authenticated', 'true')
      localStorage.setItem('ezzy-last-activity', now.toString())
      // Clear the source text to hide the password
      setSourceText('')
      return
    }
    
    // Normal word count functionality - count words from sourceText
    const words = sourceText.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
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

  // Real-time word count update
  useEffect(() => {
    const words = sourceText.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(sourceText.trim() === '' ? 0 : words.length)
  }, [sourceText])

  const handleSourceKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const correctPassword = '123#' // Change this to your desired password
      
      if (sourceText.trim() === correctPassword) {
        // Authenticate user
        setIsAuthenticated(true)
        const now = Date.now()
        setLastActivity(now)
        localStorage.setItem('ezzy-authenticated', 'true')
        localStorage.setItem('ezzy-last-activity', now.toString())
        // Clear the source text to hide the password
        setSourceText('')
      }
    }
  }

  const handleDestinationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDestinationText(e.target.value)
  }

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('ezzy-authenticated')
    const lastActivityTime = localStorage.getItem('ezzy-last-activity')
    
    if (authStatus === 'true' && lastActivityTime) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime)
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
      
      if (timeSinceLastActivity < thirtyMinutes) {
         setIsAuthenticated(true)
         setLastActivity(parseInt(lastActivityTime))
       } else {
        // Session expired
        localStorage.removeItem('ezzy-authenticated')
        localStorage.removeItem('ezzy-last-activity')
      }
    }
  }, [])

  // Activity tracking
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [isAuthenticated, handleActivity])

  // Timer countdown and auto-logout
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
      
      if (timeSinceLastActivity >= thirtyMinutes) {
        handleLogout()
        return
      }
      
      // Update localStorage with current activity time
      localStorage.setItem('ezzy-last-activity', lastActivity.toString())
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, lastActivity, handleLogout])

  if (isAuthenticated) {
    return (
      <div>
        {/* Logout button */}
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
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 font-orbitron">
            Ezzy
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Organize and manage your text.
          </p>
        </div>

        {/* Enhanced Copy-Paste Tool Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-600/40 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500">
          
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Source Text Area */}
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
            
            {/* Destination Text Area */}
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
          
          {/* Enhanced Tool Options */}
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
                 className="bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 text-white px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 border border-blue-500/30"
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
            
            {/* Enhanced Differences Display */}
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
                    differences.map((diff, index) => (
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

export default PasswordProtection