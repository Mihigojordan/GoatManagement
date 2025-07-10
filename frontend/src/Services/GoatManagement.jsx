import axios from 'axios';

class GoatManagementService {
  constructor(baseURL = import.meta.env.VITE_API_URL) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message =
          error.response?.data?.message || error.message || 'An error occurred';
        console.error('API Error:', message);
        throw new Error(message);
      }
    );
  }

  async registerGoat(goatData) {
    try {
      const isFormData = goatData instanceof FormData;

      const response = await this.api.post('/goats', goatData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Register goat error:', error);
      throw error;
    }
  }

  async scanGoat(goatId) {
    try {
      const response = await this.api.post('/goats/scan', { goatId });
      return response.data;
    } catch (error) {
      console.error('Scan goat error:', error);
      throw error;
    }
  }

  async scanGoatOut(goatId) {
    try {
      const response = await this.api.post('/goats/scan-out', { goatId });
      return response.data;
    } catch (error) {
      console.error('Scan goat out error:', error);
      throw error;
    }
  }

  // ✅ New method: Scan all goats out (no ID required)
  async scanAllGoatsOut() {
    try {
      const response = await this.api.post('/goats/checkout-all');
      return response.data;
    } catch (error) {
      console.error('Scan all goats out error:', error);
      throw error;
    }
  }

  async getGoats(params = {}) {
    try {
      const response = await this.api.get('/goats', { params });
      return response.data;
    } catch (error) {
      console.error('Get goats error:', error);
      throw error;
    }
  }

  async getGoatById(goatId) {
    try {
      const response = await this.api.get(`/goats/${goatId}`);
      return response.data;
    } catch (error) {
      console.error('Get goat by ID error:', error);
      throw error;
    }
  }

  async getGoatCounts() {
    try {
      const response = await this.api.get('/goats/counts');
      return response.data;
    } catch (error) {
      console.error('Get goat counts error:', error);
      throw error;
    }
  }

  formatGoatTag(prefix, id) {
    return `${prefix}-${id.toString().padStart(4, '0')}`;
  }
}

const goatManagementService = new GoatManagementService();
export default goatManagementService;
