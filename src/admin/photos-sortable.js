import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const DndTypes = {
  item: 'ITEM',
}

/**
 * @param {Array} photos photos to render
 * @param {Function} reorderCb callback to fire on reorder
 * @description uses react-dnd to reorder rendered photos
 */
function PhotosSortable({ photos, reorderCb }) {
  const dropCb = (target, source) => {
    const _photos = [...photos]

    const tI = _photos.map(photo => photo.id).indexOf(target)
    const sI = _photos.map(photo => photo.id).indexOf(source)

    // insert source before target
    _photos.splice(tI, 0, _photos.splice(sI, 1)[0])

    reorderCb(_photos)
  }

  return (
    <div className="photos">
      {photos.map(photo => (
        <PhotoSortable key={photo.id} id={photo.id} photo={photo} dropCb={dropCb} />
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
function PhotoSortable({ id, photo, dropCb }) {
  const [collectedDrop, drop] = useDrop({
    accept: DndTypes.item,
    // hover: (item, monitor) => {
    //     console.log('Item, hover - item:', item)
    // },
    drop: (item, monitor) => {
      dropCb(id, item.id)
    },
  })

  const [collectedDrag, drag, dragPreview] = useDrag(() => ({
    type: DndTypes.item,
    item: { id },
  }))

  const ref = useRef()
  drag(drop(ref))

  return (
    <div className="photo photo-sortable" ref={ref}>
      <img src={photo.path} />
    </div>
  )
}

export { PhotosSortable, PhotoSortable }
