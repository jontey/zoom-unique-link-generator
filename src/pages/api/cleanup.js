import db from '@/db'
import { Op } from 'sequelize'
import { DateTime } from 'luxon'

const { ZoomMeeting, ZoomRegistrant } = db

export default async (req, res) => {
  try {

    if (req.method === 'GET') {
      if (req.query.token !== '3ea30421-1470-40cf-ab6b-94d1b60fe5ea') return res.status(401).send('Invalid token')

      const meetingList = await ZoomMeeting.findAll({
        attributes: [
          'meeting_id'
        ], 
        where: {
          start_time: {
            [Op.lte]: DateTime.now().minus({ days: 7 }).toJSDate()
          } 
        }
      })

      const meetings = meetingList.map(m => m.meeting_id)

      if (meetings.length) {
        await ZoomRegistrant.destroy({
          where: {
            meeting_id: meetings
          }
        })
        await ZoomMeeting.destroy({
          where: {
            meeting_id: meetings
          }
        })
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