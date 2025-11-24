import React, { useState } from 'react';
import { Incident, SeverityLevel, IncidentStatus } from '../types';
import { AlertTriangle, Shield, ChevronRight, MapPin, Megaphone, Siren, Newspaper, CloudRain, BookOpen, Home, Menu, X } from 'lucide-react';
import { DISASTER_ICONS } from '../constants';
import WeatherDashboard from './WeatherDashboard';
import NewsFeed from './NewsFeed';
import SafetyTips from './SafetyTips';

interface PublicPortalProps {
  incidents: Incident[];
  onReportClick: () => void;
  onAdminLogin: () => void;
}

const PublicPortal: React.FC<PublicPortalProps> = ({ incidents, onReportClick, onAdminLogin }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'weather' | 'news' | 'tips'>('home');

  // Filter for public-relevant alerts
  const activeAlerts = incidents.filter(
    i => (i.severity === SeverityLevel.CRITICAL || i.severity === SeverityLevel.HIGH) && 
    i.status !== IncidentStatus.RESOLVED
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'weather':
        return <WeatherDashboard />;
      case 'news':
        return <NewsFeed />;
      case 'tips':
        return <SafetyTips />;
      default:
        return (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Desktop Grid Layout for Hero Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hero / Report Action */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-gradient-to-br from-red-600 to-red-500 p-6 md:p-8 text-white flex-1 flex flex-col justify-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Uko Salama?</h2>
                        <p className="opacity-90 text-sm md:text-base mb-6 max-w-sm">
                            Your safety is our priority. Report emergencies directly to the National Command Center.
                        </p>
                        <button 
                            onClick={onReportClick}
                            className="w-full md:w-auto bg-white text-red-600 font-bold text-lg py-3 px-8 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-slate-50"
                        >
                            <Megaphone className="w-5 h-5" />
                            REPORT INCIDENT
                        </button>
                    </div>
                    {/* Decorative pattern for desktop */}
                    <div className="hidden md:block w-1/3 bg-slate-100 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Siren className="w-24 h-24 text-red-200" />
                        </div>
                    </div>
                </div>

                {/* Quick Contacts - Sidebar on Desktop */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Emergency Hotlines</h3>
                    <div className="space-y-3">
                        <a href="tel:999" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-4 transition-colors group border border-blue-100">
                            <div className="bg-blue-200 text-blue-700 p-2 rounded-full">
                                <Siren className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-800">Police / Ambulance</span>
                                <span className="text-xs text-blue-600 font-bold">Dial 999</span>
                            </div>
                        </a>
                        <a href="tel:1199" className="p-3 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-4 transition-colors group border border-red-100">
                            <div className="bg-red-200 text-red-700 p-2 rounded-full">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-800">Red Cross Kenya</span>
                                <span className="text-xs text-red-600 font-bold">Dial 1199</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Live Safety Alerts */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Active Safety Alerts
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-md">Live Updates</span>
                </div>
                
                {activeAlerts.length === 0 ? (
                    <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 flex flex-col items-center">
                        <Shield className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">No critical alerts in your area.</p>
                        <p className="text-sm opacity-75 mt-1">Stay vigilant, wananchi.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
                        {activeAlerts.map(incident => (
                            <div key={incident.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                {incident.severity === SeverityLevel.CRITICAL && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                )}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-3xl bg-slate-50 h-10 w-10 flex items-center justify-center rounded-lg group-hover:bg-slate-100 transition-colors">
                                        {DISASTER_ICONS[incident.type]}
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide ${
                                        incident.severity === SeverityLevel.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {incident.severity}
                                    </span>
                                </div>
                                
                                <h4 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{incident.title}</h4>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{incident.description}</p>
                                
                                <div className="pt-3 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <MapPin className="w-3 h-3" />
                                    <span>{(incident.location.latitude).toFixed(3)}, {(incident.location.longitude).toFixed(3)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        );
    }
  };

  const NavButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab, label: string, icon: any }) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === tab 
            ? 'bg-green-50 text-green-700' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-green-600' : 'text-slate-400'}`} />
        {label}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header - Responsive */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm">
                <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">CrisisSync <span className="text-green-600 font-normal">KE</span></h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white">
            <NavButton tab="home" label="Dashboard" icon={Home} />
            <NavButton tab="weather" label="Weather" icon={CloudRain} />
            <NavButton tab="news" label="News" icon={Newspaper} />
            <NavButton tab="tips" label="Safety" icon={BookOpen} />
          </nav>

          <button 
            onClick={onAdminLogin}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-green-700 hover:border-green-200 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* Main Content - Responsive Width */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 h-16">
          <button 
             onClick={() => setActiveTab('home')}
             className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'home' ? 'text-green-600' : 'text-slate-400'}`}
          >
             <Home className="w-5 h-5" />
             <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
             onClick={() => setActiveTab('weather')}
             className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'weather' ? 'text-green-600' : 'text-slate-400'}`}
          >
             <CloudRain className="w-5 h-5" />
             <span className="text-[10px] font-bold">Weather</span>
          </button>
          <button 
             onClick={() => setActiveTab('news')}
             className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'news' ? 'text-green-600' : 'text-slate-400'}`}
          >
             <Newspaper className="w-5 h-5" />
             <span className="text-[10px] font-bold">News</span>
          </button>
          <button 
             onClick={() => setActiveTab('tips')}
             className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'tips' ? 'text-green-600' : 'text-slate-400'}`}
          >
             <BookOpen className="w-5 h-5" />
             <span className="text-[10px] font-bold">Tips</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicPortal;