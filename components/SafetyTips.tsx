import React, { useState } from 'react';
import { ShieldCheck, Droplets, Car, Flame, Home, ChevronDown, ChevronUp } from 'lucide-react';

const TIPS = [
  {
    category: 'Flood Safety',
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    content: [
      'Move to higher ground immediately if you live near river banks (e.g., Mathare, Nairobi River).',
      'Do not walk or drive through moving water. 15cm of water can knock you down.',
      'Unplug electronics and move them to high shelves.',
      'Boil all drinking water to prevent Cholera and Typhoid.'
    ]
  },
  {
    category: 'Road Safety (Matatu/Personal)',
    icon: <Car className="w-5 h-5 text-orange-500" />,
    content: [
      'Avoid boarding overloaded PSVs (Matatus).',
      'During heavy rain, visibility is poor. Keep headlights on and slow down.',
      'Watch out for boda bodas weaving through traffic.',
      'If involved in an accident, set up warning triangles 50m away.'
    ]
  },
  {
    category: 'Fire Safety',
    icon: <Flame className="w-5 h-5 text-red-500" />,
    content: [
      'Keep a bucket of sand or a fire extinguisher accessible in the kitchen.',
      'Do not leave jikos (charcoal stoves) unattended indoors (Carbon Monoxide risk).',
      'Know the nearest assembly point in your estate.',
      'Call 999 or County Fire Department immediately.'
    ]
  },
  {
    category: 'General Preparedness',
    icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
    content: [
      'Save emergency numbers: 999, 112, 911.',
      'Keep a "Go-Bag" with ID, insurance papers, flashlight, and small cash.',
      'Follow KMD (Kenya Met Dept) for reliable weather updates.',
      'Establish a family meeting point in case of network outage.'
    ]
  }
];

const SafetyTips: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4 pb-20">
       <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-2">Be Prepared, Stay Safe.</h2>
          <p className="text-indigo-100 text-sm">Essential guidelines for emergency situations in Kenya.</p>
       </div>

       {TIPS.map((tip, idx) => (
         <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-50 rounded-lg">{tip.icon}</div>
                 <span className="font-bold text-slate-800">{tip.category}</span>
              </div>
              {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            
            {openIndex === idx && (
              <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                <ul className="space-y-2 mt-3">
                  {tip.content.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                       <span className="text-blue-500 font-bold mt-1">•</span>
                       {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
         </div>
       ))}

       <div className="text-center mt-8 p-4 border border-dashed border-slate-300 rounded-xl">
          <p className="text-xs text-slate-500 font-bold uppercase mb-2">Emergency Contacts</p>
          <div className="flex justify-center gap-4">
             <a href="tel:999" className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200">Dial 999</a>
             <a href="tel:112" className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200">Dial 112</a>
          </div>
       </div>
    </div>
  );
};

export default SafetyTips;