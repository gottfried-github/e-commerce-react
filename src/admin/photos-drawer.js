import React from 'react'
import PhotosDrawerItem from './photo-drawer-item.js'

const PhotosDrawer = ({
  photos,
  handlePhotoPublicPick,
  handlePhotoCoverPick,
  handleRemovePhoto,
  disabled,
}) => {
  return (
    <div className="photos-drawer">
      {photos.map(photo => (
        <PhotosDrawerItem
          key={photo.id}
          photo={photo}
          handlePublicPick={handlePhotoPublicPick}
          handleCoverPick={handlePhotoCoverPick}
          handleRemove={handleRemovePhoto}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

export default PhotosDrawer
