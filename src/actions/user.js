export const setToken = ({ accessToken, refreshToken }) => ({ type: 'SET_TOKEN', accessToken, refreshToken })
export const clearToken = () => ({ type: 'CLEAR_TOKEN' })
