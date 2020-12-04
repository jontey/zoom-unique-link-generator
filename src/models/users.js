import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ZoomUser = sequelize.define(
    'zoom_user',
    {
      user_id: {
        type: DataTypes.STRING,
        unique: 'user_ownerIndex'
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
      user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'user_ownerIndex'
      }
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  ZoomUser.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ZoomUser.belongsTo(models.Account)
  }

  return ZoomUser
}