'use client';

import { useEffect, useState, FormEvent } from 'react';
import { db } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, Mail, Phone, Shield, UserPlus, X } from 'lucide-react';

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    role: string;
    status: string;
    created_at: string;
    last_login_at?: string | null;
};

export default function UsersPage() {
    const { isSuperAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            // Use API route to bypass RLS
            const response = await fetch('/api/users/list');
            const result = await response.json();
            if (result.data) {
                setUsers(result.data as User[]);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            super_admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Super Admin' },
            admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
            engineer: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Engineer' },
            manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Manager' },
            field_engineer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Field Engineer' },
            hse_officer: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HSE Officer' }
        };
        const c = config[role] || config.field_engineer;
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            active: { bg: 'bg-green-100', text: 'text-green-700' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
            suspended: { bg: 'bg-red-100', text: 'text-red-700' }
        };
        const c = config[status] || config.active;
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${c.bg} ${c.text} capitalize`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-2">Manage system users and roles</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Total: {filteredUsers.length}</span>
                    {isSuperAdmin() && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create User
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="engineer">Engineer</option>
                        <option value="manager">Manager</option>
                        <option value="field_engineer">Field Engineer</option>
                        <option value="hse_officer">HSE Officer</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {getRoleBadge(user.role)}
                                            {getStatusBadge(user.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <a href={`mailto:${user.email}`} className="hover:text-blue-600">{user.email}</a>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <a href={`tel:${user.phone}`} className="hover:text-blue-600">{user.phone}</a>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member Since:</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {user.last_login_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Login:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(user.last_login_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No users found matching your criteria</p>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onUserCreated={() => {
                        loadUsers();
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
}

// Create User Modal Component
function CreateUserModal({ onClose, onUserCreated }: { onClose: () => void; onUserCreated: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'admin' | 'engineer'>('engineer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use API route for user creation (requires service role key)
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    role,
                    phone: phone || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to create user');
            } else {
                onUserCreated();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Create New User</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('engineer')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'engineer'
                                    ? 'border-cyan-500 bg-cyan-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Engineer</p>
                                    <p className="text-xs text-gray-500">Mobile app access only</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'admin'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">Dashboard access only</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

