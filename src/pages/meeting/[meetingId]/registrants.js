import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { ArrowBack, Block, Check, IndeterminateCheckBox } from '@material-ui/icons'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '@/components/loading'
import AddParticipants from '@/components/participants/add'
import CSVUpload from '@/components/participants/csv_upload'
import { useSnackbar } from 'notistack'

function Registrants() {
  const router = useRouter()
  const { meetingId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const { enqueueSnackbar } = useSnackbar()
  const [ registrantList, setRegistrantList ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ showAddParticipant, setShowAddParticipant ] = useState(false)
  const [ showAddCSVUpload, setShowAddCSVUpload ] = useState(false)
  const [ title, setTitle ] = useState('')
  const tableRef = createRef()

  useEffect(() => {
    axios.get(`/api/meetings/${meetingId}/details`, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
      .then(({ data }) => {
        setTitle(data.meeting.topic)
      })
  }, [])

  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.back()}><ArrowBack /></IconButton>

  const fetchRegistrantList = (refresh = false) => {
    setLoading(true)

    Promise.all(
      [ 'pending', 'approved', 'denied' ].map((status)=> {
        return axios.get(`/api/meetings/${meetingId}/registrants`, {
          headers: {
            authorization: `Bearer ${accessToken}`
          },
          params: {
            status,
            refresh
          }
        }).then(({ data })=> {
          return data
        }).catch(e => {
          console.log('[Error] fetch Zoom registrant', e)
        })
      })
    ).then((registrants) => {
      setRegistrantList(registrants.flat())
    }).catch(({ response, message }) => {
      enqueueSnackbar(`${response.data.message || message}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }).finally(() => {
      setLoading(false)
    })
  }

  const updateRegistrantStatus = ({ action, registrants }) => {
    axios.put(`/api/meetings/${meetingId}/registrants`, {
      action,
      registrants: registrants.map(r => ({ id: r.registrant_id, email: r.email }))
    }, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }).then(() => {
      fetchRegistrantList()
    }).catch(e => {
      console.log('[Error] fetch Zoom Users', e)
    })
  }

  useEffect(() => {
    if(!showAddParticipant && !showAddCSVUpload) {
      fetchRegistrantList()
    }
  }, [ showAddParticipant, showAddCSVUpload ])

  return (
    <Layout title={title} onBack={onBack}>
      <MaterialTable
        title="Registrant List"
        columns={[
          {
            title: 'Registrant Id',
            field: 'registrant_id',
            hidden: true,
            export: true
          },
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
                      <IndeterminateCheckBox/>
                    </Tooltip>
                  )}
                  {rowData.status === 'denied' && (
                    <Tooltip title="Denied">
                      <Block/>
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
          },
          rowData => {
            return rowData.status !== 'approved' ?
              {
                icon: 'check',
                tooltip: 'Mark approved',
                onClick: () => updateRegistrantStatus({ action:'approve', registrants: [ rowData ] })
              } : 
              {
                icon: 'clear',
                tooltip: 'Mark denied',
                onClick: () => updateRegistrantStatus({ action:'cancel', registrants: [ rowData ] })
              }
          }
        ]}
        options={{
          exportButton: true,
          exportAllData: true,
          exportFileName: `Registrants_${meetingId}`,
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