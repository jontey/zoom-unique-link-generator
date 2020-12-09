import Layout from '@/components/layout'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Me from '@/components/account/me'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setToken } from '@/actions/user'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'

const useStyles = makeStyles(() => ({
  login: {
    textAlign: 'center',
    height: '100vh'
  }
}))

export default function Home() {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const dispatch = useDispatch()

  const { error, error_description } = router.query
  if (error && error_description) {
    enqueueSnackbar(`${error_description}`, { 
      variant: 'error',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center'
      }
    })
  }

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const accessToken = await getAccessTokenSilently({
          audience: 'https://app.stnl.my/api',
          scope: 'read:users'
        })
        dispatch(setToken({ accessToken, user }))
      })()
    }
  }, [ isAuthenticated ])

  return (
    <Layout>
      {!isAuthenticated ? (
        <div className={classes.login}>
          <Button onClick={() => loginWithRedirect()} variant="contained" color="primary">
            Log in to view
          </Button>
        </div>
      ) : (
        <Me />
      )}
    </Layout>
  )
}
