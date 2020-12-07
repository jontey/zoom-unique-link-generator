import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useSnackbar } from 'notistack'

export default function AddParticipants({ isOpen, onClose, meetingId }) {
  
  const { enqueueSnackbar } = useSnackbar()
  const accessToken = useSelector(state => state.accessToken)
  const [ firstName, setFirstName ] = useState(undefined)
  const [ lastName, setLastName ] = useState(undefined)
  const [ email, setEmail ] = useState(undefined)
  const [ firstNameError, setFirstNameError ] = useState(false)
  const [ lastNameError, setLastNameError ] = useState(false)

  const onChangeInput = (event) => {
    switch(event.target.id) {
      case 'first_name':
        setFirstNameError(false)
        setFirstName(event.target.value)
        break
      case 'last_name':
        setLastNameError(false)
        setLastName(event.target.value)
        break
      case 'email':
        setEmail(event.target.value)
        break
    }
  }

  const addParticipant = async (event) => {
    event.preventDefault()

    if (!firstName||!lastName) {
      setFirstNameError(!firstName)
      setLastNameError(!lastName)
      return
    }
    try {
      await axios.post(`/api/meetings/${meetingId}/registrants`,{
        first_name: firstName,
        last_name: lastName,
        email
      }, {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })
      onClose()
    } catch(e) {
      console.log('[Error] Add Participant', e)
      enqueueSnackbar(`${e.response.data.message || e.message}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFirstName('')
      setLastName('')
      setEmail('')
    }
  }, [ isOpen ])

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <form onSubmit={addParticipant}>
        <DialogTitle>Add New Participant</DialogTitle>
        <DialogContent>
          <TextField
            id="first_name"
            label="First Name"
            required
            fullWidth
            value={firstName}
            onChange={onChangeInput}
            autoComplete="off"
            error={firstNameError}
          />
          <TextField
            id="last_name"
            label="Last Name"
            required
            fullWidth
            value={lastName}
            onChange={onChangeInput}
            autoComplete="off"
            error={lastNameError}
          />
          <TextField
            id="email"
            label="Email"
            fullWidth
            value={email}
            onChange={onChangeInput}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button type="reset" onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary">Add</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}