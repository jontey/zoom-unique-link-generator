import axios from 'axios'

const CLIENT_ID = process.env.ZOOM_CLIENT_ID
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const BASIC_AUTH_TOKEN = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, 'utf8').toString('base64')

export default async (req, res) => {
  if (req.method === 'POST') {
    const { code, redirect_uri } = req.body

    try {
      const response = await axios.post(`https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`, {}, {
        headers: {
          'Authorization': `Basic ${BASIC_AUTH_TOKEN}`
        }
      })

      res.json(response.data)
    } catch (e) {
      console.log('[Error] access_token.js', e)
      return res.status(e.response.status).json(e.response.data)
    }
  } else {
    return res.status(404)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}