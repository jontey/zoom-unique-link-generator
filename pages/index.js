import Layout from '../components/layout';
import { useSelector } from 'react-redux'
import Meetings from '../components/zoom/meetings'
import { Button } from '@material-ui/core';

export default function Home({ INSTALL_URL }) {

  const accessToken = useSelector(state => state.accessToken)

  return (
    <Layout>
      {accessToken === '' ? (
        <div>
          <Button href={INSTALL_URL} variant="contained" color="primary">
            Sign in with Zoom
          </Button>
          
        </div>
      ) : (
        <Meetings />
      )}
    </Layout>
  );
}

export const getStaticProps = (ctx) => {
  
  const CLIENT_ID = process.env.ZOOM_CLIENT_ID || ''
  const REDIRECT_URL = `http://localhost:3000/oauth/authorize`
  return {
    props: {
      INSTALL_URL:`https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`
    }
  }
}