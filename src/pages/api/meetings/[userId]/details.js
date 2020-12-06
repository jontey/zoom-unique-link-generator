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
      
      const { userId: meetingId } = req.query

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

      const { data } = await Axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      
      const { uuid, id: meeting_id, host_id, topic, type, start_time, duration, agenda, join_url, start_url, password, settings } = data

      await ZoomMeeting.upsert({
        uuid,
        meeting_id,
        host_id,
        topic,
        meeting_type: type,
        start_time,
        duration,
        agenda,
        join_url,
        start_url,
        passcode: password,
        approval_type: settings.approval_type,
        waiting_room: settings.waiting_room
      }, {
        where: {
          uuid
        },
        returning: true
      })

      return res.json({ ok: true, meeting: data })
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