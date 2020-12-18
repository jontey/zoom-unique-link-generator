import axios from 'axios'
import { createRef, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import { Button } from '@material-ui/core'

function Meetings() {
  const router = useRouter()
  const accessToken = useSelector(state => state.accessToken)
  const [ nextPageToken, setNextPageToken ] = useState('')
  const tableRef = createRef()


  const fixMeetingPermissions = async (meetingId) => {
    try {
      await axios.post('/api/zoom', {
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        url: `/meetings/${meetingId}`,
        method: 'patch',
        data: {
          settings: {
            approval_type: 1,
            registration_type: 1,
            registrants_confirmation_email: false,
            registrants_email_confirmation: false,
            show_share_button: false,
            allow_multiple_devices: false
          }
        }
      })
      
    } catch (e) {
      console.log('[Error] fixMeetingPermissions', e)
    }
  }

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
          icon: 'group',
          tooltip: 'Edit Participants',
          onClick: (event, rowData) => {
            router.push(`/participants/${rowData.id}`)
          }
        },
        {
          icon: 'settings',
          tooltip: 'Fix Meeting Settings',
          onClick: (event, rowData) => {
            const confirm = window.confirm('Are you sure you want to enable registration for this meeting?')
            if (confirm) {
              fixMeetingPermissions(rowData.id)
            }
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