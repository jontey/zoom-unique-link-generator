import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import jwt from 'jsonwebtoken'
import Axios from 'axios'

const { Account, ZoomUser } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      const [ account ] = await Account.findOrCreate({
        where: {
          user: req.user.sub
        }
      })
      return res.json({ account })

    } else if (req.method === 'POST') {
      await runMiddleware(req, res, jwtAuthz([ 'write:user' ], { customScopeKey: 'permissions' }))

      const { zoom_client_id, zoom_client_secret } = req.body

      // Test connection to Zoom
      const token = jwt.sign(
        {
          iss: zoom_client_id
        }, 
        zoom_client_secret,{
          expiresIn: '5m',
          noTimestamp: true
        }
      )

      const response = await Axios.get('https://api.zoom.us/v2/users', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      const account = await Account.update({
        zoom_client_id,
        zoom_client_secret,
        total_zoom_users: response.data.total_records
      },{
        where: {
          user: req.user.sub
        },
        returning: true
      })

      if (response.data && response.data.total_records > 0) {
        const users = response.data.users.map(user => {
          const { id, first_name, last_name, email, pmi } = user
          return {
            user_id: id,
            first_name,
            last_name,
            email,
            pmi,
            user: req.user.sub
          }
        })
        ZoomUser.bulkCreate(users)
      }

      return res.json({ account: account[1][0] })

    } else {
      return res.status(404)
    }
  } catch (e) {
    return res.status(500).json(e.response.data || e.message)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}