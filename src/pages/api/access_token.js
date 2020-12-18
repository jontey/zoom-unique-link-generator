import db from '@/db'
import jwt from 'jsonwebtoken'

const { Account } = db

export default async (req, res) => {
  try {

    if (req.method === 'POST') {
      
      const { token } = req.body

      const account = await Account.findOne({
        attributes: [
          'account_id'
        ], 
        where: {
          access_token: token
        }
      })

      const { account_id } = account

      const access_token = jwt.sign(
        {
          permissions: [
            'read:user',
            'write:user'
          ]
        },
        process.env.AUTH0_API_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: '5m',
          issuer: 'https://jtey1.us.auth0.com/',
          audience: [
            'https://app.stnl.my/api'
          ],
          subject: account_id
        }
      )

      return res.json({ ok: true, access_token })
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