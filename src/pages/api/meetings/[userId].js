import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'

const { ZoomMeeting } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      const { userId } = req.query

      const data = await ZoomMeeting.findAll({
        where: {
          host_id: userId
        }
      })
      
      return res.json(data || [])
    } else {
      return res.status(404)
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json(e.message)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}