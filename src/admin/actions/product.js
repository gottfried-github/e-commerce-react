export const SET_PHOTO_PUBLIC_STATUS = 'SET_PHOTO_PUBLIC_STATUS'
export const REORDER_PHOTOS = 'REORDER_PHOTOS'
export const REMOVE_PHOTO = 'REMOVE_PHOTO'
export const SET_COVER_PHOTO = 'SET_COVER_PHOTO'
export const REMOVE_COVER_PHOTO = 'REMOVE_COVER_PHOTO'
export const SET_STATE = 'SET_STATE'

const createAction = type => payload => ({ type, payload })

export const setPhotoPublicStatus = createAction(SET_PHOTO_PUBLIC_STATUS)
export const reorderPhotos = createAction(REORDER_PHOTOS)
export const removePhoto = createAction(REMOVE_PHOTO)
export const setCoverPhoto = createAction(SET_COVER_PHOTO)
export const removeCoverPhoto = createAction(REMOVE_COVER_PHOTO)
export const setState = createAction(SET_STATE)
