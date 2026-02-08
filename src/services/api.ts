import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  // Garanta que a porta é a mesma que seu backend está rodando (ex: 3333)
  baseURL: 'http://localhost:3333', 
})

// --- O SEGREDO ESTÁ AQUI ---
// Antes de cada requisição, o axios vai rodar essa função:
api.interceptors.request.use((config) => {
  // 1. Tenta pegar o token salvo nos cookies
  const token = Cookies.get('token')

  // 2. Se tiver token, adiciona no cabeçalho "Authorization"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api