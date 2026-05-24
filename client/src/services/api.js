import axios from 'axios'

const API = axios.create({
  baseURL: 'https://billflow-saas-rm1h.onrender.com',
})

export default API