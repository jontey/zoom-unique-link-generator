import axios from 'axios'

const ZOOM_API_URL = "https://api.zoom.us/v2"

const request = axios.create({
  baseURL: ZOOM_API_URL
})

export default async (req, res) => {
  if (req.method === 'POST') {
    const { method, url, params, data, headers } = req.body
    const { authorization } = headers

    const response = await request({
      headers: {
        authorization
      },
      url,
      params,
      method,
      data
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