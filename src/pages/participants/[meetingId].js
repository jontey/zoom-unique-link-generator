import { Button, IconButton } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import axios from 'axios'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Layout from '@/components/layout'
import AddParticipants from '@/components/participants/add'
import CSVUpload from '@/components/participants/csv_upload'

function Participants() {
  const router = useRouter()
  const { meetingId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const [ nextPageToken, setNextPageToken ] = useState('')
  const [ showAddParticipant, setShowAddParticipant ] = useState(false)
  const [ showAddCSVUpload, setShowAddCSVUpload ] = useState(false)
  const tableRef = createRef()

  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.back()}><ArrowBack /></IconButton>

  useEffect(() => {
    if(!showAddParticipant && !showAddCSVUpload) {
      if (tableRef.current) {
        tableRef.current.onQueryChange()
      }
    }
  }, [ showAddParticipant, showAddCSVUpload ])

  return (
    <Layout onBack={onBack}>
      <MaterialTable
        title="Meeting List"
        columns={[
          {
            title: 'Name',
            field: 'first_name'
          },
          {
            title: 'Locality',
            field: 'last_name'
          },
          {
            title: 'Email',
            field: 'email'
          },
          {
            title: 'Link',
            field: 'join_url',
            // eslint-disable-next-line react/display-name
            render: (rowData) => <Button color="primary" variant="contained" href={rowData.join_url}>Join Link</Button>
          }
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            axios.post('/api/zoom', {
              headers: {
                authorization: `Bearer ${accessToken}`
              },
              url: `/meetings/${meetingId}/registrants`,
              method: 'get',
              params: {
                status: 'approved',
                page_size: query.pageSize,
                page_number: query.page + 1,
                next_page_token: nextPageToken
              }
            }).then((response) => {
              console.log(response.data)
              if (response.data.registrants) {
                setNextPageToken(response.data.next_page_token)
                return resolve({
                  data: response.data.registrants,
                  page: response.data.page_number - 1,
                  totalCount: response.data.total_records
                })
              }
            }).catch(e => {
              console.log('[Error] fetchParticipants', e)
              return reject(e)
            })
          })
        }
        actions={[
          {
            icon: 'refresh',
            tooltip: 'Refresh Data',
            isFreeAction: true,
            onClick: () => tableRef.current && tableRef.current.onQueryChange()
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
          exportButton: true,
          actionsColumnIndex: -1,
          pageSizeOptions: [ 5,10,30 ]
        }}
        tableRef={tableRef}
      />
      <AddParticipants meetingId={meetingId} isOpen={showAddParticipant} onClose={() => setShowAddParticipant(false)}/>
      <CSVUpload meetingId={meetingId} isOpen={showAddCSVUpload} onClose={() => setShowAddCSVUpload(false)}/>
    </Layout>
  )
}

export default Participants