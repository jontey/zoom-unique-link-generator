import Layout from '../components/layout'
import { useSelector } from 'react-redux'
import Meetings from '../components/zoom/meetings'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  login: {
    textAlign: 'center',
    height: '100vh'
  }
}))

export default function Home({ INSTALL_URL }) {
  const classes = useStyles()

  const accessToken = useSelector(state => state.accessToken)

  return (
    <Layout>
      {accessToken === '' ? (
        <div className={classes.login}>
          <Button href={INSTALL_URL} variant="contained" color="primary">
            Sign in with Zoom
          </Button>
          
        </div>
      ) : (
        <Meetings />
      )}
    </Layout>
  )
}

export const getStaticProps = () => {
  
  const CLIENT_ID = process.env.ZOOM_CLIENT_ID || ''
  const REDIRECT_URL = 'http://localhost:3000/oauth/authorize'
  return {
    props: {
      INSTALL_URL:`https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
    }
  }
}