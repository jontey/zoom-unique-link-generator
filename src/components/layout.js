import { useAuth0 } from '@auth0/auth0-react'
import { AppBar, Button, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, SwipeableDrawer, Toolbar, Typography } from '@material-ui/core'
import { Group, Menu as MenuIcon, Settings } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  drawer:{
    width: 250
  },
  title: {
    flexGrow: 1
  },
  logout: {
    color: 'white'
  }
}))

export default function Layout({ children, title, onBack }) {
  const router = useRouter()
  const { logout, isAuthenticated } = useAuth0()
  const [ drawerOpen, setDrawerOpen ] = useState(false)
  const classes = useStyles()

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
        {isAuthenticated && <AppBar position="static">
          <Toolbar>
            {onBack ? onBack : (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon/>
                </IconButton>
                <Drawer
                  anchor="left"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                >
                  <div className={classes.drawer}>
                    <List>
                      <ListItem button onClick={() => router.push('/admin')}>
                        <ListItemIcon><Group/></ListItemIcon>
                        <ListItemText primary="Users"/>
                      </ListItem>
                      <ListItem button >
                        <ListItemIcon><Settings/></ListItemIcon>
                        <ListItemText primary="Settings"/>
                      </ListItem>
                    </List>
                  </div>
                </Drawer>
              </>
            )}
            <Typography variant="h6" className={classes.title}>
              {title}
            </Typography>
            <Button className={classes.logout} onClick={() => logout({ returnTo: window.location.origin })}>
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
