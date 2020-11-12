import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

export default function AddParticipants({ isOpen, onClose, meetingId }) {
  const accessToken = useSelector(state => state.accessToken)
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')

  const onChangeInput = (event) => {
    switch(event.target.id) {
      case 'name':
        setName(event.target.value)
        break
      case 'email':
        setEmail(event.target.value)
        break
    }
  }

  const addParticipant = async (event) => {
    event.preventDefault()

    console.log(name, email)
    if (!name||!email) {
      return
    }
    try {
      const response = axios.post('/api/zoom', {
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        url: `/meetings/${meetingId}/registrants`,
        method: 'post',
        data: {
          first_name: name,
          email,
          auto_approve: true
        }
      })
      
      console.log(response.data)
      onClose()
    } catch(e) {
      console.log('[Error] Add Participant', e)
    }
    
  }

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
    }
  }, [ isOpen ])

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <form onSubmit={addParticipant}>
        <DialogTitle>Add New Participant</DialogTitle>
        <DialogContent>
          <TextField
            id="name"
            label="Name"
            fullWidth
            value={name}
            onChange={onChangeInput}
            autoComplete="off"
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