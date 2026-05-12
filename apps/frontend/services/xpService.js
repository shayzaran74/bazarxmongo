import axios from 'axios';

export const xpService = {
  /**
   * Satıcının 15 gün içinde yanacak XP Batch'lerini getirir.
   * Backend Endpoint: GET /api/vendor/xp/burning-risk
   */
  async getBurningRisk() {
    try {
      const token = useCookie('access_token')?.value;

      const response = await axios.get('/api/v1/vendors/xp/burning-risk', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      return response.data;
    } catch (error) {
      console.error('Watchtower Risk Verisi Çekilemedi:', error);
      return [];
    }
  }
};
