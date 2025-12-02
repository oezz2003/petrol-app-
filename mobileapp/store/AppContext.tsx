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

// ============= CONTEXT TYPE =============

interface AppContextType {
    // Wells
    wells: Well[];
    addWell: (well: Well) => void;
    updateWell: (id: string, updates: Partial<Well>) => void;
    deleteWell: (id: string) => void;

    // HSE Tasks
    tasks: AssignedTask[];
    updateTask: (id: string, updates: Partial<AssignedTask>) => void;

    // Hazards
    hazards: Hazard[];
    addHazard: (hazard: Hazard) => void;
    updateHazard: (id: string, updates: Partial<Hazard>) => void;
    deleteHazard: (id: string) => void;

    // Voluntary Actions
    voluntaryActions: VoluntaryAction[];
    updateVoluntaryAction: (id: string, updates: Partial<VoluntaryAction>) => void;

    // Daily Reports
    dailyReports: DailyReport[];
    addDailyReport: (report: DailyReport) => void;
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
    const [wells, setWells] = useState<Well[]>(mockWells);
    const [tasks, setTasks] = useState<AssignedTask[]>(mockTasks);
    const [hazards, setHazards] = useState<Hazard[]>(mockHazards);
    const [voluntaryActions, setVoluntaryActions] = useState<VoluntaryAction[]>(mockVoluntaryActions);
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

    // Update overdue tasks based on current time
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setTasks((prevTasks) =>
                prevTasks.map((task) => {
                    if (task.status !== TaskStatus.COMPLETED && task.dueDate < now) {
                        return { ...task, status: TaskStatus.OVERDUE };
                    }
                    return task;
                })
            );
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    // Wells operations
    const addWell = (well: Well) => {
        setWells((prev) => [...prev, well]);
    };

    const updateWell = (id: string, updates: Partial<Well>) => {
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
    const updateTask = (id: string, updates: Partial<AssignedTask>) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
            )
        );
    };

    // Hazards operations
    const addHazard = (hazard: Hazard) => {
        setHazards((prev) => [...prev, hazard]);
    };

    const updateHazard = (id: string, updates: Partial<Hazard>) => {
        setHazards((prev) =>
            prev.map((hazard) =>
                hazard.id === id ? { ...hazard, ...updates, updatedAt: new Date() } : hazard
            )
        );
    };

    const deleteHazard = (id: string) => {
        setHazards((prev) => prev.filter((hazard) => hazard.id !== id));
    };

    // Voluntary Actions operations
    const updateVoluntaryAction = (id: string, updates: Partial<VoluntaryAction>) => {
        setVoluntaryActions((prev) =>
            prev.map((action) => (action.id === id ? { ...action, ...updates } : action))
        );
    };

    // Daily Reports operations
    const addDailyReport = (report: DailyReport) => {
        setDailyReports((prev) => [...prev, report]);
    };

    const value: AppContextType = {
        wells,
        addWell,
        updateWell,
        deleteWell,
        tasks,
        updateTask,
        hazards,
        addHazard,
        updateHazard,
        deleteHazard,
        voluntaryActions,
        updateVoluntaryAction,
        dailyReports,
        addDailyReport,
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
