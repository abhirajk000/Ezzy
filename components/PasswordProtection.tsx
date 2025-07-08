'use client'

import { useState, useEffect, useCallback } from 'react'

interface PasswordProtectionProps {
  children: React.ReactNode
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
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
      {/* Fake Copy-Paste Tool Section */}
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Text Copy & Paste Tool</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Text Area */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Source Text</label>
              <textarea
                 value={sourceText}
                 onChange={handleSourceTextChange}
                 onKeyPress={handleSourceKeyPress}
                 className="w-full h-40 p-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-300 resize-none"
                 placeholder="Paste your text here..."
               />
              <button 
                 onClick={handleCopyText}
                 className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
               >
                 Copy Text
               </button>
            </div>
            
            {/* Destination Text Area */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Destination</label>
              <textarea
                 value={destinationText}
                 onChange={handleDestinationTextChange}
                 className="w-full h-40 p-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-300 resize-none"
                 placeholder="Text will appear here..."
               />
              <button 
                 onClick={handlePasteText}
                 className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
               >
                 Paste Text
               </button>
            </div>
          </div>
          
          {/* Tool Options */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
             <button 
               onClick={handleClearAll}
               className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
             >
               Clear All
             </button>
             <button 
               onClick={handleFormatText}
               className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
             >
               Format Text
             </button>
             <button 
                onClick={handleWordCount}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                Word Count: {wordCount}
              </button>
              <button 
                onClick={handleCompareDifferences}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Compare Differences
              </button>
            </div>
            
            {/* Differences Display */}
            {showDifferences && (
              <div className="mt-6 bg-slate-900/60 border border-slate-600/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-slate-200 font-medium">Text Comparison Results</h3>
                  <button 
                    onClick={() => setShowDifferences(false)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {differences.map((diff, index) => (
                    <div 
                      key={index}
                      className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded border-l-4 border-purple-500"
                    >
                      {diff}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>


    </div>
  )
}