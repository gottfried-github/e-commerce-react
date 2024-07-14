import { kopToHrn, hrnToKop } from '../../utils/price.js'

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
    state.priceHrn = ''
    state.priceKop = ''

    return state
  }

  const price = kopToHrn(fields.price)

  state.priceHrn = price.hrn.toString()
  state.priceKop = price.kop.toString()

  return state
}

/**
 * @param {Object} state
 * @description convert Product's state to api request
 */
function stateToData(state) {
  const fields = {}

  if (state.priceHrn || state.priceKop) {
    fields.price =
      '' === state.priceHrn
        ? hrnToKop(0, parseInt(state.priceKop, 10))
        : '' === state.priceKop
          ? hrnToKop(parseInt(state.priceHrn, 10), 0)
          : hrnToKop(parseInt(state.priceHrn, 10), parseInt(state.priceKop, 10))
  }

  if (undefined !== state.name && state.name) fields.name = state.name
  if (undefined !== state.expose) fields.expose = state.expose
  if (undefined !== state.is_in_stock) fields.is_in_stock = state.is_in_stock
  if (undefined !== state.description && state.description) fields.description = state.description
  if ('number' === typeof state.time) fields.time = state.time

  return fields
}

export { stateToData, dataToState, kopToHrn, hrnToKop }
