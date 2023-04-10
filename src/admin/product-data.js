/**
     * @param {Number} kop
     * @description express kopiykas as hryvnias with kopiykas
    */
function kopToHrn(kop) {
    return {
        hrn: Number(kop.toString().slice(0, kop.toString().length-2)),
        kop: Number(kop.toString().slice(kop.toString().length-2))
    }
}

/**
 * @param {Number} hrn 
 * @param {Number} kop
 * @description express hryvnias with kopiykas as kopiykas 
*/ 
function hrnToKop(hrn, kop) {
    console.log('hrnToKop - hrn, kop:', hrn, kop)
    return hrn * 100 + kop
}

/**
 * @param {Object} fields
 * @description convert api response to Product's state
*/
function dataToState(fields) {
    const state = {
        name: fields.name || '',
        expose: fields.expose || false,
        is_in_stock: fields.is_in_stock || false,
        photos: fields.photos || [],
        cover_photo: fields.cover_photo || '',
        description: fields.description || ''
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
        fields.price = null === state.priceHrn 
            ? hrnToKop(0, state.priceKop)
            : null === state.priceKop 
                ? hrnToKop(state.priceHrn, 0)
                : hrnToKop(state.priceHrn, state.priceKop)
    }

    if (undefined !== state.name && state.name) fields.name = state.name
    if (undefined !== state.expose) fields.expose = state.expose
    if (undefined !== state.is_in_stock) fields.is_in_stock = state.is_in_stock
    if (state.photos) fields.photos = state.photos.map(photo => photo.id)
    if (undefined !== state.cover_photo && state.cover_photo) fields.cover_photo = state.cover_photo.id
    if (undefined !== state.description && state.description) fields.description = state.description

    return fields
}

export {
    stateToData, dataToState,
    kopToHrn, hrnToKop
}