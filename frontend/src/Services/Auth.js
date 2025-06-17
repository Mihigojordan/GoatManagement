import axios from 'axios';

class AdminService {
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

    async login(email, password) {
        try {
            const response = await this.api.post('/admin/login', { email, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await this.api.get('/admin/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const response = await this.api.post('/admin/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async editProfile(profileData) {
        try {
            const response = await this.api.put('/admin/edit-profile', profileData);
            return response.data.updatedAdmin;
        } catch (error) {
            console.error('Edit profile error:', error);
            throw error;
        }
    }

    async isAuthenticated() {
        try {
            await this.getProfile();
            return true;
        } catch (error) {
            return false;
        }
    }

    async getReservations() {
        try {
            const response = await this.api.get('/admin/reservations');
            return response.data;
        } catch (error) {
            console.error('Get reservations error:', error);
            throw error;
        }
    }

    // New method to lock the admin session
    async lock() {
        try {
            const response = await this.api.post('/admin/lock');
            return response.data;
        } catch (error) {
            console.error('Lock error:', error);
            throw error;
        }
    }

    // New method to unlock the admin session
    async unlock(password) {
        try {
            const response = await this.api.post('/admin/unlock', { password });
            return response.data;
        } catch (error) {
            console.error('Unlock error:', error);
            throw error;
        }
    }

    getInitials(name) {
        if (!name || typeof name !== 'string') {
            return '';
        }

        const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
        const initials = nameParts
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();

        return initials;
    }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;