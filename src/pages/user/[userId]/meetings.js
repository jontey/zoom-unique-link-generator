import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { Backdrop, Button, IconButton, Tooltip, CircularProgress, Typography, makeStyles } from '@material-ui/core'
import { ArrowBack, AssignmentInd, HourglassEmpty, Lock } from '@material-ui/icons'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '@/components/loading'
import { DateTime } from 'luxon'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.modal + 1,
    color: '#fff'
  }
}))


function Meetings() {
  const router = useRouter()
  const classes = useStyles()
  const { userId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const { enqueueSnackbar } = useSnackbar()
  const [ meetingList, setMeetingList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ title, setTitle ] = useState('')
  const [ currentIndex, setCurrentIndex ] = useState(0)
  const [ fetchAllMeetingDetailsLoading, setFetchAllMeetingDetailsLoading ] = useState(false)
  const tableRef = createRef()
  
  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.back()}><ArrowBack /></IconButton>

  const fetchMeetingList = (refresh = false) => {
    setLoading(true)
    return axios.get(`/api/users/${userId}/meetings`, {
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      params: {
        refresh
      }
    }).then(({ data })=> {
      setMeetingList(data)
    }).catch(e => {
      console.log('[Error] fetch Zoom Users', e)
    }).finally(() => {
      setLoading(false)
    })
  }

  const fetchMeetingDetails = (meetingId, reloadAfter = true) => {
    setLoading(true)
    return axios.get(`/api/meetings/${meetingId}/details`, {
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      params:{
        refresh: true
      }
    }).then(() => {
      if (reloadAfter)
        fetchMeetingList()
    }).catch(() => {
      enqueueSnackbar(`Can't find meeting details for ${meetingList.find(e => e.meeting_id === meetingId).topic}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })

    })
  }

  const fetchAllMeetingDetails = async () => {
    setFetchAllMeetingDetailsLoading(true)
    for (let i=0; i<meetingList.length; i++) {
      await fetchMeetingDetails(meetingList[i].meeting_id, false)
      setCurrentIndex(i+1)
    }
    setFetchAllMeetingDetailsLoading(false)
    fetchMeetingList()
  }

  const enableRegistration = async (meetingId) => {
    try {
      await axios.patch(`/api/meetings/${meetingId}`, {
        settings: {
          approval_type: 1,
          registration_type: 1,
          registrants_confirmation_email: false,
          registrants_email_confirmation: false,
          show_share_button: false,
          allow_multiple_devices: false
        }
      }, {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })
      fetchMeetingDetails(meetingId)
      
    } catch (e) {
      console.log('[Error] fixMeetingPermissions', e)
    }
  }

  useEffect(() => {
    fetchMeetingList()
    axios.get('/api/users/', {
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      params: {
        user_id: userId
      }
    }).then(({ data }) => {
      setTitle(`${data.first_name} ${data.last_name}`)
    })
  }, [])

  return (
    <Layout
      title={title}
      onBack={onBack}
    >
      <MaterialTable
        title="Meeting List"
        columns={[
          {
            title: 'Title',
            field: 'topic'
          },
          {
            title: 'Start Time',
            field: 'start_time',
            render: rowData => {
              const dt = DateTime.fromISO(rowData.start_time)
              return dt.toLocaleString(DateTime.DATETIME_SHORT)
            },
            customSort: (a, b) => DateTime.fromISO(a.start_time) - DateTime.fromISO(b.start_time),
            defaultSort: 'desc'
          },
          {
            title: 'Duration',
            field: 'duration'
          },
          {
            title: 'Features',
            field: 'approval_type',
            // eslint-disable-next-line react/display-name
            render: rowData => {
              return (
                <>
                  {rowData.waiting_room && (
                    <Tooltip title="Waiting Room Enabled">
                      <IconButton>
                        <HourglassEmpty />
                      </IconButton>
                    </Tooltip>
                  )}
                  {rowData.passcode && (
                    <Tooltip title="Passcode Enabled">
                      <IconButton>
                        <Lock />
                      </IconButton>
                    </Tooltip>
                  )}
                  {[ 0,1 ].includes(rowData.approval_type) && (
                    <Tooltip title="Registration Enabled">
                      <IconButton onClick={() => router.push(`/meeting/${rowData.meeting_id}/registrants`)}>
                        <AssignmentInd style={{ color: 'green' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )
            }
          },
          {
            title: 'Host Link',
            field: 'start_url',
            // eslint-disable-next-line react/display-name
            render: (rowData) => <Button color="secondary" variant="contained" href={rowData.start_url}>Start Link</Button>
          },
          {
            title: 'Link',
            field: 'join_url',
            // eslint-disable-next-line react/display-name
            render: (rowData) => <Button color="primary" variant="contained" href={rowData.join_url}>Join Link</Button>
          }
        ]}
        data={meetingList}
        actions={[
          {
            icon: 'refresh',
            tooltip: 'Fetch new meetings from Zoom',
            isFreeAction: true,
            onClick: () => fetchMeetingList(true)
          },
          {
            icon: 'update',
            tooltip: 'Fetch all meeting settings',
            isFreeAction: true,
            onClick: () => fetchAllMeetingDetails()
          },
          rowData => ({
            icon: 'how_to_reg',
            tooltip: 'Enable Registration',
            onClick: (event, rowData) => {
              const confirm = window.confirm('Are you sure you want to enable registration for this meeting?')
              if (confirm) {
                enableRegistration(rowData.meeting_id)
              }
            },
            disabled: [ 0,1 ].includes(rowData.approval_type)
          }),
          {
            icon: 'update',
            tooltip: 'Fetch meeting settings',
            onClick: (event, rowData) => fetchMeetingDetails(rowData.meeting_id)
          }
        ]}
        options={{
          actionsColumnIndex: -1,
          rowStyle: rowData => {
            const dtEnd = DateTime.fromISO(rowData.start_time).plus({ minutes: rowData.duration })
            const dtNow = DateTime.local()
            return {
              opacity: dtEnd < dtNow ? '0.6' : '1'
            }
          }
        }}
        isLoading={loading}
        tableRef={tableRef}
      />
      <Backdrop className={classes.backdrop} open={fetchAllMeetingDetailsLoading}>
        <>
          <CircularProgress color="inherit" />
          <Typography>
            Fetching {currentIndex} of {meetingList.length}
          </Typography>
        </>
      </Backdrop>
    </Layout>
  )
}

export default withAuthenticationRequired(Meetings, {
  // eslint-disable-next-line react/display-name
  onRedirecting: () => <Loading open={true} />,
  loginOptions: {
    appState: {
      returnTo: '/admin'
    }
  }
})