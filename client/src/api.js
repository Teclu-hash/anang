import axios from 'axios'

//all requests go to the express server
const api = axios.create({
    baseURL: 'http://localhost:3006/api'
})

export default api
