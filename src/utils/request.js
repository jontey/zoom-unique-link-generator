import { setToken, clearToken } from '../actions/user'

export default function setupAxios(axios, store) {
  axios.interceptors.response.use(
    response => response,
    (error) => {
      if (!error) {
        return Promise.reject('Invalid')
      }

      try {
        const { config, response } = error
        console.log({ config, response })
        const { refreshToken } = store.getState()

        if (response.status === 401 && response.data.code === 124 && !config._retry) {
          return new Promise(function(resolve, reject) {
            axios.post('/api/oauth/refresh_token', {
              refresh_token: refreshToken
            }).then(({ data }) => {
              store.dispatch(setToken({
                accessToken: data.access_token,
                refreshToken: data.refresh_token
              }))
              config.headers['Authorization'] = 'Bearer ' + data.access_token
              config._retry = true
              return axios(config)
                .then(({ data }) => {
                  resolve(data)
                }).catch(err => {
                  reject(err)
                })
            }).catch(err => {
              console.log('[Error] retry request', err)
              store.dispatch(clearToken())
              reject(err)
            })
          })
        }
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return Promise.reject(error)
      }
    }
  )
}