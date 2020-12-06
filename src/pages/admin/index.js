import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '@/components/loading'

function Admin() {
  const router = useRouter()
  const accessToken = useSelector(state => state.accessToken)
  const tableRef = createRef()
  const [ users, setUsers ] = useState([])
  const [ loading, setLoading ] = useState(true)

  const refreshUsers = () => {
    axios.get('/api/users/refresh', {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }).then(() => {
      setLoading(true)
    })
  }

  useEffect(() => {
    if (loading) {
      axios.get('/api/users', {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }).then((response) => {
        console.log({ users: response.data.users })
        if (response.data.users) {
          setUsers(response.data.users)
        }
      }).catch(e => {
        console.log('[Error] fetch Zoom Users', e)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [ loading ])

  return (
    <Layout>
      <MaterialTable
        title="Users List"
        columns={[
          {
            title: 'Name',
            field: 'user_id',
            render: rowData => `${rowData.first_name} ${rowData.last_name}`
          },
          {
            title: 'Email',
            field: 'email'
          },
          {
            title: 'PMI',
            field: 'pmi'
          }
        ]}
        data={users}
        actions={[
          {
            icon: 'refresh',
            tooltip: 'Refresh Data',
            isFreeAction: true,
            onClick: () => refreshUsers()
          },
          {
            icon: 'meeting_room',
            tooltip: 'View Meetings',
            onClick: (event, rowData) => {
              router.push(`/user/${rowData.user_id}/meetings`)
            }
          }
        ]}
        options={{
          actionsColumnIndex: -1
        }}
        isLoading={loading}
        tableRef={tableRef}
        onRowClick={(event, rowData) => {
          router.push(`/user/${rowData.user_id}/meetings`)
        }}
      />
    </Layout>
  )
}

export default withAuthenticationRequired(Admin, {
  // eslint-disable-next-line react/display-name
  onRedirecting: () => <Loading open={true} />,
  loginOptions: {
    appState: {
      returnTo: '/admin'
    }
  }
})