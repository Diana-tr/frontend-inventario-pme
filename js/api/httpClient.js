// Archivo: httpClient.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const token = localStorage.getItem('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || JSON.stringify(data) || 'Error en la petición del servidor');
        }

        return data;
    } catch (error) {
        console.error(`Error en la petición a ${url}:`, error);
        throw error;
    }
}