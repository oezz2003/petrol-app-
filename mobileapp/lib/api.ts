// API service layer for mobile app
// This file contains all the functions to interact with the Supabase backend
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

// =====================================================
// AUTHENTICATION
// =====================================================

export const auth = {
    /**
     * Sign in with email and password
     */
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    /**
     * Sign out the current user
     */
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    /**
     * Get the current authenticated user
     */
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        // Fetch full user details from users table
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return userData;
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};

// =====================================================
// WELLS
// =====================================================

export const wells = {
    /**
     * Create a new well record
     */
    createWell: async (wellData: {
        name: string;
        location: string;
        rig_name?: string;
        notes?: string;
        status: 'draft' | 'in_progress' | 'completed';
        created_by: string;
    }) => {
        const { data, error } = await supabase
            .from('wells')
            .insert([wellData])
            .select()
            .single();
        return { data, error };
    },

    /**
     * Get all wells
     */
    getWells: async () => {
        const { data, error } = await supabase
            .from('wells')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    /**
     * Get wells for current user
     */
    getMyWells: async (userId: string) => {
        const { data, error } = await supabase
            .from('wells')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    /**
     * Update well status
     */
    updateWellStatus: async (wellId: string, status: string) => {
        const updates: any = { status, updated_at: new Date().toISOString() };

        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('wells')
            .update(updates)
            .eq('id', wellId)
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// SAFETY CHECKLISTS
// =====================================================

export const safetyChecklists = {
    /**
     * Get safety checklist templates
     */
    getTemplates: async () => {
        const { data, error } = await supabase
            .from('safety_checklist_templates')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        return { data, error };
    },

    /**
     * Create checklist entries for a well
     */
    createChecklistEntries: async (entries: Array<{
        well_id: string;
        checklist_item_id: string;
        is_checked: boolean;
        checked_by: string;
        notes?: string;
    }>) => {
        const { data, error } = await supabase
            .from('well_safety_checklist')
            .insert(entries)
            .select();
        return { data, error };
    },
};

// =====================================================
// WELL PHOTOS
// =====================================================

export const wellPhotos = {
    /**
     * Upload a photo to storage
     */
    uploadPhoto: async (wellId: string, fileUri: string, fileName: string) => {
        try {
            // For React Native, we need to handle file upload differently
            // This is a placeholder - actual implementation depends on your setup
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const fileExt = fileName.split('.').pop();
            const filePath = `${wellId}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('well-photos')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('well-photos')
                .getPublicUrl(filePath);

            return { data: publicUrl, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Save photo record to database
     */
    savePhotoRecord: async (photoData: {
        well_id: string;
        photo_url: string;
        caption?: string;
        file_size_bytes?: number;
        uploaded_by: string;
    }) => {
        const { data, error } = await supabase
            .from('well_photos')
            .insert([photoData])
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// WELL VOICE NOTES
// =====================================================

export const wellVoiceNotes = {
    /**
     * Upload a voice note to storage
     */
    uploadVoiceNote: async (wellId: string, fileUri: string, fileName: string) => {
        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const filePath = `${wellId}/${Date.now()}_${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('well-voice-notes')
                .upload(filePath, blob, {
                    contentType: 'audio/m4a',
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('well-voice-notes')
                .getPublicUrl(filePath);

            return { data: publicUrl, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Save voice note record to database
     */
    saveVoiceNoteRecord: async (noteData: {
        well_id: string;
        audio_url: string;
        duration_seconds: number;
        file_size_bytes?: number;
        recorded_by: string;
    }) => {
        const { data, error } = await supabase
            .from('well_voice_notes')
            .insert([noteData])
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// HAZARDS
// =====================================================

export const hazards = {
    /**
     * Create a new hazard report
     */
    createHazard: async (hazardData: {
        subject: string;
        description: string;
        location: string;
        category: 'housekeeping' | 'ppe' | 'equipment' | 'environmental' | 'other';
        priority: 'low' | 'medium' | 'high';
        status: 'open' | 'in_progress' | 'closed';
        before_photo_url?: string;
        after_photo_url?: string;
        reported_by: string;
    }) => {
        const { data, error } = await supabase
            .from('hazards')
            .insert([hazardData])
            .select()
            .single();
        return { data, error };
    },

    /**
     * Get all hazards for current user
     */
    getMyHazards: async (userId: string) => {
        const { data, error } = await supabase
            .from('hazards')
            .select('*')
            .eq('reported_by', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    /**
     * Get hazard by ID
     */
    getHazardById: async (id: string) => {
        const { data, error } = await supabase
            .from('hazards')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    /**
     * Update hazard status
     */
    updateHazardStatus: async (id: string, status: 'open' | 'in_progress' | 'closed') => {
        const updates: any = { status, updated_at: new Date().toISOString() };

        if (status === 'closed') {
            updates.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('hazards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    /**
     * Upload hazard photo
     */
    uploadHazardPhoto: async (hazardId: string, fileUri: string, type: 'before' | 'after') => {
        try {
            console.log('[Upload] Starting upload for:', type, fileUri);

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            console.log('[Upload] File exists, size:', fileInfo.size);

            // Extract file extension, handle both with and without query params
            const uriWithoutParams = fileUri.split('?')[0];
            let fileExt = uriWithoutParams.split('.').pop()?.toLowerCase() || 'jpg';

            // Ensure we have a valid image extension
            const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (!validExts.includes(fileExt)) {
                fileExt = 'jpg';
            }

            const filePath = `${hazardId}/${type}_${Date.now()}.${fileExt}`;
            console.log('[Upload] Uploading to path:', filePath);

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: 'base64',
            });

            // Convert base64 to ArrayBuffer (supported in React Native)
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            console.log('[Upload] ArrayBuffer created, size:', bytes.length);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('hazard-photos')
                .upload(filePath, bytes.buffer, {
                    contentType: `image/${fileExt}`,
                    upsert: false,
                });

            if (uploadError) {
                console.error('[Upload] Upload error:', uploadError);
                throw uploadError;
            }

            console.log('[Upload] Upload successful:', uploadData);

            const { data: { publicUrl } } = supabase.storage
                .from('hazard-photos')
                .getPublicUrl(filePath);

            console.log('[Upload] Public URL:', publicUrl);
            return { data: publicUrl, error: null };
        } catch (error) {
            console.error('[Upload] Exception:', error);
            return { data: null, error };
        }
    },

    /**
     * Update hazard photo URLs
     */
    updateHazardPhotos: async (hazardId: string, beforePhotoUrl?: string, afterPhotoUrl?: string) => {
        const updates: any = { updated_at: new Date().toISOString() };

        if (beforePhotoUrl !== undefined) {
            updates.before_photo_url = beforePhotoUrl;
        }
        if (afterPhotoUrl !== undefined) {
            updates.after_photo_url = afterPhotoUrl;
        }

        const { data, error } = await supabase
            .from('hazards')
            .update(updates)
            .eq('id', hazardId)
            .select()
            .single();
        return { data, error };
    },
};

// =====================================================
// HSE TASKS
// =====================================================

export const tasks = {
    /**
     * Get tasks assigned to current user
     */
    getMyTasks: async (userId: string) => {
        const { data, error } = await supabase
            .from('hse_tasks')
            .select('*')
            .eq('assigned_to', userId)
            .order('due_date', { ascending: true });
        return { data, error };
    },

    /**
     * Get task by ID
     */
    getTaskById: async (id: string) => {
        const { data, error } = await supabase
            .from('hse_tasks')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    /**
     * Update task status
     */
    updateTaskStatus: async (id: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue') => {
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
};

// =====================================================
// DAILY REPORTS
// =====================================================

export const dailyReports = {
    /**
     * Create a new daily report
     */
    createReport: async (reportData: {
        report_date: string;
        well_location: string;
        operations_summary: string;
        safety_status: 'safe' | 'issues';
        issues_description?: string;
        submitted_by: string;
    }) => {
        const { data, error } = await supabase
            .from('daily_reports')
            .insert([reportData])
            .select()
            .single();
        return { data, error };
    },

    /**
     * Get daily reports for current user
     */
    getMyReports: async (userId: string) => {
        const { data, error } = await supabase
            .from('daily_reports')
            .select('*')
            .eq('submitted_by', userId)
            .order('report_date', { ascending: false });
        return { data, error };
    },
};

// =====================================================
// VOLUNTARY ACTIONS
// =====================================================

export const voluntaryActions = {
    /**
     * Get voluntary action templates
     */
    getTemplates: async () => {
        const { data, error } = await supabase
            .from('voluntary_action_templates')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
        return { data, error };
    },

    /**
     * Get user's voluntary actions
     */
    getUserActions: async (userId: string) => {
        const { data, error } = await supabase
            .from('voluntary_actions')
            .select('*, template:voluntary_action_templates(*)')
            .eq('user_id', userId);
        return { data, error };
    },

    /**
     * Toggle voluntary action completion
     */
    toggleAction: async (templateId: string, userId: string, isCompleted: boolean) => {
        // First, check if record exists
        const { data: existing } = await supabase
            .from('voluntary_actions')
            .select('*')
            .eq('template_id', templateId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Update existing
            const updates: any = {
                is_completed: isCompleted,
                updated_at: new Date().toISOString()
            };

            if (isCompleted) {
                updates.completed_at = new Date().toISOString();
            } else {
                updates.completed_at = null;
            }

            const { data, error } = await supabase
                .from('voluntary_actions')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single();
            return { data, error };
        } else {
            // Create new
            const { data, error } = await supabase
                .from('voluntary_actions')
                .insert([{
                    template_id: templateId,
                    user_id: userId,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                }])
                .select()
                .single();
            return { data, error };
        }
    },
};
