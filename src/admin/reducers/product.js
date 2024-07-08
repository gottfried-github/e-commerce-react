import {
  SET_PHOTO_PUBLIC_STATUS,
  REORDER_PHOTOS,
  REMOVE_PHOTO,
  SET_COVER_PHOTO,
  REMOVE_COVER_PHOTO,
  SET_STATE,
} from '../actions/product.js'

export const getPhotosPublic = photos_all =>
  photos_all
    .filter(photo => photo.public)
    // sort in ascending order
    .sort((photoA, photoB) => (photoA.order > photoB.order ? 1 : -1))

export const setPhotoPublicStatus = (state, { photo, publicStatus }) => {
  const photosPublic = getPhotosPublic(state.photos_all)
  const orderLast = photosPublic.length ? photosPublic[photosPublic.length - 1].order : -1

  return {
    ...state,
    photos_all: state.photos_all.map(_photo => {
      if (_photo.id !== photo.id) return _photo

      if (!_photo.public && publicStatus) {
        return { ..._photo, public: publicStatus, order: orderLast + 1 }
      }

      return { ..._photo, public: publicStatus }
    }),
  }
}

const reorderPhotos = (state, { photos }) => {
  const photosIds = photos.map(photo => photo.id)

  return {
    ...state,
    photos_all: state.photos_all.map(photo => {
      if (!photosIds.includes(photo.id)) return photo

      return { ...photo, order: photos[photosIds.indexOf(photo.id)].order }
    }),
  }
}

export const removePhoto = (state, { photo }) => {
  const photos_all_new = state.photos_all.filter(_photo => _photo.id !== photo.id)

  return {
    ...state,
    photos_all: photos_all_new,
    photo_cover: photos_all_new.find(photo => photo.cover) || null,
  }
}

const setCoverPhoto = (state, { photo }) => {
  return {
    ...state,
    photos_all: state.photos_all.map(_photo => {
      if (_photo.id !== photo.id) {
        if (_photo.cover) {
          return { ..._photo, cover: false }
        }

        return _photo
      }

      return { ..._photo, cover: true }
    }),
    photo_cover: { ...photo, cover: true },
  }
}

const removeCoverPhoto = state => {
  return {
    ...state,
    photos_all: state.photos_all.map(_photo => {
      if (_photo.id !== state.photo_cover.id) return _photo

      return { ..._photo, cover: false }
    }),
    photo_cover: null,
  }
}

const setState = (_state, { state }) => {
  return state
}

const stateReducer = (state, action) => {
  switch (action.type) {
    case SET_PHOTO_PUBLIC_STATUS: {
      return setPhotoPublicStatus(state, action.payload)
    }
    case REORDER_PHOTOS: {
      return reorderPhotos(state, action.payload)
    }
    case REMOVE_PHOTO: {
      return removePhoto(state, action.payload)
    }
    case SET_COVER_PHOTO: {
      return setCoverPhoto(state, action.payload)
    }
    case REMOVE_COVER_PHOTO: {
      return removeCoverPhoto(state, action.payload)
    }
    case SET_STATE: {
      return setState(state, action.payload)
    }
    default: {
      return state
    }
  }
}

export default stateReducer
