import { Backdrop, CircularProgress, Typography } from '@material-ui/core'
import axios from 'axios'
import { createRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MaterialTable from 'material-table'
import { useRouter } from 'next/router'
import Layout from '@/components/layout'
import { withAuthenticationRequired } from '@auth0/auth0-react'

function Admin() {
  const router = useRouter()
  const accessToken = useSelector(state => state.accessToken)
  const tableRef = createRef()
  const [ users, setUsers ] = useState([])

  const refreshUsers = () => {

  }


  useEffect(() => {
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
    })
  }, [])

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
    </Layout>
  )
}

export default withAuthenticationRequired(Admin, {
  // eslint-disable-next-line react/display-name
  onRedirecting: () => (
    <Backdrop open={true}>
      <>
        <CircularProgress color="inherit" />
        <Typography>
            Redirecting you to login
        </Typography>
      </>
    </Backdrop>
  )
})