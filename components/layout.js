import { AppBar, Button, Toolbar, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import { setToken } from '../src/actions/user'
import { useRouter } from 'next/router'


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  logout: {
    color: 'white'
  }
}))

export default function Layout({ children, onBack }) {
  const router = useRouter()
  const classes = useStyles()
  const dispatch = useDispatch()
  const accessToken = useSelector(state => state.accessToken)

  const logOut = () => {
    dispatch(setToken({
      accessToken: '',
      refreshToken: ''
    }))
    router.push('/')
  }

  return (
    <div className={classes.root}>
      <Head>
        <title>Zoom Unique Link Generator</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <link rel="icon" href="favicon.png" sizes="32x32" type="image/png"></link>
      </Head>
      <div>
        {accessToken !== '' && <AppBar position="static">
          <Toolbar>
            {onBack}
            <Typography variant="h6" className={classes.title}>
              
            </Typography>
            <Button className={classes.logout} onClick={logOut}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>}
        <Paper>
          {children}
        </Paper>
      </div>
    </div>
  )
}