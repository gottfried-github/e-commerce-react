import { string, object } from 'yup'

const schema = object({
  username: string().trim().required().max(1e4),
  password: string().trim().required().max(1e4),
})

export default async values => {
  const errors = {}

  try {
    await schema.validate(values, { abortEarly: false })
  } catch (schemaErrors) {
    for (const e of schemaErrors.inner) {
      if (e.path === undefined || errors[e.path]) continue

      errors[e.path] = e.errors[0]
    }
  }

  return Object.keys(errors).length
    ? {
        values: {},
        errors,
      }
    : {
        values,
        errors: {},
      }
}
