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
      
      const { refresh } = req.query

      if (refresh == 'true') {
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
          await Promise.all(data.users.map(user => {
            const { id, first_name, last_name, email, pmi, type } = user
  
            return ZoomUser.upsert({
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
          }))
        }
      }

      const zoomUsers = await ZoomUser.findAll({
        where: {
          account_id: req.user.sub
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