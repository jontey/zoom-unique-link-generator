import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Account = sequelize.define(
    'account',
    {
      zoom_client_id: {
        type: DataTypes.STRING
      },
      zoom_client_secret: {
        type: DataTypes.STRING
      },
      total_zoom_users: {
        type: DataTypes.INTEGER
      },
      access_token: {
        type: DataTypes.STRING
      },
      account_id: {
        type: DataTypes.STRING,
        primaryKey: true
      }
    },
    {
      defaultScope: {
        attributes: {
          exclude: [
            'zoom_client_secret'
          ]
        }
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  Account.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // Account.hasMany(models.ZoomUser, { targetKey: 'account_id', foreignKey: 'account_id' })
  }

  return Account
}