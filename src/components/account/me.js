import { CircularProgress, Dialog, DialogContent, DialogTitle, TextField, DialogActions, Button, Backdrop } from '@material-ui/core'
import Axios from 'axios'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

function Me() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [ clientId, setClientId ] = useState(undefined)
  const [ clientSecret, setClientSecret ] = useState(undefined)
  const [ clientIdError, setClientIdError ] = useState(false)
  const [ clientSecretError, setClientSecretError ] = useState(false)
  const [ loading, setLoading ] = useState(true)
  const accessToken = useSelector(state => state.accessToken)

  useEffect(() => {
    if (accessToken) {
      Axios.get('/api/account/me', {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }).then(({ data }) => {
        if (data?.account?.zoom_client_id) {
          router.push('/admin')
        }
        setLoading(false)
      }).catch(({ response, message }) => {
        console.log('[Error] fetchUser', response)
        if (response.status == 404 && response.data.message === 'User not found'){
          setLoading(false)
        } else {
          enqueueSnackbar(`${response.data.message || message}`, { 
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center'
            }
          })
        }
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [ accessToken ])

  const onChangeInput = (event) => {
    switch(event.target.id) {
      case 'zoom_client_id':
        setClientIdError(false)
        setClientId(event.target.value)
        break
      case 'zoom_client_secret':
        setClientSecretError(false)
        setClientSecret(event.target.value)
        break
    }
  }

  const saveZoomCredentials = async (e) => {
    e.preventDefault()

    if (!clientId || !clientSecret) {
      setClientIdError(!clientId)
      setClientSecretError(!clientSecret)
      return
    }

    try {
      await Axios.post('/api/account/me', {
        zoom_client_id: clientId,
        zoom_client_secret: clientSecret
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      router.push('/admin')
    } catch (e) {
      console.log('[Error] saveZoomCredentials', e)
      enqueueSnackbar(`${e.response.data.message || e.message}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }
  }

  return (
    loading ? (
      <Backdrop open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    ): (
      <Dialog open={true} onSubmit={saveZoomCredentials}>
        <form>
          <DialogTitle>Connect your account to Zoom</DialogTitle>
          <DialogContent>
            <TextField
              id="zoom_client_id"
              label="Zoom API Key"
              fullWidth
              value={clientId}
              onChange={onChangeInput}
              autoComplete="off"
              error={clientIdError}
            />
            <TextField
              id="zoom_client_secret"
              label="Zoom API Secret"
              type="password"
              fullWidth
              value={clientSecret}
              onChange={onChangeInput}
              autoComplete="off"
              error={clientSecretError}
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" color="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    )
  )
}

export default Me