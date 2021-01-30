import { Backdrop, CircularProgress, makeStyles, Typography } from '@material-ui/core'
import axios from 'axios'
import { DropzoneDialog } from 'material-ui-dropzone'
import { useSnackbar } from 'notistack'
import Papa from 'papaparse'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.modal + 1,
    color: '#fff'
  }
}))

export default function CSVUpload({ isOpen, onClose, meetingId }) {
  const classes = useStyles()
  const accessToken = useSelector(state => state.accessToken)
  const { enqueueSnackbar } = useSnackbar()
  const [ nameList, setNameList ] = useState([])
  const [ currentIndex, setCurrentIndex ] = useState(0)
  const [ loading, setLoading ] = useState(false)

  const handleUpload = (files) => {
    if (files.length < 1) return

    setLoading(true)
    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase(),
      complete: function(results) {
        console.log(results)
        setNameList(results.data)
        enqueueSnackbar(`Found ${results.data.length} rows`, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        })
        setLoading(false)
      }
    })
  }

  const handleSave = async () => {
    if (loading) return

    setLoading(true)
    for (let i = 0; i < nameList.length; i++) {
      setCurrentIndex(i+1)
      try {
        const names = nameList[i]
        const { name, locality, first_name, last_name, email } = names
        await axios.post(`/api/meetings/${meetingId}/registrants`, {
          first_name: name || first_name,
          last_name: locality || last_name,
          email: email
        },{
          headers: {
            authorization: `Bearer ${accessToken}`
          }
        })
      } catch (e) {
        enqueueSnackbar(`Error in row ${i+1}`, { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        })
        console.log(e)
      }
    }

    setLoading(false)
    onClose()
  }

  return (
    <>
      <DropzoneDialog
        cancelButtonText={'Cancel'}
        submitButtonText={'Submit'}
        filesLimit={1}
        open={isOpen}
        onClose={onClose}
        onChange={(files) => {
          console.log('Files:', files)
          handleUpload(files)
        }}
        onSave={handleSave}
        // showPreviews={true}
        // showPreviewsInDropzone={false}
        useChipsForPreview={true}
        showAlerts={[ 'error' ]} 
      />
      <Backdrop className={classes.backdrop} open={loading}>
        <>
          <CircularProgress color="inherit" />
          <Typography>
            Uploading row {currentIndex} of {nameList.length}
          </Typography>
        </>
      </Backdrop>
    </>
  )
}