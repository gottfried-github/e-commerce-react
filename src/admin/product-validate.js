export default ({ productExposedSchema, productNotExposedSchema, photo_cover, photosPublic }) =>
  async values => {
    const errors = {}
    const valuesPrepared = stripEmpty(values)
    let isTimeValidDate = null

    if (valuesPrepared.time instanceof Date && isNaN(valuesPrepared.time.getTime())) {
      isTimeValidDate = false
    } else if (valuesPrepared.time instanceof Date) {
      isTimeValidDate = true
    }

    /* convert values into types for validation */
    if (valuesPrepared.time && !isTimeValidDate) {
      errors.time = 'введено несправний час'
      delete valuesPrepared.time
    } else if (valuesPrepared.time) {
      valuesPrepared.time = valuesPrepared.time.getTime()
    }

    try {
      if (valuesPrepared.expose) {
        await productExposedSchema.validate(valuesPrepared, { abortEarly: false })
      } else {
        await productNotExposedSchema.validate(valuesPrepared, { abortEarly: false })
      }
    } catch (schemaErrors) {
      for (const e of schemaErrors.inner) {
        if (e.path === undefined || errors[e.path]) continue

        errors[e.path] = e.errors[0]
      }
    }

    if (valuesPrepared.expose) {
      if (!photo_cover) {
        errors.photo_cover = "це поле обов'язкове"
      }

      if (!photosPublic.length) {
        errors.photosPublic = "це поле обов'язкове"
      }
    }

    return { values: valuesPrepared, errors }
  }

const stripEmpty = values => {
  return Object.keys(values).reduce((_values, k) => {
    if ([null, ''].includes(values[k])) return _values

    _values[k] = values[k]
    return _values
  }, {})
}
