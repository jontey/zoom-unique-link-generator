import { setToken, clearToken } from '../actions/user'

export default function setupAxios(axios, store) {
  axios.interceptors.response.use(
    response => response,
    async (error) => {
      if (!error) {
        return Promise.reject('Invalid')
      }

      const originalRequest = error.config

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        const { refreshToken } = store.getState()
        try {
          const resultToken = await axios.post('/api/oauth/refresh_token', {
            refresh_token: refreshToken
          })         
          store.dispatch(setToken({
            accessToken: resultToken.data.access_token,
            refreshToken: resultToken.data.refresh_token
          }))
          axios.defaults.headers['Authorization'] = 'Bearer ' + resultToken.data.accessToken
          return axios(originalRequest)
        } catch (e) {
          console.log('[Error] retry request', e)
          store.dispatch(clearToken())
        }
      }
      return Promise.reject(error)
    }
  )
}