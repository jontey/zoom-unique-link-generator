import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { ArrowBack, AssignmentInd, HourglassEmpty, Lock } from '@material-ui/icons'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '@/components/loading'
import { DateTime } from 'luxon'

function Meetings() {
  const router = useRouter()
  const { userId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const [ meetingList, setMeetingList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const tableRef = createRef()
  
  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.back()}><ArrowBack /></IconButton>

  const fetchMeetingList = (refresh = false) => {
    setLoading(true)
    axios.get(`/api/users/${userId}/meetings`, {
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

  const fetchMeetingDetails = (meetingId) => {
    setLoading(true)
    axios.get(`/api/meetings/${meetingId}/details`, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }).then(({ data }) => {
      console.log(data)
      fetchMeetingList()
    })
  }

  // const fixMeetingPermissions = async (meetingId) => {
  //   try {
  //     await axios.post('/api/zoom', {
  //       headers: {
  //         authorization: `Bearer ${accessToken}`
  //       },
  //       url: `/meetings/${meetingId}`,
  //       method: 'patch',
  //       data: {
  //         settings: {
  //           approval_type: 1,
  //           registration_type: 1,
  //           registrants_confirmation_email: false,
  //           registrants_email_confirmation: false,
  //           show_share_button: false,
  //           allow_multiple_devices: false
  //         }
  //       }
  //     })
      
  //   } catch (e) {
  //     console.log('[Error] fixMeetingPermissions', e)
  //   }
  // }

  useEffect(() => {
    fetchMeetingList()
  }, [])

  return (
    <Layout onBack={onBack}>
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