import jwt from 'express-jwt'

export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export const jwtCheck = jwt({
  secret: process.env.AUTH0_API_SECRET,
  audience: 'https://app.stnl.my/api',
  issuer: 'https://jtey1.us.auth0.com/',
  algorithms: [ 'HS256' ]
})
