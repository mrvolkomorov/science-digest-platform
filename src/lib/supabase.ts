import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lsjfprflljjzxdcbvqtr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzamZwcmZsbGpqenhkY2J2cXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTk0NDQsImV4cCI6MjA3NzUzNTQ0NH0.5gAfeJBRnrs8Z0fEPuKz4Q4V19PQEpTLE78RvOjyglw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface ResearchPaper {
  id: number
  title: string
  title_ru: string | null
  original_title: string | null
  source: string
  source_url: string | null
  publication_date: string | null
  doi: string | null
  status: 'peer-reviewed' | 'preprint' | null
  authors: string | null
  affiliation: string | null
  tags: string[] | null
  abstract: string | null
  abstract_ru: string | null
  key_findings: string[] | null
  key_findings_ru: string[] | null
  significance: string | null
  significance_ru: string | null
  rating: number | null
  article_potential_ru: string | null
  suggested_headlines: string[] | null
  created_at: string
  digest_id: number | null
}

export interface DailyDigest {
  id: number
  digest_date: string
  total_papers: number
  trends_summary: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
}

export interface DigestWithPapers extends DailyDigest {
  papers: ResearchPaper[]
}
