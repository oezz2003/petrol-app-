import {
    AssignedTask,
    ChecklistItem,
    DailyReport,
    Hazard,
    HazardCategory,
    HazardPriority,
    HazardStatus,
    TaskStatus,
    VoluntaryAction,
    Well,
    WellStatus,
} from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '@/lib/api';

// ============= CONTEXT TYPE =============

interface AppContextType {
    // Current User
    currentUser: any | null;
    setCurrentUser: (user: any | null) => void;

    // Wells
    wells: Well[];
    addWell: (well: Well) => Promise<void>;
    updateWell: (id: string, updates: Partial<Well>) => Promise<void>;
    deleteWell: (id: string) => void;
    loadWells: () => Promise<void>;

    // HSE Tasks
    tasks: AssignedTask[];
    updateTask: (id: string, updates: Partial<AssignedTask>) => Promise<void>;
    loadTasks: () => Promise<void>;

    // Hazards
    hazards: Hazard[];
    addHazard: (hazard: Hazard) => Promise<void>;
    updateHazard: (id: string, updates: Partial<Hazard>) => Promise<void>;
    deleteHazard: (id: string) => void;
    loadHazards: () => Promise<void>;

    // Voluntary Actions
    voluntaryActions: VoluntaryAction[];
    updateVoluntaryAction: (id: string, updates: Partial<VoluntaryAction>) => Promise<void>;
    loadVoluntaryActions: () => Promise<void>;

    // Daily Reports
    dailyReports: DailyReport[];
    addDailyReport: (report: DailyReport) => Promise<void>;

    // Loading states
    loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============= MOCK DATA =============

const mockChecklistItems: ChecklistItem[] = [
    { id: '1', label: 'Rig inspection completed', checked: false, required: true },
    { id: '2', label: 'PPE checked', checked: false, required: true },
    { id: '3', label: 'Tools inspected', checked: false, required: true },
    { id: '4', label: 'Safety briefing conducted', checked: false, required: true },
    { id: '5', label: 'Emergency equipment verified', checked: false, required: false },
];

const mockWells: Well[] = [
    {
        id: '1',
        status: WellStatus.IN_PROGRESS,
        basicData: {
            wellName: 'Well Alpha-7',
            location: 'Site A, Block 12',
            rigNameId: 'RIG-001',
            startDate: new Date('2025-11-28'),
            notes: 'Initial drilling phase',
        },
        checklist: mockChecklistItems.map((item) => ({ ...item, checked: item.id === '1' || item.id === '2' })),
        photos: [],
        voiceNotes: [],
        createdAt: new Date('2025-11-28T08:00:00'),
        updatedAt: new Date('2025-11-30T14:30:00'),
    },
    {
        id: '2',
        status: WellStatus.COMPLETED,
        basicData: {
            wellName: 'Well Beta-3',
            location: 'Site B, Block 5',
            rigNameId: 'RIG-002',
            startDate: new Date('2025-11-20'),
            notes: 'Completed successfully',
        },
        checklist: mockChecklistItems.map((item) => ({ ...item, checked: true })),
        photos: [
            { id: 'p1', uri: 'https://via.placeholder.com/300', timestamp: new Date() },
            { id: 'p2', uri: 'https://via.placeholder.com/300', timestamp: new Date() },
        ],
        voiceNotes: [
            { id: 'v1', duration: 45, timestamp: new Date() },
        ],
        createdAt: new Date('2025-11-20T09:00:00'),
        updatedAt: new Date('2025-11-27T16:00:00'),
        completedAt: new Date('2025-11-27T16:00:00'),
    },
];

const mockTasks: AssignedTask[] = [
    {
        id: 't1',
        title: 'Weekly Safety Inspection',
        description: 'Complete comprehensive safety inspection of all rig equipment and work areas.',
        dueDate: new Date('2025-12-02'),
        status: TaskStatus.PENDING,
        createdAt: new Date('2025-11-25'),
        updatedAt: new Date('2025-11-25'),
    },
    {
        id: 't2',
        title: 'Environmental Compliance Report',
        description: 'Submit monthly environmental compliance documentation.',
        dueDate: new Date('2025-11-29'),
        status: TaskStatus.OVERDUE,
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2025-11-25'),
    },
    {
        id: 't3',
        title: 'PPE Inventory Check',
        description: 'Verify all personal protective equipment is in good condition and properly stocked.',
        dueDate: new Date('2025-12-05'),
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2025-11-28'),
        updatedAt: new Date('2025-11-30'),
    },
];

const mockHazards: Hazard[] = [
    {
        id: 'h1',
        subject: 'Oil spill near drill site',
        description: 'Small oil leak detected near the main drilling platform. Requires immediate cleanup.',
        location: 'Site A, Platform 2',
        category: HazardCategory.ENVIRONMENTAL,
        priority: HazardPriority.HIGH,
        status: HazardStatus.IN_PROGRESS,
        beforePhoto: 'https://via.placeholder.com/400x300/ff0000/ffffff?text=Oil+Spill',
        notes: 'Cleanup crew assigned',
        createdAt: new Date('2025-11-29'),
        updatedAt: new Date('2025-11-30'),
    },
    {
        id: 'h2',
        subject: 'Damaged safety harness',
        description: 'Worker reported frayed safety harness during equipment check.',
        location: 'Equipment Storage B',
        category: HazardCategory.PPE,
        priority: HazardPriority.MEDIUM,
        status: HazardStatus.CLOSED,
        beforePhoto: 'https://via.placeholder.com/400x300/ff9900/ffffff?text=Damaged+Harness',
        afterPhoto: 'https://via.placeholder.com/400x300/00ff00/ffffff?text=Replaced',
        notes: 'Harness replaced with new equipment',
        createdAt: new Date('2025-11-27'),
        updatedAt: new Date('2025-11-28'),
    },
    {
        id: 'h3',
        subject: 'Cluttered walkway',
        description: 'Tools and equipment left in main walkway creating trip hazard.',
        location: 'Main Deck, East Side',
        category: HazardCategory.HOUSEKEEPING,
        priority: HazardPriority.LOW,
        status: HazardStatus.OPEN,
        beforePhoto: 'https://via.placeholder.com/400x300/ffff00/000000?text=Cluttered+Area',
        createdAt: new Date('2025-11-30'),
        updatedAt: new Date('2025-11-30'),
    },
];

const mockVoluntaryActions: VoluntaryAction[] = [
    {
        id: 'va1',
        title: 'Housekeeping Check',
        description: 'Perform voluntary housekeeping inspection of work area.',
        completed: false,
    },
    {
        id: 'va2',
        title: 'PPE Audit',
        description: 'Audit personal protective equipment compliance.',
        completed: false,
    },
    {
        id: 'va3',
        title: 'Fire Extinguisher Inspection',
        description: 'Check fire extinguisher pressure and accessibility.',
        completed: true,
    },
];

// ============= PROVIDER COMPONENT =============

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [wells, setWells] = useState<Well[]>([]);
    const [tasks, setTasks] = useState<AssignedTask[]>([]);
    const [hazards, setHazards] = useState<Hazard[]>([]);
    const [voluntaryActions, setVoluntaryActions] = useState<VoluntaryAction[]>([]);
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(false);

    // Load data when user changes
    useEffect(() => {
        if (currentUser) {
            loadWells();
            loadTasks();
            loadHazards();
            loadVoluntaryActions();
        } else {
            // Clear data when user logs out
            setWells([]);
            setTasks([]);
            setHazards([]);
            setVoluntaryActions([]);
            setDailyReports([]);
        }
    }, [currentUser]);

    // Wells operations
    const loadWells = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // For now, load all wells - you can filter by user if needed
            const { data, error } = await api.wells.getWells();
            if (!error && data) {
                // Transform data to match Well type - this is a simplified version
                // You'll need to map the database fields to your Well type properly
                setWells(data as any);
            }
        } catch (error) {
            console.error('Error loading wells:', error);
        } finally {
            setLoading(false);
        }
    };

    const addWell = async (well: Well) => {
        // Optimistic update
        setWells((prev) => [...prev, well]);

        // Note: This is a simplified version
        // You'll need to properly map Well type to database format
        // For full implementation, see the new-well.tsx update
    };

    const updateWell = async (id: string, updates: Partial<Well>) => {
        // Optimistic update
        setWells((prev) =>
            prev.map((well) =>
                well.id === id ? { ...well, ...updates, updatedAt: new Date() } : well
            )
        );
    };

    const deleteWell = (id: string) => {
        setWells((prev) => prev.filter((well) => well.id !== id));
    };

    // Tasks operations
    const loadTasks = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await api.tasks.getMyTasks(currentUser.id);
            if (!error && data) {
                // Transform to AssignedTask format
                setTasks(data as any);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (id: string, updates: Partial<AssignedTask>) => {
        // Optimistic update
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
            )
        );

        // API call
        try {
            await api.tasks.updateTaskStatus(id, updates.status as any);
        } catch (error) {
            console.error('Error updating task:', error);
            // Reload on error
            loadTasks();
        }
    };

    // Hazards operations
    const loadHazards = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await api.hazards.getMyHazards(currentUser.id);
            if (!error && data) {
                setHazards(data as any);
            }
        } catch (error) {
            console.error('Error loading hazards:', error);
        } finally {
            setLoading(false);
        }
    };

    const addHazard = async (hazard: Hazard) => {
        // Optimistic update
        setHazards((prev) => [...prev, hazard]);

        // Note: Full implementation in new-hazard.tsx
    };

    const updateHazard = async (id: string, updates: Partial<Hazard>) => {
        // Optimistic update
        setHazards((prev) =>
            prev.map((hazard) =>
                hazard.id === id ? { ...hazard, ...updates, updatedAt: new Date() } : hazard
            )
        );

        // API call if status update
        if (updates.status) {
            try {
                await api.hazards.updateHazardStatus(id, updates.status);
            } catch (error) {
                console.error('Error updating hazard:', error);
                loadHazards();
            }
        }
    };

    const deleteHazard = (id: string) => {
        setHazards((prev) => prev.filter((hazard) => hazard.id !== id));
    };

    // Voluntary Actions operations
    const loadVoluntaryActions = async () => {
        if (!currentUser) return;
        try {
            const { data: templates, error: templatesError } = await api.voluntaryActions.getTemplates();
            const { data: userActions, error: actionsError } = await api.voluntaryActions.getUserActions(currentUser.id);

            if (!templatesError && templates) {
                // Merge templates with user completions
                const merged = templates.map((template: any) => {
                    const userAction = userActions?.find((ua: any) => ua.template_id === template.id);
                    return {
                        id: template.id,
                        title: template.title,
                        description: template.description,
                        completed: userAction?.is_completed || false,
                    };
                });
                setVoluntaryActions(merged);
            }
        } catch (error) {
            console.error('Error loading voluntary actions:', error);
        }
    };

    const updateVoluntaryAction = async (id: string, updates: Partial<VoluntaryAction>) => {
        // Optimistic update
        setVoluntaryActions((prev) =>
            prev.map((action) => (action.id === id ? { ...action, ...updates } : action))
        );

        // API call
        if (currentUser && updates.completed !== undefined) {
            try {
                await api.voluntaryActions.toggleAction(id, currentUser.id, updates.completed);
            } catch (error) {
                console.error('Error updating voluntary action:', error);
                loadVoluntaryActions();
            }
        }
    };

    // Daily Reports operations
    const addDailyReport = async (report: DailyReport) => {
        setDailyReports((prev) => [...prev, report]);

        // Note: Full implementation in daily-report-modal.tsx
    };

    const value: AppContextType = {
        currentUser,
        setCurrentUser,
        wells,
        addWell,
        updateWell,
        deleteWell,
        loadWells,
        tasks,
        updateTask,
        loadTasks,
        hazards,
        addHazard,
        updateHazard,
        deleteHazard,
        loadHazards,
        voluntaryActions,
        updateVoluntaryAction,
        loadVoluntaryActions,
        dailyReports,
        addDailyReport,
        loading,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============= HOOK =============

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
