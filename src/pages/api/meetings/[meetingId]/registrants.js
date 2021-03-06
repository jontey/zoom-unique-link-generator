import db from '@/db'
import jwtAuthz from 'express-jwt-authz'
import { runMiddleware, jwtCheck } from '@/utils/middlewares'
import Axios from 'axios'
import jwt from 'jsonwebtoken'

const { Account, ZoomRegistrant } = db

export default async (req, res) => {
  try {
    await runMiddleware(req, res, jwtCheck)

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

    const { meetingId, refresh, status } = req.query

    if (req.method === 'GET') {
      await runMiddleware(req, res, jwtAuthz([ 'read:user' ], { customScopeKey: 'permissions' }))
      
      if (refresh == 'true') {
        const fetchRegistrants = ({ meetingId, params }) => {
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
        let count = 0
        const params = {
          status: status || 'approved', // pending, approved, denied
          page_size: 30,
          next_page_token: undefined
        }
        do {
          const { data } = await fetchRegistrants({ meetingId, params })
          registrants.push(...data.registrants)
    
          // Fetch next page if needed
          total_records = data.total_records
          params.next_page_token = data.next_page_token
          count++
        } while (registrants.length !== total_records && count < 100)

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

      const zoomRegistrantOptions = {
        where: {
          meeting_id: meetingId
        }
      }

      if (status) {
        zoomRegistrantOptions.where.status = status
      }

      const data = await ZoomRegistrant.findAll(zoomRegistrantOptions)
      
      return res.json(data || [])
    } else if (req.method === 'POST') {
      await runMiddleware(req, res, jwtAuthz([ 'write:user' ], { customScopeKey: 'permissions' }))

      // Unpack data
      const { email, first_name, last_name } = req.body
      
      const { data } = await Axios.post(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, {
        email: email == '' || !email ? `${first_name}.${last_name}@stnl.my`.toLowerCase().replace(/[\s,-]/g,'') : email,
        first_name,
        last_name,
        auto_approve: true
      },
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (data) {
        const { id: meeting_id, join_url, registrant_id } = data
        await ZoomRegistrant.create({
          meeting_id,
          registrant_id,
          email: email == '' || !email ? `${first_name}.${last_name}@stnl.my`.toLowerCase().replace(/[\s,-]/g,'') : email,
          first_name,
          last_name,
          status: 'approved',
          join_url
        })
      }

      return res.json(data)

    } else if (req.method === 'PUT') {
      await runMiddleware(req, res, jwtAuthz([ 'write:user' ], { customScopeKey: 'permissions' }))
      
      // Unpack data
      const { action, registrants } = req.body
      
      const { status } = await Axios.put(`https://api.zoom.us/v2/meetings/${meetingId}/registrants/status`, {
        action,
        registrants
      },
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      })

      if (status == 204) {
        let statusMap = {
          approve: 'approved',
          cancel: 'denied',
          deny: 'denied'
        }
        await Promise.all(
          registrants.map(({ id: registrant_id }) => {
            return ZoomRegistrant.update({
              status: statusMap[action]
            }, {
              where: {
                registrant_id
              }
            })
          })
        )
      }

      return res.json({ ok: true })

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