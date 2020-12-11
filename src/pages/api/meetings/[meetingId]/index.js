import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import Axios from 'axios'
import jwt from 'jsonwebtoken'

const { Account } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    const { meetingId } = req.query

    if (req.method === 'PATCH') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))

      const account = await Account.findOne({
        attributes: [
          'zoom_client_id',
          'zoom_client_secret'
        ], 
        where: {
          account_id: req.user.sub
        }
      })

      const { zoom_client_id, zoom_client_secret } = account

      const token = jwt.sign(
        {
          iss: zoom_client_id
        }, 
        zoom_client_secret,{
          expiresIn: '5m',
          noTimestamp: true
        }
      )

      const { data } = await Axios.patch(`https://api.zoom.us/v2/meetings/${meetingId}`,
        req.body,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        })

      return res.json(data || [])
    } else {
      return res.status(404)
    }
  } catch (e) {
    if (e?.response?.status) {
      return res.status(e.response.status).json(e.response.data)
    }
    return res.status(500).json(e.message)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}