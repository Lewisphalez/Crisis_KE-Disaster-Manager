import React, { useState, useEffect, useRef } from 'react';
import { Incident, IncidentStatus, SeverityLevel } from '../types';
import { DISASTER_ICONS } from '../constants';
import { AlertTriangle, CheckCircle, Clock, MapPin, Activity, Globe, List, BrainCircuit, Maximize } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboardInsight } from '../services/geminiService';

interface DashboardProps {
  incidents: Incident[];
  onViewIncident: (incident: Incident) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ incidents, onViewIncident }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sitRep, setSitRep] = useState<string>("Analyzing current operational status...");

  const total = incidents.length;
  const pending = incidents.filter(i => i.status === IncidentStatus.PENDING).length;
  const resolved = incidents.filter(i => i.status === IncidentStatus.RESOLVED).length;
  const critical = incidents.filter(i => i.severity === SeverityLevel.CRITICAL || i.severity === SeverityLevel.HIGH).length;

  const chartData = [
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Active', value: incidents.length - pending - resolved, color: '#3b82f6' },
    { name: 'Resolved', value: resolved, color: '#10b981' },
    { name: 'Critical', value: critical, color: '#ef4444' },
  ];

  useEffect(() => {
    const fetchInsight = async () => {
        const insight = await getDashboardInsight(incidents);
        setSitRep(insight);
    };
    fetchInsight();
  }, [incidents]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={total} icon={<Activity className="text-blue-500" />} />
        <StatCard title="Pending Review" value={pending} icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Resolved" value={resolved} icon={<CheckCircle className="text-green-500" />} />
        <StatCard title="Critical Alerts" value={critical} icon={<AlertTriangle className="text-red-500" />} highlight />
      </div>

      {/* AI SitRep Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg flex items-start gap-4 text-white border border-slate-700">
        <div className="p-2 bg-white/10 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
        </div>
        <div>
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">AI Strategic Situation Report</h3>
            <p className="text-sm text-slate-200 leading-relaxed opacity-90">{sitRep}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed / Map */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {viewMode === 'list' ? <Activity className="w-5 h-5" /> : <Globe className="w-5 h-5" />} 
              {viewMode === 'list' ? 'Recent Live Reports' : 'Live Incident Map'}
            </h2>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center gap-1"><List className="w-3 h-3" /> List</div>
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> Map</div>
                </button>
            </div>
          </div>
          
          <div className="flex-1 p-0 overflow-hidden relative">
            {viewMode === 'list' ? (
                 <div className="space-y-0 divide-y divide-slate-100 h-[500px] overflow-y-auto">
                 {incidents.slice(0, 10).map((incident) => (
                   <div 
                     key={incident.id}
                     onClick={() => onViewIncident(incident)}
                     className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                   >
                     <div className="text-2xl select-none bg-slate-100 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">{DISASTER_ICONS[incident.type]}</div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-1">
                         <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{incident.title}</h3>
                         <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold ${
                           incident.status === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                           incident.status === IncidentStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                           'bg-blue-100 text-blue-700'
                         }`}>
                           {incident.status}
                         </span>
                       </div>
                       <p className="text-sm text-slate-500 truncate mb-2">{incident.description}</p>
                       <div className="flex items-center gap-4 text-xs text-slate-400">
                         <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.location.latitude.toFixed(3)}, {incident.location.longitude.toFixed(3)}</span>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(incident.timestamp).toLocaleTimeString()}</span>
                         {incident.severity === SeverityLevel.CRITICAL && (
                             <span className="text-red-500 font-bold flex items-center gap-1 ml-auto"><AlertTriangle className="w-3 h-3" /> CRITICAL</span>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
                 {incidents.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p>No active incidents.</p>
                   </div>
                 )}
               </div>
            ) : (
                <InteractiveMap incidents={incidents} onSelect={onViewIncident} />
            )}
           
          </div>
        </div>

        {/* Stats Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Analytic Overview</h2>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-3">
             <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">{critical}</div>
                <div>
                    <p className="text-xs text-red-600 font-bold uppercase">Priority Attention</p>
                    <p className="text-sm text-red-900 font-medium">Critical incidents requiring immediate dispatch.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Leaflet Map Component
const InteractiveMap: React.FC<{ incidents: Incident[], onSelect: (i: Incident) => void }> = ({ incidents, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    // Check if L (Leaflet) is available globally (loaded via CDN in index.html)
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Initialize Map if not already done
    if (!leafletMap.current) {
      // Default center: Nairobi/Kenya area
      const defaultLat = -1.2921;
      const defaultLng = 36.8219;
      
      leafletMap.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 10);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
    }

    // Clear existing markers
    leafletMap.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            leafletMap.current.removeLayer(layer);
        }
    });

    // Add markers for incidents
    incidents.forEach(incident => {
        // Color based on severity
        const color = incident.severity === SeverityLevel.CRITICAL ? '#ef4444' : 
                      incident.severity === SeverityLevel.HIGH ? '#f97316' : 
                      '#3b82f6';
        
        const circleMarker = L.circleMarker([incident.location.latitude, incident.location.longitude], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(leafletMap.current);

        // Add Popup
        const popupContent = `
            <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 5px 0; font-weight: bold; color: #1e293b;">${incident.title}</h3>
                <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${incident.severity}</span>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">${incident.type}</p>
            </div>
        `;
        
        circleMarker.bindPopup(popupContent);
        
        // Handle click
        circleMarker.on('click', () => {
            onSelect(incident);
        });
    });

    // Adjust bounds if we have incidents
    if (incidents.length > 0) {
        const bounds = L.latLngBounds(incidents.map(i => [i.location.latitude, i.location.longitude]));
        // Padding to prevent markers being on the edge
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [incidents, onSelect]);

  return <div ref={mapRef} className="w-full h-full min-h-[500px] z-0" />;
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; highlight?: boolean }> = ({ title, value, icon, highlight }) => (
  <div className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${highlight ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
    <div className="flex items-center justify-between mb-4">
      <span className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-slate-500'}`}>{title}</span>
      <div className={`p-2 rounded-lg ${highlight ? 'bg-red-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-bold ${highlight ? 'text-red-900' : 'text-slate-900'}`}>{value}</span>
    </div>
  </div>
);

export default Dashboard;