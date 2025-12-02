// Supabase client configuration for production use
// This file sets up the Supabase client with TypeScript types

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
// Use placeholder values in development/mock mode to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Authentication helpers
export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database query helpers
export const dbHelpers = {
  // Wells
  getWells: async () => {
    const { data, error } = await supabase
      .from('wells')
      .select('*, created_by_user:users!wells_created_by_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getWellById: async (id: string) => {
    const { data, error } = await supabase
      .from('wells')
      .select(`
        *,
        created_by_user:users!wells_created_by_fkey(first_name, last_name),
        well_safety_checklist(*, safety_checklist_templates(*)),
        well_photos(*),
        well_voice_notes(*)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Hazards
  getHazards: async () => {
    const { data, error } = await supabase
      .from('hazards')
      .select('*, reported_by_user:users!hazards_reported_by_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getHazardById: async (id: string) => {
    const { data, error } = await supabase
      .from('hazards')
      .select('*, reported_by_user:users!hazards_reported_by_fkey(first_name, last_name)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  updateHazardStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('hazards')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Tasks
  getTasks: async () => {
    const { data, error } = await supabase
      .from('hse_tasks')
      .select('*, assigned_to_user:users!hse_tasks_assigned_to_fkey(first_name, last_name)')
      .order('due_date', { ascending: true });
    return { data, error };
  },

  updateTaskStatus: async (id: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('hse_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Daily Reports
  getDailyReports: async () => {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*, submitted_by_user:users!daily_reports_submitted_by_fkey(first_name, last_name)')
      .order('report_date', { ascending: false });
    return { data, error };
  },

  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const { data, error } = await supabase
      .from('dashboard_statistics')
      .select('*')
      .single();
    return { data, error };
  }
};

// File upload helpers
export const storageHelpers = {
  uploadWellPhoto: async (wellId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${wellId}/${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('well-photos')
      .upload(fileName, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('well-photos')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  },

  uploadHazardPhoto: async (hazardId: string, file: File, type: 'before' | 'after') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${hazardId}/${type}-${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('hazard-photos')
      .upload(fileName, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('hazard-photos')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  }
};

// Real-time subscription helpers
export const realtimeHelpers = {
  subscribeToWells: (callback: (payload: any) => void) => {
    return supabase
      .channel('wells-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wells' },
        callback
      )
      .subscribe();
  },

  subscribeToHazards: (callback: (payload: any) => void) => {
    return supabase
      .channel('hazards-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hazards' },
        callback
      )
      .subscribe();
  },

  subscribeToTasks: (callback: (payload: any) => void) => {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hse_tasks' },
        callback
      )
      .subscribe();
  }
};
