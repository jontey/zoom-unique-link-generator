import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ZoomRegistrant = sequelize.define(
    'zoom_registrant',
    {
      registrant_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      join_url: {
        type: DataTypes.TEXT
      },
      meeting_id: {
        type: DataTypes.STRING
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  ZoomRegistrant.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return ZoomRegistrant
}