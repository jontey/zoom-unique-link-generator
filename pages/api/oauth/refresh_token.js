import axios from 'axios'

const CLIENT_ID = process.env.ZOOM_CLIENT_ID
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const BASIC_AUTH_TOKEN = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, 'utf8').toString('base64')

export default async (req, res) => {
  if (req.method === 'POST') {
    const { refresh_token } = req.body

    const response = await axios.post(`https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`, {}, {
      headers: {
        'Authorization': `Basic ${BASIC_AUTH_TOKEN}`
      }
    })

    res.json(response.data)
  } else {
    return res.status(404)
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}