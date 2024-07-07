import React, { Component, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useForm, useController } from 'react-hook-form'
import parseIsoTime from 'parseisotime'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@mui/material/Button/index.js'
import Typography from '@mui/material/Typography/index.js'
import TextField from '@mui/material/TextField/index.js'
import Checkbox from '@mui/material/Checkbox/index.js'
import FormControlLabel from '@mui/material/FormControlLabel/index.js'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker/index.js'
import Dialog from '@mui/material/Dialog/index.js'
import DialogContent from '@mui/material/DialogContent/index.js'
import DialogContentText from '@mui/material/DialogContentText/index.js'
import DialogActions from '@mui/material/DialogActions/index.js'
import Divider from '@mui/material/Divider/index.js'

import { ValidationError } from '../../../e-commerce-common/messages.js'
import * as data from './product-data.js'
import productValidate from './product-validate.js'
import { PhotoPicker, PhotosPicker } from './photos-picker.js'
import { PhotosSortable } from './photos-sortable-new.js'
import PhotosDrawer from './photos-drawer.js'

const getFormState = state => ({
  name: state.name,
  description: state.description,
  priceHrn: state.priceHrn,
  priceKop: state.priceKop,
  is_in_stock: state.is_in_stock,
  time: state.time ? new Date(state.time) : null,
  expose: state.expose,
  photo_cover: state.photo_cover,
  photosPublic: state.photos_all.filter(photo => photo.public),
})

const main = api => {
  const ProductNew = () => {
    const navigate = useNavigate()
    const params = useParams()
    const location = useLocation()
    const validate = productValidate()

    const [state, setState] = useState({
      name: '',
      priceHrn: '',
      priceKop: '',
      expose: false,
      is_in_stock: false,
      description: '',
      time: null,
      photos_all: [],
      photo_cover: null,
    })
    const [errors, setErrors] = useState({})
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isRemoveProductConfirmationDialogOpen, setIsRemoveProductConfirmationDialogOpen] =
      useState(false)
    const [timeData, setTimeData] = useState(state.time ? new Date(state.time) : null)

    const formState = useMemo(() => getFormState(state), [state])

    const photosPublic = useMemo(
      () =>
        state.photos_all
          .filter(photo => photo.public)
          // sort in ascending order
          .sort((photoA, photoB) => (photoA.order > photoB.order ? 1 : -1)),
      [state.photos_all]
    )

    const {
      register,
      handleSubmit,
      formState: { errors: formErrors },
      getValues,
      setValue,
      setError,
      clearErrors,
      trigger,
      reset,
      control,
    } = useForm({
      mode: 'onTouched',
      defaultValues: {
        name: '',
        description: '',
        priceHrn: '',
        priceKop: '',
        is_in_stock: false,
        time: null,
        expose: false,
        photo_cover: null,
        photosPublic: [],
      },
      values: formState,
      resetOptions: {
        keepDirtyValues: true,
      },
      errors,
      resolver: validate,
      context: {
        photo_cover: state.photo_cover,
        photosPublic,
      },
    })

    console.log('formErrors:', formErrors)

    useEffect(() => {
      console.log('useEffect on errors, errors:', errors)
    }, [errors])

    useEffect(() => {
      console.log('useEffect on formErrors, formErrors:', formErrors)
    }, [formErrors])

    useEffect(() => {
      console.log('useEffect on formState, formState:', formState)

      // react-hook-form doesn't validate when useForm `values` option changes, so need to validate manually
      trigger()
    }, [formState])

    // I use controllers for checkboxes. See Admin: `react-hook-form` and `mui` - handling checkboxes
    const fieldPropsIsInStock = useController({ name: 'is_in_stock', control })
    const fieldPropsExpose = useController({ name: 'expose', control })
    const fieldPropsPhotoCover = useController({ name: 'photo_cover', control })
    const fieldPropsPhotosPublic = useController({ name: 'photosPublic', control })

    const photosFilesInputRef = useRef()

    useEffect(() => {
      setIsDataLoading(true)

      api.product.get(params.id, body => {
        const stateData = data.dataToState(body)
        setState(stateData)
        reset({ ...stateData, time: stateData.time ? new Date(state.time) : null })

        setIsDataLoading(false)
      })
    }, [])

    const handleSubmitInner = async values => {
      setIsDataLoading(true)

      api.product.update(params.id, data.stateToData(values), null, body => {
        const stateData = data.dataToState(body)
        setState(stateData)

        reset({ ...stateData, time: stateData.time ? new Date(state.time) : null })

        setIsDataLoading(false)
      })
    }

    const handleDeleteProductConfirmClick = () => {
      setIsDataLoading(true)

      api.product.delete(params.id, () => {
        setIsDataLoading(false)
        setIsRemoveProductConfirmationDialogOpen(false)
        navigate('/dash/products')
      })
    }

    // see Admin: `react-hook-form` validation and reactive `errors`
    const handleProductDataInputBlur = () => {
      fieldPropsPhotoCover.field.onBlur()
      fieldPropsPhotosPublic.field.onBlur()
    }

    const handleIsInStockChange = ev => {
      fieldPropsIsInStock.field.onChange(ev.target.checked)
    }

    const handleExposeChange = ev => {
      fieldPropsExpose.field.onChange(ev.target.checked)
      trigger()
    }

    const handleFormElSubmit = ev => {
      ev.preventDefault()
    }

    // add or remove a photo from `photos` based on whether it's checked or not and make api request to update the `photos` field
    const handlePhotoPublicPick = async (picked, photo) => {
      const photosPublicNew = state.photos_all.filter(
        _photo => (_photo.public && _photo.id !== photo.id) || (_photo.id === photo.id && picked)
      )

      const { errors } = await validate(
        {
          ...getValues(),
          expose: formState.expose,
          photosPublic: photosPublicNew,
        },
        {}
      )

      setErrors(errors)

      if (errors.photosPublic) return

      setIsDataLoading(true)

      api.product.updatePhotosPublicity(
        params.id,
        [{ id: photo.id, public: picked }],
        () => {
          setState({
            ...state,
            photos_all: state.photos_all.map(_photo => {
              if (_photo.id !== photo.id) return _photo

              return {
                ..._photo,
                public: picked,
              }
            }),
          })

          fieldPropsPhotosPublic.field.onChange(photosPublicNew)
          fieldPropsPhotosPublic.field.onBlur(photosPublicNew)

          setIsDataLoading(false)
        },
        (body, res) => {
          if (body.code !== ValidationError.code) {
            console.log(
              'handlePhotoCoverRemove, api.product.setCoverPhoto responded with failure - body, res:',
              body,
              res
            )
            return
          }

          setErrors({ ...formErrors, photosPublic: body.message })
          setIsDataLoading(false)
        }
      )
    }

    const handlePhotoCoverPick = photo => {
      setIsDataLoading(true)

      api.product.setCoverPhoto(params.id, { id: photo.id, cover: true }, () => {
        setState({
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
        })

        fieldPropsPhotoCover.field.onChange({ ...photo, cover: true })
        fieldPropsPhotoCover.field.onBlur({ ...photo, cover: true })

        setIsDataLoading(false)
      })
    }

    const handlePhotoCoverRemove = async () => {
      const { errors } = await validate(
        { ...getValues(), expose: formState.expose, photo_cover: null },
        { photo_cover: null, photosPublic }
      )
      setErrors(errors)

      if (errors.photo_cover) return

      setIsDataLoading(true)

      api.product.setCoverPhoto(
        params.id,
        { id: state.photo_cover.id, cover: false },
        async () => {
          setState({
            ...state,
            photos_all: state.photos_all.map(_photo => {
              if (_photo.id !== state.photo_cover.id) return _photo

              return { ..._photo, cover: false }
            }),
            photo_cover: null,
          })

          fieldPropsPhotoCover.field.onChange(null)
          fieldPropsPhotoCover.field.onBlur(null)

          setIsDataLoading(false)
        },
        (body, res) => {
          if (body.code !== ValidationError.code) {
            console.log(
              'handlePhotoCoverRemove, api.product.setCoverPhoto responded with failure - body, res:',
              body,
              res
            )
            return
          }

          setErrors({ ...formErrors, photo_cover: body.message })
        }
      )
    }

    const handlePhotoRemove = async photo => {
      const photos_allNew = state.photos_all.filter(_photo => _photo.id !== photo.id)
      const photosPublicNew = photos_allNew.filter(photo => photo.public)
      const photoCoverNew = photos_allNew.find(photo => photo.cover)

      const values = getValues()

      const { errors } = await validate(
        {
          ...values,
          expose: formState.expose,
          photosPublic: photosPublicNew,
          photo_cover: photoCoverNew || null,
        },
        {}
      )

      setErrors(errors)

      if (errors.photosPublic || errors.photo_cover) return

      setIsDataLoading(true)

      api.product.removePhotos(params.id, [photo.id], body => {
        setState({
          ...state,
          photos_all: photos_allNew,
          photo_cover: photoCoverNew || null,
        })

        fieldPropsPhotosPublic.field.onChange(photosPublicNew)
        fieldPropsPhotosPublic.field.onBlur(photosPublicNew)
        fieldPropsPhotoCover.field.onChange(photoCoverNew || null)
        fieldPropsPhotoCover.field.onBlur(photoCoverNew || null)

        setIsDataLoading(false)
      })
    }

    const handlePhotosReorder = photos => {
      const photosData = photos.map((photo, i) => ({ id: photo.id, order: i }))

      setIsDataLoading(true)

      api.product.reorderPhotos(params.id, photosData, () => {
        const photosDataIds = photosData.map(photo => photo.id)

        setState({
          ...state,
          photos_all: state.photos_all.map(photo => {
            if (!photosDataIds.includes(photo.id)) return photo

            return { ...photo, order: photosData[photosDataIds.indexOf(photo.id)].order }
          }),
        })

        setIsDataLoading(false)
      })
    }

    // make api request to upload photos
    const handlePhotosUpload = () => {
      const files = photosFilesInputRef.current.files

      if (!files.length) return

      setIsDataLoading(true)

      api.product.upload(params.id, files, () => {
        api.product.get(params.id, body => {
          setState(data.dataToState(body))
          setIsDataLoading(false)
        })
      })
    }

    const handleDeleteProductClick = () => {
      setIsRemoveProductConfirmationDialogOpen(true)
    }

    const handleDeleteProductDialogClose = () => {
      setIsRemoveProductConfirmationDialogOpen(false)
    }

    const fieldPropsTime = register('time')

    useEffect(() => {
      const date = state.time ? new Date(state.time) : null
      setTimeData(date)
      setValue('time', date)
    }, [state])

    return (
      <div className="product-container">
        <div className="layout-col-center">
          <form className="product-data-form" onSubmit={handleFormElSubmit}>
            <div className="product-data__row">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <label className="product-data__field-label" htmlFor="name">
                    Назва
                  </label>
                  <TextField
                    id="name"
                    placeholder="Назва"
                    {...register('name', { onBlur: handleProductDataInputBlur })}
                    error={!!formErrors.name}
                    helperText={formErrors.name || null}
                    disabled={isDataLoading}
                  />
                </div>
              </div>
            </div>
            <div className="product-data__row">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <label className="product-data__field-label" htmlFor="description">
                    Опис
                  </label>
                  <TextField
                    id="description"
                    placeholder="Опис"
                    multiline
                    minRows={6}
                    maxRows={12}
                    {...register('description', { onBlur: handleProductDataInputBlur })}
                    error={!!formErrors.description}
                    helperText={formErrors.description || null}
                    disabled={isDataLoading}
                  />
                </div>
              </div>
            </div>
            <div className="product-data__row-2">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <label className="product-data__field-label" htmlFor="priceHrn">
                    Ціна: гривні
                  </label>
                  <TextField
                    id="priceHrn"
                    placeholder="Гривні"
                    type="number"
                    {...register('priceHrn', { onBlur: handleProductDataInputBlur })}
                    error={!!formErrors.priceHrn}
                    helperText={formErrors.priceHrn || null}
                    disabled={isDataLoading}
                  />
                </div>
              </div>
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <label className="product-data__field-label" htmlFor="priceKop">
                    Ціна: копійки
                  </label>
                  <TextField
                    id="priceKop"
                    placeholder="Копійки"
                    type="number"
                    {...register('priceKop', { onBlur: handleProductDataInputBlur })}
                    error={!!formErrors.priceKop}
                    helperText={formErrors.priceKop || null}
                    disabled={isDataLoading}
                  />
                </div>
              </div>
            </div>
            <div className="product-data__row">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <div className="product-data__checkbox-container">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={fieldPropsIsInStock.field.value}
                          onChange={handleIsInStockChange}
                          onBlur={() => {
                            fieldPropsIsInStock.field.onBlur()
                            handleProductDataInputBlur()
                          }}
                          inputRef={fieldPropsIsInStock.field.ref}
                        />
                      }
                      label={'В наявності'}
                      disabled={isDataLoading}
                    />
                    {formErrors.is_in_stock ? (
                      <div className="product-data__error">{formErrors.is_in_stock}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="product-data__row">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <label className="product-data__field-label" htmlFor="time">
                    Час створення
                  </label>
                  <DateTimePicker
                    id="time"
                    value={timeData}
                    name={fieldPropsTime.name}
                    onBlur={() => {
                      fieldPropsTime.onBlur()
                      handleProductDataInputBlur()
                    }}
                    inputRef={fieldPropsTime.ref}
                    onChange={date => {
                      setTimeData(date)
                      setValue('time', date)
                      trigger('time')
                    }}
                    disabled={isDataLoading}
                  />
                  {formErrors.time ? (
                    <div className="product-data__error">{formErrors.time}</div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="product-data__row">
              <div className="product-data__column">
                <div className="product-data__field-container">
                  <div className="product-data__checkbox-container">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={fieldPropsExpose.field.value}
                          onChange={handleExposeChange}
                          onBlur={() => {
                            fieldPropsExpose.field.onBlur()
                            handleProductDataInputBlur()
                          }}
                          inputRef={fieldPropsExpose.field.ref}
                        />
                      }
                      label={'Показувати відвідувачам'}
                      disabled={isDataLoading}
                    />
                    {formErrors.expose ? (
                      <div className="product-data__error">{formErrors.expose}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="flex-justify-end">
            <Button variant="contained" onClick={handleSubmit(handleSubmitInner)}>
              Зберегти дані
            </Button>
          </div>
          <div className="product__cover-photo-container">
            <label className="product-data__field-label">Обкладинка</label>
            {fieldPropsPhotoCover.field.value ? (
              <>
                <img
                  className="product__cover-photo"
                  src={fieldPropsPhotoCover.field.value.pathPublic}
                  alt={'обкладинка'}
                />
                <div className="flex-justify-end">
                  <Button variant="contained" onClick={handlePhotoCoverRemove}>
                    Прибрати з обкладинки
                  </Button>
                </div>
              </>
            ) : (
              <Link className="link-inner" to="#photos-drawer">
                <Button variant="contained">Додати обкладинку</Button>
              </Link>
            )}
            {formErrors.photo_cover ? (
              <div className="product-data__error">{formErrors.photo_cover}</div>
            ) : null}
          </div>
        </div>
        <div className="layout-col-wide wide-section-container photos-sortable-container">
          <div className="wide-section__column-center">
            <label className="wide-section__label">Публічні фотографії</label>
          </div>
          {fieldPropsPhotosPublic.field.value.length ? (
            <DndProvider backend={HTML5Backend}>
              <PhotosSortable
                photos={fieldPropsPhotosPublic.field.value}
                reorderCb={handlePhotosReorder}
                disabled={isDataLoading}
              />
            </DndProvider>
          ) : (
            <div className="wide-section__column-center">
              <Link to="#photos-drawer">
                <Button variant="contained">Додати фотографії</Button>
              </Link>
            </div>
          )}
          {formErrors.photosPublic ? (
            <div className="wide-section__column-center">
              <div className="product-data__error">{formErrors.photosPublic}</div>
            </div>
          ) : null}
        </div>
        <div className="layout-col-wide wide-section-container">
          <div className="wide-section__column-center">
            <label
              id="photos-drawer"
              className={`wide-section__label${location.hash.slice(1) === 'photos-drawer' ? ' target' : ''}`}
            >
              Фотошухляда
            </label>
          </div>
          {state.photos_all.length ? (
            <PhotosDrawer
              photos={state.photos_all}
              handlePhotoPublicPick={handlePhotoPublicPick}
              handlePhotoCoverPick={handlePhotoCoverPick}
              handleRemovePhoto={handlePhotoRemove}
              disabled={isDataLoading}
            />
          ) : (
            <div className="wide-section__column-center">
              <Link to="#photos-upload">
                <Button variant="contained">Завантажити фотографії</Button>
              </Link>
            </div>
          )}
          {formErrors.photosPublic || formErrors.photo_cover ? (
            <div className="wide-section__column-center">
              <div className="product-data__error">
                {formErrors.photosPublic && formErrors.photo_cover
                  ? "Публічний продукт обо'язково повинен мати обкладинку і публічні фотографії"
                  : formErrors.photosPublic
                    ? "Публічний продукт обов'язково повинен мати публічні фотографії"
                    : "Публічний продукт обов'язково повинен мати обкладинку"}
              </div>
            </div>
          ) : null}
        </div>
        <div className="layout-col-center">
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label
                  id="photos-upload"
                  className={`product-data__field-label${location.hash.slice(1) === 'photos-upload' ? ' target' : ''}`}
                  htmlFor="photos-upload"
                >
                  Завантажити фото до фотошухляди
                </label>
                <input
                  type="file"
                  ref={photosFilesInputRef}
                  id="photos-upload"
                  accept="image/*"
                  multiple
                />
                <div className="flex-justify-end">
                  <Button variant="contained" onClick={handlePhotosUpload}>
                    Завантажити
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="layout-col-wide">
          <Divider />
        </div>
        <div className="layout-col-center">
          <div className="flex-justify-end">
            <Button variant="contained" color="error" onClick={handleDeleteProductClick}>
              Видалити продукт
            </Button>
          </div>
        </div>
        <Dialog
          open={isRemoveProductConfirmationDialogOpen}
          onClose={handleDeleteProductDialogClose}
        >
          <DialogContent>
            <DialogContentText>
              Ви впевнені, що хочете видалити продукт? Ви безповоротно втратите усі дані продукту та
              його фотографії.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleDeleteProductConfirmClick}>
              Видалити
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  return ProductNew
}

export default main
