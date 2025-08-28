'use client'

import { useState, useEffect } from 'react'
import { pasteOperations, PasteItem } from '../lib/supabase'
import { Copy, Plus, Trash2, FileText, Clock, Hash } from 'lucide-react'
import TextProcessor from '../components/text-processor-utils'

export default function Home() {
  const [pastes, setPastes] = useState<PasteItem[]>([])
  const [newPaste, setNewPaste] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    loadPastes()
    
    const subscription = pasteOperations.subscribeToChanges((payload) => {
      console.log('Real-time update:', payload)
      loadPastes()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mounted])

  const loadPastes = async () => {
    try {
      setError(null)
      const data = await pasteOperations.getAllPastes()
      setPastes(data || [])
    } catch (err) {
      console.error('Error loading pastes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pastes. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const createPaste = async () => {
    if (!newPaste.trim()) return
    
    setIsCreating(true)
    try {
      await pasteOperations.createPaste(newPaste.trim())
      setNewPaste('')
      await loadPastes()
    } catch (err) {
      console.error('Error creating paste:', err)
      setError(err instanceof Error ? err.message : 'Failed to create paste')
    } finally {
      setIsCreating(false)
    }
  }


  const deletePaste = async (id: string) => {
    try {
      await pasteOperations.deletePaste(id)
      setPastes(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting paste:', err)
    }
  }

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }



  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (!mounted) {
    return (
      <TextProcessor>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-3 text-slate-300 font-medium">Loading...</p>
            </div>
          </div>
        </div>
              </TextProcessor>
    )
  }

  return (
    <TextProcessor>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
          
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 font-orbitron">
            Text Tools Pro
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Organize and manage your text.
          </p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/30 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-orbitron">Create</h2>
          </div>
          <div className="space-y-4">

            <div className="relative">
              <textarea
                value={newPaste}
                onChange={(e) => setNewPaste(e.target.value)}
                placeholder="Enter your text content here..."
                className="w-full h-40 p-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-300 leading-relaxed font-mono backdrop-blur-sm shadow-inner"
                disabled={isCreating}
                style={{ textAlign: 'left', verticalAlign: 'top' }}
              />
              <div className="absolute bottom-4 right-4 text-slate-400 text-sm font-medium bg-slate-800/80 px-3 py-1 rounded-lg">
                {newPaste.length} chars
              </div>
            </div>
            <button
              onClick={createPaste}
              disabled={!newPaste.trim() || isCreating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-300 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-orbitron">
                  Lists
                </h2>
                <p className="text-slate-400 text-sm">
                  {pastes.length} items
                </p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3"></div>
              <p className="text-slate-300 font-medium">Loading content...</p>
            </div>
          ) : pastes.length === 0 ? (
            <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/30">
              <div className="p-4 bg-slate-700/50 rounded-xl inline-block mb-4">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              </div>
              <p className="text-slate-300 font-medium mb-2">No documents yet</p>
              <p className="text-slate-400 text-sm">Create your first document above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastes.map((paste) => {
                const isExpanded = expandedItems.has(paste.id)
                const toggleExpanded = () => {
                  const newExpanded = new Set(expandedItems)
                  if (isExpanded) {
                    newExpanded.delete(paste.id)
                  } else {
                    newExpanded.add(paste.id)
                  }
                  setExpandedItems(newExpanded)
                }
                
                return (
                  <div 
                    key={paste.id} 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 shadow-lg hover:bg-slate-800/70 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md shadow-lg">
                          <Hash className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-slate-300 font-medium text-xs">
                            {paste.title ? paste.title : `Item #${paste.id.slice(-6)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{paste.content.length} chars</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span suppressHydrationWarning>{mounted ? getTimeAgo(paste.created_at) : 'Loading...'}</span>
                          </div>
                        </div>
                        <button
                          onClick={toggleExpanded}
                          className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-1 px-2 rounded-md text-xs font-medium transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>{isExpanded ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {!isExpanded && (
                      <div className="mb-3">
                        <div 
                          className="bg-slate-900/50 border border-slate-600/30 rounded-md p-3 cursor-pointer hover:bg-slate-900/70 transition-all duration-200"
                          onDoubleClick={toggleExpanded}
                          title="Double-click to expand"
                        >
                          <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed line-clamp-2">
                            {paste.content}
                          </pre>
                          {(paste.content.split('\n').length > 2 || paste.content.length > 100) && (
                            <span className="text-slate-500 text-xs">...</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isExpanded && (
                      <div 
                        className="bg-slate-900/60 rounded-lg p-3 mb-4 border border-slate-700/30 cursor-pointer hover:bg-slate-900/80 transition-all duration-200"
                        onDoubleClick={toggleExpanded}
                        title="Double-click to collapse"
                      >
                        <pre className="whitespace-pre-wrap text-xs text-slate-200 font-mono leading-relaxed text-left break-words">
                          {paste.content}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(paste.content, paste.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          copiedId === paste.id 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30'
                        }`}
                      >
                        {copiedId === paste.id ? (
                          <>
                            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                              <span className="text-emerald-500 text-xs">✓</span>
                            </div>
                            <span>Done!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Get</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deletePaste(paste.id)}
                        className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </TextProcessor>
  )
}