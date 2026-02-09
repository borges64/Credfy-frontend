import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
    baseURL: 'http://localhost:3333' // Confirme se a porta é 3333 mesmo
})

// --- O SEGREDO ESTÁ AQUI ---
// Antes de cada requisição, o axios injeta o token
api.interceptors.request.use((config) => {
    const token = Cookies.get('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
