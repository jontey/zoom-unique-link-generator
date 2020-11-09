import Head from 'next/head';
import Layout from '../components/layout';
import { useDispatch, useSelector } from 'react-redux'

const CLIENT_ID = process.env.ZOOM_CLIENT_ID || ''
const REDIRECT_URL = `http://localhost:3000/oauth/authorize`
const INSTALL_URL = `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`

export default function Home() {

  const accessToken = useSelector(state => state.accessToken)

  return (
    <Layout>
      <Head>
        <title>Zoom Unique Link Generator</title>
      </Head>
      {accessToken === '' ? (
        <div>
          <a href={INSTALL_URL}>Sign in with Zoom</a>
        </div>
      ) : (
        <div>
          Fetch List of Meetings from Zoom 
        </div>
      )}
    </Layout>
  );
}
