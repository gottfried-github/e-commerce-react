import { kopToHrn, hrnToKop } from '../price.js'

/**
 * @param {Object} fields
 * @description convert api response to Product's state
 */
function dataToState(fields) {
  const state = {
    name: fields.name || '',
    expose: fields.expose || false,
    is_in_stock: fields.is_in_stock || false,
    description: fields.description || '',
    time: fields.time ? new Date(fields.time).getTime() : null,
    photos_all: fields.photos_all,
    photo_cover: fields.photo_cover,
  }

  if (undefined === fields.price) {
    state.priceHrn = null
    state.priceKop = null

    return state
  }

  const price = kopToHrn(fields.price)

  state.priceHrn = price.hrn
  state.priceKop = price.kop

  return state
}

/**
 * @param {Object} state
 * @description convert Product's state to api request
 */
function stateToData(state) {
  const fields = {}

  if (null !== state.priceHrn || null !== state.priceKop) {
    fields.price =
      null === state.priceHrn
        ? hrnToKop(0, state.priceKop)
        : null === state.priceKop
          ? hrnToKop(state.priceHrn, 0)
          : hrnToKop(state.priceHrn, state.priceKop)
  }

  if (undefined !== state.name && state.name) fields.name = state.name
  if (undefined !== state.expose) fields.expose = state.expose
  if (undefined !== state.is_in_stock) fields.is_in_stock = state.is_in_stock
  if (undefined !== state.description && state.description) fields.description = state.description
  if ('number' === typeof state.time) fields.time = state.time

  return fields
}

export { stateToData, dataToState, kopToHrn, hrnToKop }
