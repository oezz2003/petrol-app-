'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import {
    Activity,
    MapPin,
    MoreHorizontal,
    PlayCircle,
    CheckCircle,
    AlertTriangle,
    Clock
} from 'lucide-react';

type Project = {
    id: string;
    country: string;
    name: string;
};

type Unit = {
    id: string;
    project_id: string;
    unit_type: string;
    unit_number: string;
};

type Well = {
    id: string;
    name: string;
    status: string;
    unit_id: string;
    well_type: string;
    well_shape: string;
};

type RigStatus = {
    unit: Unit;
    project: Project;
    activeWell?: Well;
    currentSection?: any;
};

export default function OperationsPage() {
    const [rigStatuses, setRigStatuses] = useState<RigStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadOperationsData();
    }, []);

    const loadOperationsData = async () => {
        setLoading(true);
        try {
            // Fetch hierarchy
            const { data: projects } = await db.getProjects();
            const { data: units } = await db.getUnits();
            const { data: wells } = await db.getWells();

            if (!projects || !units || !wells) return;

            // Map units to their status
            const statuses = await Promise.all(units.map(async (unit: any) => {
                const project = projects.find((p: any) => p.id === unit.project_id);
                const activeWell = wells.find((w: any) => w.unit_id === unit.id && w.status === 'in_progress');

                let currentSection = null;
                if (activeWell) {
                    const { data: sections } = await db.getWellSections(activeWell.id);
                    if (sections && sections.length > 0) {
                        // Find the latest section or the one in progress
                        currentSection = sections.find((s: any) => s.status === 'drilling') || sections[sections.length - 1];
                    }
                }

                return {
                    unit,
                    project,
                    activeWell,
                    currentSection
                };
            }));

            setRigStatuses(statuses);
        } catch (error) {
            console.error('Error loading operations data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drilling Operations</h1>
                    <p className="text-gray-600">Real-time status of all active units</p>
                </div>
                <div className="flex space-x-2">
                    <a href="/dashboard/operations/checklists" className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        View Checklists
                    </a>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        + New Operation
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['all', 'Oman', 'Saudi', 'Mexico', 'UAE'].map((region) => (
                    <button
                        key={region}
                        onClick={() => setFilter(region)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${filter === region
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        {region === 'all' ? 'All Regions' : region}
                    </button>
                ))}
            </div>

            {/* Rig Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rigStatuses
                    .filter(status => filter === 'all' || status.project?.country === filter)
                    .map((status) => (
                        <div key={status.unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-bold text-lg text-gray-900">{status.unit.unit_number}</h3>
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                                {status.unit.unit_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {status.project?.country} - {status.project?.name}
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${status.activeWell ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4">
                                {status.activeWell ? (
                                    <>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Current Well</div>
                                            <div className="font-medium text-blue-600 flex items-center">
                                                {status.activeWell.name}
                                                <span className="ml-2 text-xs text-gray-400">({status.activeWell.well_type})</span>
                                            </div>
                                        </div>

                                        {status.currentSection ? (
                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-blue-800">Current Phase</span>
                                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                        {status.currentSection.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {status.currentSection.section_name}
                                                </div>
                                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Started: {new Date(status.currentSection.started_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-yellow-800 text-sm">
                                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                                No active section
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500">Depth</div>
                                                <div className="font-bold text-gray-900">
                                                    {status.currentSection?.target_depth ? `${status.currentSection.target_depth}m` : '-'}
                                                </div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <div className="text-xs text-gray-500">Shape</div>
                                                <div className="font-bold text-gray-900">{status.activeWell.well_shape}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                        <PlayCircle className="w-10 h-10 mb-2 opacity-50" />
                                        <p className="text-sm">No active operation</p>
                                        <button className="mt-2 text-blue-600 text-sm hover:underline">Start New Well</button>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Last update: Just now</span>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
