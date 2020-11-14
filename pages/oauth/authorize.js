// Receive authorization grant from User
// Next step to request for access token from https://zoom.us/oauth/token
import { useRouter } from 'next/router'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setToken } from '../../src/actions/user'

export default function Authorize ({ REDIRECT_URL }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { query } = router  
  // const [ accessToken, setAccessToken ] = useState('')
  const accessToken = useSelector(state => state.accessToken)

  useEffect(() => {
    if (!Object.keys(query).length > 0) {
      return
    }
    const { state, code } = query
    axios.post('/api/oauth/access_token', {
      code,
      state,
      redirect_uri: REDIRECT_URL
    }).then((response) => {
      // setAccessToken(response.data)
      dispatch(setToken({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      }))
    }).catch(e => {
      console.log('[Error] authorize.js', e)
    }).finally(() => {
      router.push('/')
    })
  }, [ query ])

  return (
    <div>
      { accessToken === '' ? 'Fetching access token...' : 'Redirecting back to app' }
    </div>
  )
}

export const getStaticProps = () => {
  const REDIRECT_URL = process.env.ZOOM_REDIRECT_URL || 'http://localhost:3000/oauth/authorize'
  return {
    props: {
      REDIRECT_URL
    }
  }
}