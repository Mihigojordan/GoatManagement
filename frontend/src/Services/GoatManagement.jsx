import axios from 'axios';

class GoatManagementService {
  constructor(baseURL = import.meta.env.VITE_API_URL) {
    this.api = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
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

  // Scan goat (RFID or other scanning method)
 async scanGoat(goatId) {
  try {
    const response = await this.api.post('/goats/scan', { goatId });
    return response.data;
  } catch (error) {
    console.error('Scan goat error:', error);
    throw error;
  }
}


  // Get all goats with optional filters (breed, age, etc.)
  async getGoats(params = {}) {
    try {
      const response = await this.api.get('/goats', { params });
      return response.data;
    } catch (error) {
      console.error('Get goats error:', error);
      throw error;
    }
  }

  

  // Get goat details by ID
  async getGoatById(goatId) {
    try {
      const response = await this.api.get(`/goats/${goatId}`);
      return response.data;
    } catch (error) {
      console.error('Get goat by ID error:', error);
      throw error;
    }
  } 
  // Get goat details by ID
  async getGoatCounts() {
    try {
      const response = await this.api.get(`/goats/counts`);
      return response.data;
    } catch (error) {
      console.error('Get goat by ID error:', error);
      throw error;
    }
  }


  // Update goat information
  async updateGoat(goatId, goatData) {
    try {
      const response = await this.api.put(`/goats/${goatId}`, goatData);
      return response.data;
    } catch (error) {
      console.error('Update goat error:', error);
      throw error;
    }
  }

  // Delete a goat record
  async deleteGoat(goatId) {
    try {
      const response = await this.api.delete(`/goats/${goatId}`);
      return response.data;
    } catch (error) {
      console.error('Delete goat error:', error);
      throw error;
    }
  }
  // GoatManagement.js



  // get goat status from backend by id
async getGoatStatus(goatId) {
  try {
    const response = await this.api.get(`/goats/status/${goatId}`);
    return response.data;  // { status: 'checkedin' | 'checkout' }
  } catch (error) {
    console.error('Get goat status error:', error);
    throw error;
  }
}

  // Additional goat-specific methods
  async getGoatBreeds() {
    try {
      const response = await this.api.get('/goats/breeds');
      return response.data;
    } catch (error) {
      console.error('Get goat breeds error:', error);
      throw error;
    }
  }

  async getVaccinationHistory(goatId) {
    try {
      const response = await this.api.get(`/goats/${goatId}/vaccinations`);
      return response.data;
    } catch (error) {
      console.error('Get vaccination history error:', error);
      throw error;
    }
  }

  // Utility method example: format goat tag
  formatGoatTag(prefix, id) {
    return `${prefix}-${id.toString().padStart(4, '0')}`;
  }
}

const goatManagementService = new GoatManagementService();
export default goatManagementService;
