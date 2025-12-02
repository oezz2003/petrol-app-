// Core type definitions for the drilling operations & HSE app

// ============= ENUMS & STATUS TYPES =============

export enum WellStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    DRAFT = 'draft',
}

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue',
}

export enum HazardStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed',
}

export enum HazardCategory {
    HOUSEKEEPING = 'housekeeping',
    PPE = 'ppe',
    EQUIPMENT = 'equipment',
    ENVIRONMENTAL = 'environmental',
    OTHER = 'other',
}

export enum HazardPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum SafetyStatus {
    SAFE = 'safe',
    ISSUES = 'issues',
}

// ============= OPERATIONS MODULE TYPES =============

export interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
    required: boolean;
}

export interface PhotoItem {
    id: string;
    uri: string;
    timestamp: Date;
}

export interface VoiceNoteItem {
    id: string;
    duration: number; // in seconds
    timestamp: Date;
}

export interface WellBasicData {
    wellName: string;
    location: string;
    rigNameId: string;
    startDate: Date;
    notes?: string;
}

export interface Well {
    id: string;
    status: WellStatus;
    basicData: WellBasicData;
    checklist: ChecklistItem[];
    photos: PhotoItem[];
    voiceNotes: VoiceNoteItem[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

// ============= HSE MODULE TYPES =============

export interface AssignedTask {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Hazard {
    id: string;
    subject: string;
    description: string;
    location: string;
    category: HazardCategory;
    priority: HazardPriority;
    status: HazardStatus;
    beforePhoto?: string;
    afterPhoto?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface VoluntaryAction {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    checklist?: ChecklistItem[];
}

// ============= DAILY REPORT TYPES =============

export interface DailyReport {
    id: string;
    wellLocation: string;
    operationsSummary: string;
    safetyStatus: SafetyStatus;
    issuesDescription?: string;
    timestamp: Date;
}

// ============= NEW WELL WIZARD STATE =============

export interface NewWellFormData {
    currentStep: number;
    basicData: WellBasicData;
    checklist: ChecklistItem[];
    photos: PhotoItem[];
    voiceNotes: VoiceNoteItem[];
}
