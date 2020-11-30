import { Sequelize } from 'sequelize'

let sequelize

if (typeof window === 'undefined') {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  })

  sequelize.authenticate().then(() => {
    console.log('[INFO] db.js:', 'Success')
  })
}

export default sequelize