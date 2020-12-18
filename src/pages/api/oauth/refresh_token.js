import axios from 'axios'

const CLIENT_ID = process.env.ZOOM_CLIENT_ID
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const BASIC_AUTH_TOKEN = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, 'utf8').toString('base64')

export default async (req, res) => {
  if (req.method === 'POST') {
    const { refresh_token } = req.body

    try {
      const response = await axios.post(`https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`, {}, {
        headers: {
          'Authorization': `Basic ${BASIC_AUTH_TOKEN}`
        },
        _retry: true
      })

      res.json(response.data)
    } catch (e) {
      console.log('[Error] refresh_token.js', e)
      return res.status(e.status).json(e.data)
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