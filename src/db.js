import { Sequelize } from 'sequelize'
import Account from '@/models/account'
import ZoomUser from '@/models/users'

const db = {}

if (typeof window === 'undefined') {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'zulg',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    logging: false
  })

  // Load tables
  db.Account = Account(sequelize)
  db.ZoomUser = ZoomUser(sequelize)

  // Load associations
  Object.keys(db).forEach(model => {
    if (db[model].associate) {
      db[model].associate(db)
    }
  })

  sequelize.sync()

  db.sequelize = sequelize
}

export default db