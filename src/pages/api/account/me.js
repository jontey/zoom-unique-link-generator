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
      
      const account = await Account.findOne({
        where: {
          account_id: req.user.sub
        }
      })

      if (account) {
        return res.json({ account })
      } else {
        return res.status(404).json({ message: 'User not found' })
      }

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
        },
        params: {
          page_size: 30
        }
      })

      const account = await Account.upsert({
        zoom_client_id,
        zoom_client_secret,
        total_zoom_users: response.data.total_records,
        account_id: req.user.sub
      },{
        where: {
          account_id: req.user.sub
        },
        returning: true
      })

      if (response.data && response.data.total_records > 0) {
        const users = response.data.users.map(user => {
          const { id, first_name, last_name, email, pmi, type } = user
          return {
            user_id: id,
            first_name,
            last_name,
            email,
            pmi,
            type,
            account_id: req.user.sub
          }
        })
        ZoomUser.bulkCreate(users)
      }

      return res.json({ account: account[0] })

    } else {
      return res.status(404)
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json(e?.response?.data || e.message)
  }
}

export const config = {
  api: {
    bodyParser: true
  }
}