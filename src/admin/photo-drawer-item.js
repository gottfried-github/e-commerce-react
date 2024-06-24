import React from 'react'
import Paper from '@mui/material/Paper/index.js'
import Divider from '@mui/material/Divider/index.js'
import Button from '@mui/material/Button/index.js'
import Checkbox from '@mui/material/Checkbox/index.js'
import Radio from '@mui/material/Radio/index.js'
import FormControlLabel from '@mui/material/FormControlLabel/index.js'

const PhotosDrawerItem = ({ photo, handlePublicPick, handleCoverPick, handleRemove, disabled }) => {
  const handlePublicChange = () => {
    handlePublicPick(!photo.public, photo)
  }

  const handleCoverChange = ev => {
    if (photo.cover || !ev.target.checked) return

    handleCoverPick(photo)
  }

  return (
    <Paper elevation={3}>
      <div className="photos-drawer__photo">
        <img src={photo.pathPublic} alt="photo drawer photo" />
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
          <Button variant="contained" color="error" disabled={disabled}>
            Видалити
          </Button>
        </div>
      </div>
    </Paper>
  )
}

export default PhotosDrawerItem
