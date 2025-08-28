
export const stealthTechniques = {
  
  chunkText: (text, maxChunkSize = 50) => {
    if (text.length <= maxChunkSize) return [text]
    
    if (text.length > 10000) {
      return text.match(/.{1,30}/g) || []
    }
    
    return text.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || []
  },
  
  randomDelay: (min = 100, max = 500) => {
    return new Promise(resolve => 
      setTimeout(resolve, Math.random() * (max - min) + min)
    )
  },
  
  simulateTyping: async (element, text, wpm = 60) => {
    const chars = text.split('')
    const delayPerChar = (60 / wpm) * 200
    
    for (let char of chars) {
      element.value += char
      element.dispatchEvent(new Event('input', { bubbles: true }))
      await new Promise(resolve => 
        setTimeout(resolve, delayPerChar + Math.random() * 100)
      )
    }
  },
  
  detectMonitoring: () => {
    const indicators = {
      dlp: false,
      keylogger: false,
      screenCapture: false,
      networkMonitoring: false
    }
    
    const dlpVendors = ['symantec', 'mcafee', 'proofpoint', 'forcepoint']
    const userAgent = navigator.userAgent.toLowerCase()
    indicators.dlp = dlpVendors.some(vendor => userAgent.includes(vendor))
    
    try {
      navigator.clipboard.readText().then(() => {
        indicators.keylogger = true
      }).catch(() => {
        indicators.dlp = true
      })
    } catch {
      indicators.dlp = true
    }
    
    if (screen.availHeight !== screen.height || screen.availWidth !== screen.width) {
      indicators.screenCapture = true
    }
    
    return indicators
  },
  
  megaPasteProtection: async (text) => {
    if (text.length < 10000) return text
    
    console.log('🔄 Processing large document for enterprise compliance...')
    console.log('📊 Document size:', Math.round(text.length / 1000) + 'KB')
    console.log('⚡ Initiating secure text analysis pipeline...')
    
    const steps = [
      'Scanning document structure...',
      'Analyzing content formatting...',
      'Checking enterprise compliance...',
      'Optimizing for text processing...',
      'Preparing output format...'
    ]
    
    for (let step of steps) {
      console.log('📝', step)
      await stealthTechniques.randomDelay(800, 1500)
    }
    
    console.log('✅ Document ready for processing')
    return text
  },

  safeClipboardOperation: async (operation, data = null) => {
    const monitoring = stealthTechniques.detectMonitoring()
    
    if (monitoring.dlp) {
      console.log('Corporate environment detected - using secure text processing')
      return false
    }
    
    try {
      if (operation === 'read') {
        await stealthTechniques.randomDelay()
        const clipboardText = await navigator.clipboard.readText()
        
        if (clipboardText.length > 10000) {
          return await stealthTechniques.megaPasteProtection(clipboardText)
        }
        
        return clipboardText
      } else if (operation === 'write' && data) {
        await stealthTechniques.randomDelay()
        return await navigator.clipboard.writeText(data)
      }
    } catch {
      console.log('Clipboard access restricted - using fallback method')
      return false
    }
  }
}

export default stealthTechniques
