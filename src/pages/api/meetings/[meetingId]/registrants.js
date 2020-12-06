import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import Axios from 'axios'
import jwt from 'jsonwebtoken'

const { Account, ZoomRegistrant } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      const { meetingId, refresh } = req.query

      console.log(refresh)

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

        const fetchRegistrants = ({ meetingId, ...params }) => {
          return Axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, {
            headers: {
              authorization: `Bearer ${token}`
            },
            params: {
              ...params
            }
          })
        }

        const registrants = []
        let total_records = 0
        const config = {
          status: 'approved', // pending, approved, denied
          page_size: 30,
          next_page_token: undefined
        }
        do {
          const { data } = await fetchRegistrants({ meetingId, ...config })
          registrants.push(...data.registrants)

          // Fetch next page if needed
          total_records = data.total_records
          config.next_page_token = data.next_page_token
        } while (registrants.length !== total_records)

        await Promise.all(
          registrants.map(registrant => {
            const { id: registrant_id, email, first_name, last_name, status, join_url } = registrant

            return ZoomRegistrant.upsert({
              registrant_id,
              email,
              first_name,
              last_name,
              status,
              join_url,
              meeting_id: meetingId
            }, {
              where: {
                registrant_id
              }
            })
          })
        )
      }

      const data = await ZoomRegistrant.findAll({
        where: {
          meeting_id: meetingId
        }
      })
      
      return res.json(data || [])
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