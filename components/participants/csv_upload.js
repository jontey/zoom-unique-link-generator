import axios from 'axios'
import { DropzoneDialog } from 'material-ui-dropzone'
import { useSnackbar } from 'notistack'
import Papa from 'papaparse'
import { useState } from 'react'
import { useSelector } from 'react-redux'

export default function CSVUpload({ isOpen, onClose, meetingId }) {
  const accessToken = useSelector(state => state.accessToken)
  const { enqueueSnackbar } = useSnackbar()
  const [ nameList, setNameList ] = useState([])
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
      try {
        const names = nameList[i]
        const { name, locality, email } = names
        const response = await axios.post('/api/zoom', {
          headers: {
            authorization: `Bearer ${accessToken}`
          },
          url: `/meetings/${meetingId}/registrants`,
          method: 'post',
          data: {
            first_name: name,
            last_name: locality,
            email: email || `${name}.${locality}@stnl.my`.toLowerCase(),
            auto_approve: true
          }
        })
          
        console.log(response.data)
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
  )
}