'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import { Search, Calendar, Shield, FileText, AlertTriangle } from 'lucide-react';

type DailyReport = {
    id: string;
    report_date: string;
    well_location: string;
    operations_summary: string;
    safety_status: string;
    issues_description?: string | null;
    submitted_by_user?: { first_name: string; last_name: string };
    submitted_at: string;
};

export default function ReportsPage() {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [safetyFilter, setSafetyFilter] = useState('all');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        const { data } = await db.getDailyReports();
        if (data) {
            setReports(data as DailyReport[]);
        }
        setLoading(false);
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.well_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.operations_summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSafety = safetyFilter === 'all' || report.safety_status === safetyFilter;
        return matchesSearch && matchesSafety;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
                    <p className="text-gray-600 mt-2">View daily operational reports</p>
                </div>
                <span className="text-sm text-gray-600">Total: {filteredReports.length}</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by location or summary..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={safetyFilter}
                        onChange={(e) => setSafetyFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Safety Status</option>
                        <option value="safe">Safe</option>
                        <option value="issues">Issues Reported</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <div
                        key={report.id}
                        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-l-4
              ${report.safety_status === 'issues' ? 'border-red-500' : 'border-green-500'}`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {new Date(report.report_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 font-medium">{report.well_location}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {report.safety_status === 'safe' ? (
                                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Safe
                                        </span>
                                    ) : (
                                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Issues
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Operations Summary
                                    </h4>
                                    <p className="text-gray-600 text-sm pl-6">{report.operations_summary}</p>
                                </div>

                                {report.issues_description && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-red-900 mb-1 flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Issues Description
                                        </h4>
                                        <p className="text-red-700 text-sm pl-6">{report.issues_description}</p>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                                    {report.submitted_by_user && (
                                        <span>
                                            Submitted by: <span className="font-semibold text-gray-900">
                                                {report.submitted_by_user.first_name} {report.submitted_by_user.last_name}
                                            </span>
                                        </span>
                                    )}
                                    <span>
                                        {new Date(report.submitted_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No reports found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
