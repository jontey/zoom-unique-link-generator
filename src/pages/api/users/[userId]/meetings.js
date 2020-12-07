import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import jwt from 'jsonwebtoken'
import Axios from 'axios'

const { Account, ZoomMeeting } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      const { userId, refresh } = req.query

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
     
        const fetchMeeting = ({ userId, ...params }) => {
          return Axios.get(`https://api.zoom.us/v2/users/${userId}/meetings`, {
            headers: {
              authorization: `Bearer ${token}`
            },
            params: {
              ...params
            }
          })
        }

        const meetings = []
        let total_records = 0
        const config = {
          type: 'scheduled', // scheduled, live, upcoming
          page_size: 30,
          next_page_token: undefined
        }
        do {
          const { data } = await fetchMeeting({ userId, ...config })
          meetings.push(...data.meetings)

          // Fetch next page if needed
          total_records = data.total_records
          config.next_page_token = data.next_page_token
        } while (meetings.length !== total_records)

        await Promise.all(
          meetings.map(meeting => {
            const { uuid, id: meeting_id, host_id, topic, type, start_time, duration, agenda, join_url } = meeting

            return ZoomMeeting.upsert({
              uuid,
              meeting_id,
              host_id,
              topic,
              meeting_type: type,
              start_time,
              duration,
              agenda,
              join_url
            }, {
              where: {
                uuid
              },
              returning: true
            })
          })
        )
      }

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