import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { Button, IconButton } from '@material-ui/core'
import { useRouter } from 'next/router'
import Layout from '../../components/layout'
import AddParticipants from '../../components/participants/add'
import { ArrowBack } from '@material-ui/icons'

function Participants() {
  const router = useRouter()
  const { meetingId } = router.query
  const accessToken = useSelector(state => state.accessToken)
  const [ nextPageToken, setNextPageToken ] = useState('')
  const [ showAddParticipant, setShowAddParticipant ] = useState(false)
  const tableRef = createRef()

  const onBack = <IconButton style={{ color: 'white' }} onClick={() => router.push('/')}><ArrowBack /></IconButton>

  useEffect(() => {
    if(!showAddParticipant) {
      if (tableRef.current) {
        tableRef.current.onQueryChange()
      }
    }
  }, [ showAddParticipant ])

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
          }
        ]}
        options={{
          actionsColumnIndex: -1
        }}
        tableRef={tableRef}
      />
      <AddParticipants meetingId={meetingId} isOpen={showAddParticipant} onClose={() => setShowAddParticipant(false)}/>
    </Layout>
  )
}

export default Participants