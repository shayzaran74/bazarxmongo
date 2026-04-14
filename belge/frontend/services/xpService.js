import axios from 'axios';

export const xpService = {
  /**
   * Satıcının 15 gün içinde yanacak XP Batch'lerini getirir.
   * Backend Endpoint: GET /api/vendor/xp/burning-risk
   */
  async getBurningRisk() {
    try {
      // Create axios instance with config if not using Nuxt's strict $fetch but preserving user intent
      const token = import.meta.client ? localStorage.getItem('token') : null;
      
      const response = await axios.get('http://localhost:3000/api/vendor/xp/burning-risk', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      return response.data; // Dönüş beklenen format: Array of XpBatch objects
    } catch (error) {
      console.error('Watchtower Risk Verisi Çekilemedi:', error);
      return [];
    }
  }
};
