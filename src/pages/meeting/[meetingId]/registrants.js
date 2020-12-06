import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { ArrowBack, Check } from '@material-ui/icons'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '@/components/loading'

function Registrants() {
  const router = useRouter()
  const { meetingId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const [ registrantList, setRegistrantList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const tableRef = createRef()
  
  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.back()}><ArrowBack /></IconButton>

  const fetchRegistrantList = (refresh = false) => {
    setLoading(true)

    axios.get(`/api/meetings/${meetingId}/registrants`, {
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      params: {
        refresh
      }
    }).then(({ data })=> {
      setRegistrantList(data)
    }).catch(e => {
      console.log('[Error] fetch Zoom Users', e)
    }).finally(() => {
      setLoading(false)
    })
  }

  // const refreshMeeting = () => {
  //   setLoading(true)
  //   axios.get(`/api/users/${meetingId}/refresh`, {
  //     headers: {
  //       authorization: `Bearer ${accessToken}`
  //     }
  //   }).then(() => {
  //     fetchregistrantList()
  //   })
  // }

  useEffect(() => {
    fetchRegistrantList()
  }, [])

  return (
    <Layout onBack={onBack}>
      <MaterialTable
        title="Registrant List"
        columns={[
          {
            title: 'First Name',
            field: 'first_name'
          },
          {
            title: 'Last Name',
            field: 'last_name'
          },
          {
            title: 'email',
            field: 'email'
          },
          {
            title: 'Status',
            field: 'status',
            // eslint-disable-next-line react/display-name
            render: rowData => {
              return (
                <>
                  {rowData.status === 'approved' && (
                    <Tooltip title="Approved">
                      <Check/>
                    </Tooltip>
                  )}
                  {rowData.status === 'pending' && (
                    <Tooltip title="Pending">
                      <Check/>
                    </Tooltip>
                  )}
                  {rowData.status === 'denied' && (
                    <Tooltip title="Denied">
                      <Check/>
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
        data={registrantList}
        actions={[
          {
            icon: 'refresh',
            tooltip: 'Fetch registrants from Zoom',
            isFreeAction: true,
            onClick: () => fetchRegistrantList(true)
          // },
          // {
          //   icon: 'group',
          //   tooltip: 'Edit Participants',
          //   onClick: (event, rowData) => {
          //     router.push(`/participants/${rowData.id}`)
          //   }
          // },
          // {
          //   icon: 'settings',
          //   tooltip: 'Fix Meeting Settings',
          //   onClick: (event, rowData) => {
          //     const confirm = window.confirm('Are you sure you want to enable registration for this meeting?')
          //     if (confirm) {
          //       fixMeetingPermissions(rowData.id)
          //     }
          //   }
          }
        ]}
        options={{
          actionsColumnIndex: -1
        }}
        isLoading={loading}
        tableRef={tableRef}
      />
    </Layout>
  )
}

export default withAuthenticationRequired(Registrants, {
  // eslint-disable-next-line react/display-name
  onRedirecting: () => <Loading open={true} />,
  loginOptions: {
    appState: {
      returnTo: '/admin'
    }
  }
})