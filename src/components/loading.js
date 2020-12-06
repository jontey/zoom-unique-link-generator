import { Backdrop, CircularProgress, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.modal + 1,
    color: '#fff'
  },
  progress: {
    color: 'inherit',
    marginRight: theme.spacing(1)
  }
}))

function Loading({ open }) {
  const classes = useStyles()
  return (
    <Backdrop className={classes.backdrop} open={open}>
      <>
        <CircularProgress className={classes.progress} />
        <Typography>
            Redirecting you to login
        </Typography>
      </>
    </Backdrop>
  )
}

export default Loading