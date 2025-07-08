import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('See SETUP_GUIDE.md for detailed setup instructions.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface PasteItem {
  id: string
  title?: string
  content: string
  created_at: string
  views: number
}

// Database operations
export const pasteOperations = {
  // Get all pastes
  async getAllPastes() {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please set up your environment variables. See SETUP_GUIDE.md for instructions.')
    }
    
    const { data, error } = await supabase
      .from('pastes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      if (error.message.includes('relation "public.pastes" does not exist')) {
        throw new Error('Database table not found. Please run the SQL migration script from SETUP_GUIDE.md')
      }
      throw error
    }
    return data
  },

  // Create a new paste
  async createPaste(content: string, title?: string) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Please set up your environment variables. See SETUP_GUIDE.md for instructions.')
    }
    
    const insertData: any = { content, views: 0 }
    if (title && title.trim()) {
      insertData.title = title.trim()
    }
    
    const { data, error } = await supabase
      .from('pastes')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      if (error.message.includes('relation "public.pastes" does not exist')) {
        throw new Error('Database table not found. Please run the SQL migration script from SETUP_GUIDE.md')
      }
      throw error
    }
    return data
  },

  // Update paste views
  async incrementViews(id: string) {
    const { data, error } = await supabase
      .rpc('increment_views', { paste_id: id })
    
    if (error) throw error
    return data
  },

  // Delete a paste
  async deletePaste(id: string) {
    const { error } = await supabase
      .from('pastes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('pastes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pastes' }, callback)
      .subscribe()
  }
}