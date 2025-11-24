import React, { useState, useEffect } from 'react';
import { Incident, IncidentStatus, UserRole } from './types';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import ReportModal from './components/ReportModal';
import IncidentDetail from './components/IncidentDetail';
import PublicPortal from './components/PublicPortal';
import LoginPage from './components/LoginPage';
import { api } from './services/api';
import { AlertTriangle, LayoutDashboard, Siren, ShieldCheck, LogOut } from 'lucide-react';

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
        const data = await api.getIncidents();
        setIncidents(data);
    };
    if (isAuthenticated) {
        loadData();
    }
  }, [isAuthenticated, refreshTrigger]);

  const handleCreateReport = async (data: Partial<Incident>) => {
    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || 'Untitled Report',
      description: data.description || '',
      type: data.type as any,
      status: IncidentStatus.PENDING,
      severity: data.severity as any,
      location: data.location!,
      timestamp: Date.now(),
      reporterName: user?.role === UserRole.CITIZEN ? (user.name || 'Anonymous') : 'Dispatched Unit',
      aiAnalysis: data.aiAnalysis,
      imageUrl: data.imageUrl,
      deployedResources: []
    };

    // Optimistic UI update
    setIncidents([newIncident, ...incidents]);
    
    // API Call
    await api.createIncident(newIncident);
    setRefreshTrigger(prev => prev + 1); // Refresh from server to ensure sync
  };

  const handleUpdateIncident = async (updatedIncident: Incident) => {
    // Optimistic UI update
    setIncidents(incidents.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
    if (selectedIncident && selectedIncident.id === updatedIncident.id) {
        setSelectedIncident(updatedIncident);
    }

    // API Call
    await api.updateIncident(updatedIncident.id, updatedIncident);
    setRefreshTrigger(prev => prev + 1);
  };

  // 1. Unauthenticated View -> Login Page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // 2. Citizen Role -> Public Portal View
  if (user.role === UserRole.CITIZEN) {
    return (
      <>
        <PublicPortal 
          incidents={incidents}
          onReportClick={() => setIsReportModalOpen(true)}
          onAdminLogin={logout} 
        />
        {isReportModalOpen && (
          <ReportModal 
            onClose={() => setIsReportModalOpen(false)} 
            onSubmit={handleCreateReport} 
          />
        )}
      </>
    );
  }

  // 3. Admin Role -> Command Center Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Header (Admin) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Siren className="w-5 h-5" />
            </div>
            CrisisSync
        </div>
        <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-transform"
        >
            + Incident
        </button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 font-bold text-2xl text-white">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                <Siren className="w-6 h-6 text-white" />
            </div>
            CrisisSync
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green-500" /> SECURE ADMIN
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setSelectedIncident(null); setActiveTab('dashboard'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' && !selectedIncident ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <div className="pt-6 pb-2 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Quick Actions</div>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/10 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white transition-all font-semibold group"
          >
            <AlertTriangle className="w-5 h-5" /> Log Internal Report
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs border border-slate-600">
                      {user.name.charAt(0)}
                   </div>
                   <div className="overflow-hidden">
                       <p className="text-xs text-white font-bold truncate">{user.name}</p>
                       <p className="text-[10px] text-slate-500 truncate">{user.department}</p>
                   </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full mt-2 text-xs flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-700 hover:bg-red-900/30 hover:text-red-400 text-slate-300 transition-colors border border-transparent hover:border-red-900/50"
                >
                    <LogOut className="w-3 h-3" /> Sign Out
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-64px)] md:max-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {selectedIncident ? (
            <IncidentDetail 
                incident={selectedIncident} 
                onBack={() => setSelectedIncident(null)}
                onUpdateIncident={handleUpdateIncident}
            />
          ) : (
            <>
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Operations Dashboard</h1>
                        <p className="text-slate-500 mt-2">Real-time overview of active incidents and response efforts.</p>
                    </div>
                    {/* Date display */}
                    <div className="hidden md:block text-right">
                        <div className="inline-block px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                            <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </header>
                <Dashboard 
                    incidents={incidents} 
                    onViewIncident={setSelectedIncident} 
                />
            </>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal 
          onClose={() => setIsReportModalOpen(false)} 
          onSubmit={handleCreateReport} 
        />
      )}
    </div>
  );
}