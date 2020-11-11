import axios from 'axios'
import { createRef, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'

function Meetings() {
  const router = useRouter()
  const accessToken = useSelector(state => state.accessToken)
  const [ nextPageToken, setNextPageToken ] = useState('')
  const tableRef = createRef()

  return (
    <MaterialTable
      title="Meeting List"
      columns={[
        {
          title: 'Title',
          field: 'topic'
        },
        {
          title: 'Start Time',
          field: 'start_time'
        },
        {
          title: 'Link',
          field: 'join_url'
        }
      ]}
      data={query =>
        new Promise((resolve, reject) => {
          axios.post('/api/zoom', {
            headers: {
              authorization: `Bearer ${accessToken}`
            },
            url: '/users/me/meetings',
            method: 'get',
            params: {
              type: 'upcoming',
              page_size: query.pageSize,
              page_number: query.page + 1,
              next_page_token: nextPageToken
            }
          }).then((response) => {
            console.log(response.data)
            if (response.data.meetings) {
              setNextPageToken(response.data.next_page_token)
              return resolve({
                data: response.data.meetings,
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
          onClick: () => alert('You want to add a new row')
        },
        {
          icon: 'group',
          tooltip: 'Edit Participants',
          onClick: (event, rowData) => {
            router.push(`/participants/${rowData.id}`)
          }
        }
      ]}
      options={{
        actionsColumnIndex: -1
      }}
      tableRef={tableRef}
    />
  )
}

export default Meetings