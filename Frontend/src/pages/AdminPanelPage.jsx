import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/Spinner';
import { Plus, Edit, Users, FileText, Home, LineChart, PieChart } from 'lucide-react';

// Import Charting components
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

// Import all necessary modals
import AddKioskModal from '../components/AddKioskModal.jsx';
import AddSubscriptionModal from '../components/AddSubscriptionModal.jsx';
import GenericEditModal from '../components/GenericEditModal.jsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);


// Central configuration for all data tables. This drives the entire page.
const columnsConfig = {
  users: [
    { header: 'Full Name', accessor: 'fullName' }, { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' }, { header: 'Phone', accessor: 'phoneNumber' },
  ],
  admins: [
    { header: 'Name', accessor: (item) => item.user?.fullName || 'N/A' },
    { header: 'Email', accessor: (item) => item.user?.email || 'N/A' },
    { header: 'Admin Role', accessor: 'adminRole' }, { header: 'Status', accessor: 'status' },
  ],
  employees: [
    { header: 'Name', accessor: (item) => item.user?.fullName || 'N/A' },
    { header: 'Email', accessor: (item) => item.user?.email || 'N/A' },
    { header: 'Department', accessor: 'department' }, { header: 'Designation', accessor: 'designation' },
  ],
  paralegals: [
    { header: 'Name', accessor: (item) => item.user?.fullName || 'N/A' },
    { header: 'Email', accessor: (item) => item.user?.email || 'N/A' },
    { header: 'Active', accessor: 'active' }, { header: 'Rating', accessor: 'rating' },
  ],
  kiosks: [
    { header: 'Location', accessor: 'location' }, { header: 'Village', accessor: 'village' },
    { header: 'Operator', accessor: 'operatorName' }, { header: 'Organization', accessor: 'organizationType' },
    { header: 'Active', accessor: 'isActive' },
  ],
  subscriptions: [
    { header: 'Org Type', accessor: 'organizationType' }, { header: 'Plan', accessor: 'plan' },
    { header: 'Status', accessor: 'paymentStatus' },
    { header: 'Expires On', accessor: (item) => new Date(item.expiryDate).toLocaleDateString() },
  ],
  issues: [
    { header: 'Issue Type', accessor: 'issueType' }, { header: 'Status', accessor: 'status' },
    { header: 'User ID', accessor: 'userId' }, { header: 'Description', accessor: 'description' },
  ],
  documents: [
    { header: 'Doc Type', accessor: 'documentType' }, { header: 'Status', accessor: 'submissionStatus' },
    { header: 'User ID', accessor: 'userId' }, { header: 'Issue ID', accessor: 'issueId' },
  ],
  voicequeries: [
    { header: 'Language', accessor: 'language' }, { header: 'User ID', accessor: 'userId' },
    { header: 'Issue ID', accessor: 'issueId' }, { header: 'Text', accessor: 'transcribedText' },
  ],
};


// ==========================================================
//  Admin Overview Component (for the first tab)
// ==========================================================
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-slate-800 p-6 rounded-xl flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/admins/stats');
                setStats(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-400 p-4">{error}</div>;
    if (!stats) return <div>No stats available.</div>;

    const lineChartData = {
        labels: stats.issuesLast30Days.map(d => new Date(d._id).toLocaleDateString()),
        datasets: [{
            label: 'Issues Created',
            data: stats.issuesLast30Days.map(d => d.count),
            borderColor: 'rgb(56, 189, 248)', backgroundColor: 'rgba(56, 189, 248, 0.2)',
            fill: true, tension: 0.3
        }]
    };
    const doughnutChartData = {
        labels: stats.issueTypeDistribution.map(d => d._id),
        datasets: [{
            label: 'Issue Types',
            data: stats.issueTypeDistribution.map(d => d.count),
            backgroundColor: ['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b'],
            borderColor: '#1e293b', borderWidth: 2,
        }]
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users size={24} />} title="Total Users" value={stats.keyMetrics.totalUsers} color="bg-cyan-500/20 text-cyan-300" />
                <StatCard icon={<FileText size={24} />} title="Total Legal Issues" value={stats.keyMetrics.totalIssues} color="bg-pink-500/20 text-pink-300" />
                <StatCard icon={<Home size={24} />} title="Total Kiosks" value={stats.keyMetrics.totalKiosks} color="bg-purple-500/20 text-purple-300" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-slate-800 p-6 rounded-xl"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><LineChart size={20}/>Issues Created (Last 30 Days)</h3><div className="h-64"><Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} /></div></div>
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><PieChart size={20}/>Issue Type Distribution</h3><div className="h-64"><Doughnut data={doughnutChartData} options={{ maintainAspectRatio: false, responsive: true }} /></div></div>
            </div>
        </div>
    );
};


// ==========================================================
//  Main Admin Panel Page Component
// ==========================================================
const AdminPanelPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [editingItem, setEditingItem] = useState(null);
    const [isAddKioskModalOpen, setAddKioskModalOpen] = useState(false);
    const [isAddSubModalOpen, setAddSubModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    
    const tabs = ['overview', ...Object.keys(columnsConfig)];
    const tabName = (tab) => tab.charAt(0).toUpperCase() + tab.slice(1);
    const canCreate = ['kiosks', 'subscriptions'].includes(activeTab);
    const canEdit = !['subscriptions', 'voicequeries', 'overview'].includes(activeTab);

    const handleCreateClick = () => {
        if (activeTab === 'kiosks') setAddKioskModalOpen(true);
        if (activeTab === 'subscriptions') setAddSubModalOpen(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditModalOpen(true);
    };
    
    const forceRerender = (tab) => {
        setActiveTab('');
        setTimeout(() => setActiveTab(tab), 50);
    };

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
                    {canCreate && (
                        <button onClick={handleCreateClick} className="btn-primary w-auto flex items-center gap-2">
                            <Plus size={16} /> Create New {tabName(activeTab).slice(0, -1)}
                        </button>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-2 border-b border-slate-700">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-500'}`}>
                            {tabName(tab)}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === 'overview' ? (
                        <AdminOverview />
                    ) : (
                        <DataTable 
                            endpoint={`/${activeTab}`} 
                            title={tabName(activeTab)} 
                            columns={columnsConfig[activeTab]} 
                            onEdit={canEdit ? handleEditClick : null}
                            key={activeTab}
                        />
                    )}
                </div>
            </div>

            <AddKioskModal isOpen={isAddKioskModalOpen} onClose={() => setAddKioskModalOpen(false)} onSuccess={() => forceRerender('kiosks')} />
            <AddSubscriptionModal isOpen={isAddSubModalOpen} onClose={() => setAddSubModalOpen(false)} onSuccess={() => forceRerender('subscriptions')} />
            <GenericEditModal 
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={() => forceRerender(activeTab)}
                itemData={editingItem}
                columns={columnsConfig[activeTab] || []}
                endpoint={`/${activeTab}`}
                title={`Edit ${tabName(activeTab).slice(0, -1)}`}
            />
        </>
    );
};


// ==========================================================
//  Generic Data Table Component
// ==========================================================
const DataTable = ({ endpoint, title, columns, onEdit }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setError('');
            try {
                const response = await apiClient.get(endpoint);
                setData(Array.isArray(response.data) ? response.data : (response.data?.data || []));
            } catch (err) {
                setError(err.message || `Failed to fetch ${title}.`); setData([]);
            } finally { setLoading(false); }
        };
        fetchData();
    }, [endpoint, title]);

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete this ${title.slice(0, -1)}? This action cannot be undone.`)) {
            try {
                await apiClient.delete(`${endpoint}/${id}`);
                setData(prevData => prevData.filter(item => item._id !== id));
                toast.success(`${title.slice(0, -1)} deleted successfully.`);
            } catch (err) {
                toast.error(`Failed to delete: ${err.message}`);
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;
    if (data.length === 0) return <div className="text-slate-400 p-4 bg-slate-800/50 rounded-lg">No {title} found.</div>;

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            {columns.map(col => <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">{col.header}</th>)}
                            <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                        {data.map(item => (
                            <tr key={item._id} className="hover:bg-slate-700/50 transition-colors">
                                {columns.map(col => (
                                    <td key={`${item._id}-${col.header}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor] ?? '')}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-4">
                                    {onEdit && <button onClick={() => onEdit(item)} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Edit size={14}/> Edit</button>}
                                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-400">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanelPage;