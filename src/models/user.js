import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ZoomUser = sequelize.define(
    'zoom_user',
    {
      user_id: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      type: {
        type: DataTypes.INTEGER
      },
      pmi: {
        type: DataTypes.STRING
      },
      account_id: {
        type: DataTypes.STRING
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: [ 'user_id', 'account_id' ]
        }
      ]
    }
  )

  // eslint-disable-next-line no-unused-vars
  ZoomUser.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // ZoomUser.belongsTo(models.Account, { sourceKey: 'account_id', foreignKey: 'account_id' })
    // ZoomUser.hasMany(models.ZoomMeeting, { targetKey: 'host_id', foreignKey: 'user_id' })
  }

  return ZoomUser
}