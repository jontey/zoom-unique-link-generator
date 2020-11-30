import axios from 'axios'
import db from '@/utils/db'

const ZOOM_API_URL = 'https://api.zoom.us/v2'

const request = axios.create({
  baseURL: ZOOM_API_URL
})

export default async (req, res) => {
  if (req.method === 'POST') {
    const { method, url, params, data, headers } = req.body
    const { authorization } = headers

    await db.authenticate

    try {
      const response = await request({
        headers: {
          authorization
        },
        url,
        params,
        method,
        data
      })

      return res.status(response.status).json(response.data)
    } catch (e) {
      console.log('[Error] zoom.js', e.response)
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