import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import Axios from 'axios'
import jwt from 'jsonwebtoken'

const { Account, ZoomMeeting } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'write:user' ], { customScopeKey: 'permissions' }))
      
      const { userId } = req.query

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
        page_size: 1,
        next_page_token: undefined,
        page_number: undefined
      }
      do {
        const { data } = await fetchMeeting({ userId, ...config })
        meetings.push(...data.meetings)

        // Fetch next page if needed
        total_records = data.total_records
        config.next_page_token = data.next_page_token
        config.page_number = data.page_number
      } while (meetings.length !== total_records)

      await Promise.all(
        meetings.map(async meeting => {
          const { uuid, id: meeting_id, host_id, topic, type, start_time, duration, agenda, join_url } = meeting

          return await ZoomMeeting.upsert({
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

      return res.json({ ok: true, count: meetings.length })
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