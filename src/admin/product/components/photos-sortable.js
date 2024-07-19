import React, { useState, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const DndTypes = {
  item: 'ITEM',
}

/**
 * @param {Array} photos photos to render
 * @param {Function} reorderCb callback to fire on reorder
 * @description uses react-dnd to reorder rendered photos
 */
function PhotosSortable({ photos, reorderCb, disabled }) {
  const [_photos, setPhotos] = useState(photos)

  useEffect(() => {
    setPhotos(photos)
  }, [photos])

  const hoverCb = (target, source, clientOffset) => {
    if (target.id === source.id) return

    const __photos = [..._photos]

    const tI = __photos.map(photo => photo.id).indexOf(target.id)
    const sI = __photos.map(photo => photo.id).indexOf(source.id)

    const targetClientRect = target.ref.current.getBoundingClientRect()

    const middle =
      window.innerWidth > 708
        ? targetClientRect.width / 2 + targetClientRect.x
        : targetClientRect.height / 2 + targetClientRect.y

    const offset = window.innerWidth > 708 ? clientOffset.x : clientOffset.y

    if (offset <= middle) {
      // insert source before target
      __photos.splice(tI, 0, __photos.splice(sI, 1)[0])
    } else {
      // insert source after target
      __photos.splice(tI + 1, 0, __photos.splice(sI, 1)[0])
    }

    setPhotos(__photos)
  }

  const dragCancelCb = source => {
    setPhotos(photos)
  }

  const dropCb = (target, source, clientOffset) => {
    if (disabled) {
      setPhotos(photos)
      return
    }

    reorderCb(_photos)
  }

  return (
    <div className="photos-sortable">
      {_photos.map(photo => (
        <PhotoSortable
          key={photo.id}
          id={photo.id}
          photo={photo}
          dropCb={dropCb}
          hoverCb={hoverCb}
          dragCancelCb={dragCancelCb}
        />
      ))}
    </div>
  )
}

/**
 * @param {String} id the photo's id as it is in the array of photos at the level above
 * @param {Object} photo the photo
 * @param {Function} dropCb callback to fire when a photo is dropped on the photo
 * @description uses react-dnd to implement draggable and droppable photos
 */
function PhotoSortable({ id, photo, dropCb, hoverCb, dragCancelCb }) {
  const ref = useRef()

  const [collectedDrop, drop] = useDrop({
    accept: DndTypes.item,
    hover: (item, monitor) => {
      hoverCb({ id, ref }, item, monitor.getClientOffset())
    },
    drop: (item, monitor) => {
      dropCb({ id, ref }, item, monitor.getClientOffset())
    },
  })

  const [collectedDrag, drag, dragPreview] = useDrag(() => ({
    type: DndTypes.item,
    item: { id, ref },
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        dragCancelCb(item)
      }
    },
  }))

  drag(drop(ref))

  return (
    <div className="photos-sortable__photo" ref={ref}>
      <img src={photo.pathsPublic.s} />
    </div>
  )
}

export { PhotosSortable, PhotoSortable }
