import { createServerClient } from '../supabase'
import { FacialAnalysisResponse } from './facialAnalysisService'

export interface SupabaseFacialAnalysis {
  id?: string
  user_id: string
  image_url?: string
  compreface_data: any
  mapped_features: any
  claude_analysis: any
  keywords: string[]
  created_at?: string
  updated_at?: string
}

export class SupabaseFacialAnalysisService {
  private supabase = createServerClient()

  /**
   * Save facial analysis results to Supabase
   */
  async saveFacialAnalysis(
    userId: string,
    analysisResult: FacialAnalysisResponse,
    imageUrl?: string
  ): Promise<SupabaseFacialAnalysis | null> {
    if (!this.supabase) {
      console.warn('Supabase not available, skipping save')
      return null
    }

    try {
      const facialAnalysisData: Omit<SupabaseFacialAnalysis, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        image_url: imageUrl,
        compreface_data: analysisResult.comprefaceData,
        mapped_features: analysisResult.mappedFeatures,
        claude_analysis: analysisResult.claudeAnalysis,
        keywords: analysisResult.mappedFeatures.keywords || []
      }

      const { data, error } = await this.supabase
        .from('facial_analyses')
        .insert([facialAnalysisData])
        .select()
        .single()

      if (error) {
        console.error('Error saving facial analysis:', error)
        return null
      }

      console.log('✅ Facial analysis saved to Supabase:', data.id)
      return data
    } catch (error) {
      console.error('Error saving facial analysis to Supabase:', error)
      return null
    }
  }

  /**
   * Get user's facial analysis history
   */
  async getUserFacialAnalyses(userId: string): Promise<SupabaseFacialAnalysis[]> {
    if (!this.supabase) {
      console.warn('Supabase not available')
      return []
    }

    try {
      const { data, error } = await this.supabase
        .from('facial_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching facial analyses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching facial analyses from Supabase:', error)
      return []
    }
  }

  /**
   * Get facial analysis by ID
   */
  async getFacialAnalysis(id: string): Promise<SupabaseFacialAnalysis | null> {
    if (!this.supabase) {
      console.warn('Supabase not available')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('facial_analyses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching facial analysis:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching facial analysis from Supabase:', error)
      return null
    }
  }

  /**
   * Update facial analysis
   */
  async updateFacialAnalysis(
    id: string,
    updates: Partial<SupabaseFacialAnalysis>
  ): Promise<SupabaseFacialAnalysis | null> {
    if (!this.supabase) {
      console.warn('Supabase not available')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('facial_analyses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating facial analysis:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating facial analysis in Supabase:', error)
      return null
    }
  }

  /**
   * Delete facial analysis
   */
  async deleteFacialAnalysis(id: string): Promise<boolean> {
    if (!this.supabase) {
      console.warn('Supabase not available')
      return false
    }

    try {
      const { error } = await this.supabase
        .from('facial_analyses')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting facial analysis:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting facial analysis from Supabase:', error)
      return false
    }
  }

  /**
   * Search facial analyses by keywords
   */
  async searchFacialAnalyses(keywords: string[]): Promise<SupabaseFacialAnalysis[]> {
    if (!this.supabase) {
      console.warn('Supabase not available')
      return []
    }

    try {
      const { data, error } = await this.supabase
        .from('facial_analyses')
        .select('*')
        .overlaps('keywords', keywords)

      if (error) {
        console.error('Error searching facial analyses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching facial analyses in Supabase:', error)
      return []
    }
  }
}

export const supabaseFacialAnalysisService = new SupabaseFacialAnalysisService()
