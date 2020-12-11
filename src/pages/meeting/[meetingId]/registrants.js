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
import AddParticipants from '@/components/participants/add'
import CSVUpload from '@/components/participants/csv_upload'

function Registrants() {
  const router = useRouter()
  const { meetingId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const [ registrantList, setRegistrantList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ showAddParticipant, setShowAddParticipant ] = useState(false)
  const [ showAddCSVUpload, setShowAddCSVUpload ] = useState(false)
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

  useEffect(() => {
    if(!showAddParticipant && !showAddCSVUpload) {
      fetchRegistrantList()
    }
  }, [ showAddParticipant, showAddCSVUpload ])

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
            title: 'Email',
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
          },
          {
            icon: 'add',
            tooltip: 'Add User',
            isFreeAction: true,
            onClick: () => setShowAddParticipant(true)
          },
          {
            icon: 'upload',
            tooltip: 'Upload CSV',
            isFreeAction: true,
            onClick: () => setShowAddCSVUpload(true)
          }
        ]}
        options={{
          actionsColumnIndex: -1,
          pageSizeOptions: [ 5, 10, 20, 50, { value: registrantList.length || 0, label: 'All' } ]
        }}
        isLoading={loading}
        tableRef={tableRef}
      />
      <AddParticipants meetingId={meetingId} isOpen={showAddParticipant} onClose={() => setShowAddParticipant(false)}/>
      <CSVUpload meetingId={meetingId} isOpen={showAddCSVUpload} onClose={() => setShowAddCSVUpload(false)}/>
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