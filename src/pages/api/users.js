import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'

const { ZoomUser } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      const zoomUsers = await ZoomUser.findAll({
        where: {
          user: req.user.sub
        }
      })
      return res.json({ users: zoomUsers })
    } else {
      return res.status(404)
    }
  } catch (e) {
    return res.status(500).json(e.message)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}