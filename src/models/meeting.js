import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ZoomMeeting = sequelize.define(
    'zoom_meeting',
    {
      uuid: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      meeting_id: {
        type: DataTypes.STRING
      },
      host_id: {
        type: DataTypes.STRING
      },
      topic: {
        type: DataTypes.STRING
      },
      agenda: {
        type: DataTypes.TEXT
      },
      start_time: {
        type: DataTypes.DATE
      },
      duration: {
        type: DataTypes.INTEGER
      },
      meeting_type: {
        type: DataTypes.INTEGER
      },
      start_url: {
        type: DataTypes.TEXT
      },
      join_url: {
        type: DataTypes.STRING
      },
      passcode: {
        type: DataTypes.STRING
      },
      approval_type: {
        type: DataTypes.INTEGER
      },
      waiting_room: {
        type: DataTypes.BOOLEAN
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  ZoomMeeting.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // ZoomMeeting.belongsTo(models.ZoomUser, { targetKey: 'user_id', foreignKey: 'host_id' })
  }

  return ZoomMeeting
}