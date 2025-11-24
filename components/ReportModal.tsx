import React, { useState, useRef } from 'react';
import { DisasterType, Coordinates } from '../types';
import { analyzeIncidentReport } from '../services/geminiService';
import { Camera, MapPin, Loader2, X, Upload } from 'lucide-react';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DisasterType>(DisasterType.OTHER);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for API usage later if needed, but for display keeping it full
        setImage(base64String); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) return;

    setLoading(true);
    setAnalyzing(true);

    try {
        // Strip data:image/jpeg;base64, prefix for Gemini
        const base64Data = image ? image.split(',')[1] : undefined;
        const analysis = await analyzeIncidentReport(description, base64Data);
        
        const newIncident = {
            title: analysis.summary || 'New Incident Report',
            description,
            type: analysis.category || type, // Use AI detected category if available
            location,
            severity: analysis.severity,
            aiAnalysis: analysis.advice,
            imageUrl: image,
            timestamp: Date.now(),
        };

        onSubmit(newIncident);
        onClose();
    } catch (error) {
        console.error(error);
        alert('Failed to submit report. Please try again.');
    } finally {
        setLoading(false);
        setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Report Disaster</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Location</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGetLocation}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-all ${
                  locationStatus === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {locationStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {locationStatus === 'success' ? 'Location Secured' : 'Detect My Location'}
              </button>
            </div>
            {location && (
               <p className="text-xs text-center text-slate-400">Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Photo Evidence (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {image ? (
                <img src={image} alt="Preview" className="h-32 object-cover rounded-md" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Click to upload or take photo</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
              placeholder="Describe the situation..."
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !location}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {analyzing ? 'AI Analyzing...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
