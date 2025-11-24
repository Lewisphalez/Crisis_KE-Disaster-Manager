import React, { useState } from 'react';
import { Incident, IncidentStatus, SeverityLevel, UserRole } from '../types';
import { DISASTER_ICONS, AVAILABLE_RESOURCES } from '../constants';
import { findNearbyResources } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MapPin, ShieldAlert, CheckCircle, Search, Loader2, ExternalLink, Siren, Truck, Plus, X, Lock } from 'lucide-react';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onUpdateIncident: (updatedIncident: Incident) => void;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onBack, onUpdateIncident }) => {
  const { user, hasPermission } = useAuth();
  const [loadingResources, setLoadingResources] = useState(false);
  const [resources, setResources] = useState<{ text: string; chunks: any[] } | null>(null);
  const [showResolveConfirmation, setShowResolveConfirmation] = useState(false);

  // Security Guard: Defense in depth. 
  // Even though UI routing handles this, we prevent rendering if a non-admin reaches this component.
  if (user?.role !== UserRole.ADMIN) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-slate-500 mt-2">You do not have the required security clearance (Tier 1 Admin) to view operational details.</p>
            <button onClick={onBack} className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg">Return</button>
        </div>
    );
  }

  const handleFindResources = async (type: string) => {
    setLoadingResources(true);
    const result = await findNearbyResources(incident.location.latitude, incident.location.longitude, type);
    setResources(result);
    setLoadingResources(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as IncidentStatus;
    
    // Check permission specifically for resolving
    if (newStatus === IncidentStatus.RESOLVED && !hasPermission('resolve_incident')) {
        alert("Insufficient permissions to resolve incidents.");
        return;
    }

    if (newStatus === IncidentStatus.RESOLVED) {
      setShowResolveConfirmation(true);
    } else {
      onUpdateIncident({ ...incident, status: newStatus });
    }
  };

  const confirmResolve = () => {
    onUpdateIncident({ ...incident, status: IncidentStatus.RESOLVED });
    setShowResolveConfirmation(false);
  };

  const toggleResource = (resourceName: string) => {
    if (!hasPermission('dispatch_resources')) {
        alert("Authorization required to dispatch resources.");
        return;
    }

    const currentResources = incident.deployedResources || [];
    let updatedResources;
    if (currentResources.includes(resourceName)) {
        updatedResources = currentResources.filter(r => r !== resourceName);
    } else {
        updatedResources = [...currentResources, resourceName];
    }
    onUpdateIncident({ ...incident, deployedResources: updatedResources });
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 space-y-6 relative pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-64 bg-slate-100 relative group">
              {incident.imageUrl ? (
                <img src={incident.imageUrl} alt="Incident" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100">
                  <div className="text-8xl opacity-50">{DISASTER_ICONS[incident.type]}</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        incident.severity === SeverityLevel.CRITICAL ? 'bg-red-500' :
                        incident.severity === SeverityLevel.HIGH ? 'bg-orange-500' :
                        'bg-blue-500'
                    }`}>
                        {incident.severity} Severity
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                        {incident.type}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold">{incident.title}</h1>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium uppercase mb-1">Current Status</span>
                        <div className="relative">
                            <select 
                                value={incident.status}
                                onChange={handleStatusChange}
                                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-300 transition-colors"
                            >
                                {Object.values(IncidentStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 flex items-center justify-end gap-1"><MapPin className="w-3 h-3" /> Location</p>
                    <p className="font-mono text-sm font-medium text-slate-700">{incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Incident Report</h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{incident.description}</p>
              </div>

              {incident.aiAnalysis && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-indigo-900 font-bold text-sm mb-1">AI Safety Analysis</h3>
                            <p className="text-indigo-800 text-sm leading-relaxed">{incident.aiAnalysis}</p>
                        </div>
                    </div>
                </div>
              )}

              {/* Resource Dispatch Section */}
              <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-500" /> Response Units
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Resources */}
                      <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deployed Units</p>
                          {(!incident.deployedResources || incident.deployedResources.length === 0) && (
                              <p className="text-sm text-slate-400 italic">No units currently deployed.</p>
                          )}
                          {incident.deployedResources?.map(resource => (
                              <div key={resource} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm font-medium">
                                  <span className="flex items-center gap-2"><Siren className="w-4 h-4" /> {resource}</span>
                                  <button onClick={() => toggleResource(resource)} className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded"><X className="w-4 h-4" /></button>
                              </div>
                          ))}
                      </div>

                      {/* Available to Dispatch */}
                      <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available for Dispatch</p>
                          <div className="grid grid-cols-1 gap-2">
                              {AVAILABLE_RESOURCES.map(res => {
                                  // Create a unique-ish name for demo purposes if not already in list
                                  const isDeployed = incident.deployedResources?.some(r => r.startsWith(res));
                                  // Simplified: In a real app we would have a pool of specific unit IDs.
                                  // Here we just allow adding generic types with a random number suffix for flavor.
                                  return (
                                    <button 
                                        key={res}
                                        onClick={() => toggleResource(`${res} ${Math.floor(Math.random() * 99) + 1}`)}
                                        className="flex items-center gap-2 p-2 text-sm text-slate-600 hover:bg-slate-50 border border-dashed border-slate-300 rounded-lg transition-colors text-left"
                                    >
                                        <Plus className="w-4 h-4 text-blue-500" />
                                        Dispatch {res}
                                    </button>
                                  )
                              })}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Find Nearby Help
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Use AI to locate emergency services near this incident using Google Maps data.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {['Hospitals', 'Police Stations', 'Fire Stations', 'Shelters'].map(type => (
                    <button 
                        key={type}
                        onClick={() => handleFindResources(type)}
                        className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 flex items-center justify-center text-center"
                    >
                        {type}
                    </button>
                ))}
            </div>

            {loadingResources && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-xs">Scanning area...</span>
                </div>
            )}

            {!loadingResources && resources && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-sm text-slate-700 mb-4 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded border leading-relaxed">
                       {resources.text}
                    </div>
                    {resources.chunks && resources.chunks.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Located Places</h4>
                            {resources.chunks.map((chunk, idx) => {
                                const mapData = chunk.web?.uri ? chunk.web : chunk.maps; 
                                if (!mapData) return null;
                                return (
                                    <a 
                                        key={idx} 
                                        href={mapData.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-800 text-sm truncate pr-2">{mapData.title || "Location " + (idx+1)}</span>
                                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-2">Reporter Details</h3>
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {incident.reporterName.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-900">{incident.reporterName}</p>
                    <p className="text-xs text-slate-500">Verified Citizen</p>
                </div>
             </div>
             <p className="text-xs text-slate-400">Report ID: {incident.id}</p>
          </div>
        </div>
      </div>

      {showResolveConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Resolve Incident?</h3>
                <p className="text-slate-500 text-center text-sm mb-6">
                    Are you sure you want to mark this incident as resolved? This action will archive the active alert status.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowResolveConfirmation(false)}
                        className="px-4 py-2.5 bg-white text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmResolve}
                        className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetail;