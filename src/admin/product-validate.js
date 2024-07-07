import { boolean, number, string, object } from 'yup'

const productExposedSchema = object({
  name: string().trim().required().min(2).max(10000),
  // lessThan 1 trillion
  priceHrn: number().required().integer().positive().lessThan(1e12),
  priceKop: number().required().integer().positive().lessThan(100),
  description: string().trim().required().min(2).max(10000),
  time: number().required().integer(),
  is_in_stock: boolean().required(),
  expose: boolean().required(),
})

const productNotExposedSchema = object({
  expose: boolean().oneOf([false]),
  name: string().trim().max(10000),
  // lessThan 1 trillion
  priceHrn: number().integer().positive().lessThan(1e12),
  priceKop: number().integer().positive().lessThan(100),
  description: string().trim().max(10000),
  time: number().integer(),
  is_in_stock: boolean(),
})

export default () => async (values, context) => {
  // console.log(
  //   'product-validate - context.photo_cover, context.photosPublic',
  //   context.photo_cover,
  //   context.photosPublic
  // )

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
    if (!valuesPrepared.photo_cover) {
      errors.photo_cover = "це поле обов'язкове"
    }

    if (!valuesPrepared.photosPublic.length) {
      errors.photosPublic = "це поле обов'язкове"
    }
  }

  console.log('product-validate - values, errors:', values, errors)
  console.log(
    'product-validate - photo_cover, photosPublic:',
    context.photo_cover,
    context.photosPublic
  )

  return { values: valuesPrepared, errors }
}

const stripEmpty = values => {
  return Object.keys(values).reduce((_values, k) => {
    if ([null, ''].includes(values[k]) && k !== 'photo_cover') return _values

    _values[k] = values[k]
    return _values
  }, {})
}
