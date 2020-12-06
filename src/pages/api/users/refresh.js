import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import Axios from 'axios'
import jwt from 'jsonwebtoken'

const { Account, ZoomUser } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
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

      const { data } = await Axios.get('https://api.zoom.us/v2/users', {
        headers: {
          authorization: `Bearer ${token}`
        },
        params: {
          page_size: 300
        }
      })

      if (data && data.total_records > 0) {
        const users = data.users.map(async user => {
          const { id, first_name, last_name, email, pmi, type } = user

          return await ZoomUser.upsert({
            user_id: id,
            first_name,
            last_name,
            email,
            pmi,
            type,
            account_id: req.user.sub
          }, {
            where: {
              user_id: id,
              account_id: req.user.sub
            },
            returning: true
          })
        })
        return res.json({ ok: true, count: users.length })
      }

      return res.json({ ok: true })

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