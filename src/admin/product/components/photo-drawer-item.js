import React, { useState } from 'react'
import Paper from '@mui/material/Paper/index.js'
import Divider from '@mui/material/Divider/index.js'
import Button from '@mui/material/Button/index.js'
import Checkbox from '@mui/material/Checkbox/index.js'
import Radio from '@mui/material/Radio/index.js'
import FormControlLabel from '@mui/material/FormControlLabel/index.js'
import Dialog from '@mui/material/Dialog/index.js'
import DialogContent from '@mui/material/DialogContent/index.js'
import DialogContentText from '@mui/material/DialogContentText/index.js'
import DialogActions from '@mui/material/DialogActions/index.js'

const PhotosDrawerItem = ({ photo, handlePublicPick, handleCoverPick, handleRemove, disabled }) => {
  const [isRemoveConfirmationDialogOpen, setIsRemoveConfirmationDialogOpen] = useState(false)

  const handlePublicChange = () => {
    handlePublicPick(!photo.public, photo)
  }

  const handleCoverChange = ev => {
    if (photo.cover || !ev.target.checked) return

    handleCoverPick(photo)
  }

  const handleRemoveButtonClick = () => {
    setIsRemoveConfirmationDialogOpen(true)
  }

  const handleRemoveConfirmationDialogClose = () => {
    setIsRemoveConfirmationDialogOpen(false)
  }

  const handleConfirmRemoveButtonClick = () => {
    handleRemove(photo)
    setIsRemoveConfirmationDialogOpen(false)
  }

  return (
    <Paper className="photos_drawer__item-container" elevation={3}>
      <div className="photos-drawer__photo">
        <img src={photo.pathsPublic.s} alt="photo drawer photo" />
      </div>
      <div className="photos-drawer__content-box">
        <FormControlLabel
          control={<Checkbox checked={photo.public} />}
          label="Показувати відвідувачам"
          onChange={handlePublicChange}
          disabled={disabled}
        />
        <FormControlLabel
          control={<Radio checked={photo.cover} name="photo-cover" />}
          label="Поставити на обкладинку"
          onChange={handleCoverChange}
          disabled={disabled}
        />
      </div>
      <Divider />
      <div className="photos-drawer__content-box">
        <div className="flex-justify-end">
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveButtonClick}
            disabled={disabled}
          >
            Видалити
          </Button>
        </div>
      </div>
      <Dialog open={isRemoveConfirmationDialogOpen} onClose={handleRemoveConfirmationDialogClose}>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити фото? Ви втратите його на завжди.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleConfirmRemoveButtonClick}>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default PhotosDrawerItem
