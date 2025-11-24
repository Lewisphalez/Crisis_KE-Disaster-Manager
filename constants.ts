import { DisasterType, Incident, IncidentStatus, SeverityLevel } from "./types";

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'Flash Flood in Kibera',
    description: 'Heavy rains caused river banks to overflow near the bridge. Several homes affected.',
    type: DisasterType.FLOOD,
    status: IncidentStatus.INVESTIGATING,
    severity: SeverityLevel.HIGH,
    location: { latitude: -1.3120, longitude: 36.7890 }, // Kibera, Nairobi
    timestamp: Date.now() - 3600000,
    reporterName: 'John Kamau',
    aiAnalysis: 'High risk of waterborne diseases. Immediate evacuation of low-lying structures recommended.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-888469d6571d?auto=format&fit=crop&q=80&w=400',
    deployedResources: ['Red Cross Unit 4', 'Nairobi Fire Dept']
  },
  {
    id: '2',
    title: 'Matatu Collision on Thika Superhighway',
    description: '14-seater matatu collided with a lorry near Roysambu. Traffic standstill.',
    type: DisasterType.ACCIDENT,
    status: IncidentStatus.PENDING,
    severity: SeverityLevel.CRITICAL,
    location: { latitude: -1.2186, longitude: 36.8868 }, // Roysambu
    timestamp: Date.now() - 7200000,
    reporterName: 'Jane Wanjiku',
    aiAnalysis: 'Potential multiple casualties. Requires immediate advanced life support units.',
    imageUrl: 'https://images.unsplash.com/photo-1566416954271-965a3952f207?auto=format&fit=crop&q=80&w=400',
    deployedResources: []
  },
  {
    id: '3',
    title: 'Bush Fire in Tsavo West',
    description: 'Dry grass caught fire near the southern gate. Spreading due to wind.',
    type: DisasterType.FIRE,
    status: IncidentStatus.RESOLVED,
    severity: SeverityLevel.MEDIUM,
    location: { latitude: -2.9904, longitude: 38.4623 }, // Tsavo
    timestamp: Date.now() - 86400000,
    reporterName: 'KWS Ranger Team',
    aiAnalysis: 'Contained area but requires monitoring for hotspots to protect wildlife.',
    imageUrl: 'https://images.unsplash.com/photo-1599933593675-eb2d64024c0d?auto=format&fit=crop&q=80&w=400',
    deployedResources: ['KWS Fire Unit 1']
  },
  {
    id: '4',
    title: 'Landslide Warning in Murang\'a',
    description: 'Cracks observed on the hillside after 3 days of continuous rain.',
    type: DisasterType.LANDSLIDE,
    status: IncidentStatus.INVESTIGATING,
    severity: SeverityLevel.HIGH,
    location: { latitude: -0.7197, longitude: 37.1497 }, // Muranga
    timestamp: Date.now() - 43200000,
    reporterName: 'Chief Mwaura',
    aiAnalysis: 'Geological instability detected. Preemptive evacuation advised.',
    imageUrl: 'https://images.unsplash.com/photo-1588610363989-d4190c1f4e16?auto=format&fit=crop&q=80&w=400',
    deployedResources: []
  }
];

export const DISASTER_ICONS: Record<DisasterType, string> = {
  [DisasterType.FLOOD]: '🌊',
  [DisasterType.FIRE]: '🔥',
  [DisasterType.ACCIDENT]: '🚑',
  [DisasterType.EARTHQUAKE]: '🏚️',
  [DisasterType.DROUGHT]: '☀️',
  [DisasterType.LANDSLIDE]: '⛰️',
  [DisasterType.OTHER]: '⚠️',
};

export const AVAILABLE_RESOURCES = [
  'Red Cross Kenya',
  'St John Ambulance',
  'Nairobi Fire Rescue',
  'KWS Ranger Unit',
  'NDMA Response Team',
  'County Police Patrol',
  'Sonko Rescue Team',
  'AMREF Flying Doctors'
];