import { Incident } from "../types";

const API_URL = 'http://localhost:5000/api';

export const api = {
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await fetch(`${API_URL}/incidents`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  async createIncident(incident: Incident): Promise<Incident> {
    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/incidents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: updates.status,
                deployedResources: updates.deployedResources
            })
        });
        if (!response.ok) throw new Error('Failed to update incident');
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
  }
};