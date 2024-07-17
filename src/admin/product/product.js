import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useForm, useController } from 'react-hook-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@mui/material/Button/index.js'
import TextField from '@mui/material/TextField/index.js'
import Checkbox from '@mui/material/Checkbox/index.js'
import FormControlLabel from '@mui/material/FormControlLabel/index.js'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker/index.js'
import Dialog from '@mui/material/Dialog/index.js'
import DialogContent from '@mui/material/DialogContent/index.js'
import DialogContentText from '@mui/material/DialogContentText/index.js'
import DialogActions from '@mui/material/DialogActions/index.js'
import Divider from '@mui/material/Divider/index.js'
import { Editor } from '@tinymce/tinymce-react'

import { omit } from '../utils/utils.js'
import { reorderPhotos, setCoverPhoto, removeCoverPhoto, setState } from '../actions/product.js'
import stateReducer, {
  setPhotoPublicStatus as setPhotoPublicStatusReducer,
  removePhoto as removePhotoReducer,
  getPhotosPublic,
} from '../reducers/product.js'
import * as data from './product-data.js'
import productValidate from './product-validate.js'
import ProductDataField from './components/ProductDataField.js'
import ProductDataWideSection from './components/ProductDataWideSection.js'
import { PhotosSortable } from './components/photos-sortable.js'
import PhotosDrawer from './components/photos-drawer.js'

const getFormState = state => ({
  name: state.name,
  description: state.description,
  priceHrn: state.priceHrn,
  priceKop: state.priceKop,
  is_in_stock: state.is_in_stock,
  time: state.time ? new Date(state.time) : null,
  expose: state.expose,
  photo_cover: state.photo_cover,
  photosPublic: getPhotosPublic(state.photos_all),
})

const main = api => {
  const Product = () => {
    const navigate = useNavigate()
    const params = useParams()
    const location = useLocation()
    const validate = productValidate()

    const [state, dispatch] = useReducer(stateReducer, {
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
    const [isError, setIsError] = useState(false)
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(true)
    const [isRemoveProductConfirmationDialogOpen, setIsRemoveProductConfirmationDialogOpen] =
      useState(false)
    const [timeData, setTimeData] = useState(state.time ? new Date(state.time) : null)

    const formState = useMemo(() => getFormState(state), [state])
    const photosPublic = useMemo(() => getPhotosPublic(state.photos_all), [state.photos_all])

    const {
      register,
      handleSubmit,
      formState: { errors: formErrors },
      getValues,
      setValue,
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

    useEffect(() => {
      // react-hook-form doesn't validate when useForm `values` option changes, so need to validate manually
      trigger()
    }, [formState])

    // controller for TinyMCE
    const fieldPropsDescription = useController({ name: 'description', control })
    // I use controllers for checkboxes. See Admin: `react-hook-form` and `mui` - handling checkboxes
    const fieldPropsIsInStock = useController({ name: 'is_in_stock', control })
    const fieldPropsExpose = useController({ name: 'expose', control })
    const fieldPropsPhotoCover = useController({ name: 'photo_cover', control })
    const fieldPropsPhotosPublic = useController({ name: 'photosPublic', control })

    const photosFilesInputRef = useRef()

    useEffect(() => {
      setIsDataLoading(true)

      api.product.get(
        params.id,
        body => {
          const stateData = data.dataToState(body)
          dispatch(setState({ state: stateData }))
          reset(getFormState(stateData))

          setIsDataLoading(false)
        },
        (body, res) => {
          console.log('api.product.get errored - body, res:', body, res)
          setIsError(true)
          setIsDataLoading(false)
        }
      )
    }, [])

    const handleSubmitInner = async values => {
      delete values.photo_cover
      delete values.photosPublic

      const fieldsToRemove = Object.keys(omit(state, ['photo_cover', 'photos_all'])).reduce(
        (fieldsToRemove, k) => {
          if (k in values) return fieldsToRemove

          fieldsToRemove.push(k)
          return fieldsToRemove
        },
        []
      )

      setIsDataLoading(true)

      api.product.update(
        params.id,
        data.stateToData(values),
        fieldsToRemove.length ? fieldsToRemove : null,
        body => {
          const stateData = data.dataToState(body)
          dispatch(setState({ state: stateData }))
          reset(getFormState(stateData))

          setIsDataLoading(false)
        },
        (body, res) => {
          console.log('api.product.update responded with failure - body, res:', body, res)

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    const handleDeleteProductConfirmClick = () => {
      setIsDataLoading(true)

      api.product.delete(
        params.id,
        () => {
          setIsDataLoading(false)
          setIsRemoveProductConfirmationDialogOpen(false)
          navigate('/dash/products')
        },
        () => {
          console.log(
            'handleDeleteProductConfirmClick, api.product.delete responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    const handlePhotoCoverPick = photo => {
      setIsDataLoading(true)

      api.product.setCoverPhoto(
        params.id,
        { id: photo.id, cover: true },
        () => {
          dispatch(setCoverPhoto({ photo }))
          setIsDataLoading(false)
        },
        (body, res) => {
          console.log(
            'handlePhotoCoverPick, api.product.setCoverPhoto responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
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
        () => {
          dispatch(removeCoverPhoto())
          setIsDataLoading(false)
        },
        (body, res) => {
          console.log(
            'handlePhotoCoverRemove, api.product.setCoverPhoto responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    // add or remove a photo from `photos` based on whether it's checked or not and make api request to update the `photos` field
    const handlePhotoPublicPick = async (picked, photo) => {
      const stateNew = setPhotoPublicStatusReducer(state, { photo, publicStatus: picked })
      const photosPublicNew = getPhotosPublic(stateNew.photos_all)

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
          dispatch(setState({ state: stateNew }))
          setIsDataLoading(false)
        },
        (body, res) => {
          console.log(
            'handlePhotoPublicPick, api.product.updatePhotosPublicity responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    const handlePhotoRemove = async photo => {
      const stateNew = removePhotoReducer(state, { photo })
      const photosPublicNew = getPhotosPublic(stateNew.photos_all)

      const values = getValues()

      const { errors } = await validate(
        {
          ...values,
          expose: formState.expose,
          photosPublic: photosPublicNew,
          photo_cover: stateNew.photo_cover,
        },
        {}
      )

      setErrors(errors)

      if (errors.photosPublic || errors.photo_cover) return

      setIsDataLoading(true)

      api.product.removePhotos(
        params.id,
        [photo.id],
        body => {
          dispatch(setState({ state: stateNew }))
          setIsDataLoading(false)
        },
        (body, res) => {
          console.log(
            'handlePhotoRemove, api.product.removePhotos responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    const handlePhotosReorder = photos => {
      const photosData = photos.map((photo, i) => ({ id: photo.id, order: i }))

      setIsDataLoading(true)

      api.product.reorderPhotos(
        params.id,
        photosData,
        () => {
          dispatch(reorderPhotos({ photos: photosData }))
          setIsDataLoading(false)
        },
        (body, res) => {
          console.log(
            'handlePhotosReorder, api.product.reorderPhotos responded with failure - body, res:',
            body,
            res
          )

          setIsDataLoading(false)
          setIsError(true)
        }
      )
    }

    // make api request to upload photos
    const handlePhotosUpload = () => {
      const files = photosFilesInputRef.current.files

      if (!files.length) return

      setIsDataLoading(true)

      api.product.upload(params.id, files, () => {
        api.product.get(
          params.id,
          body => {
            dispatch(setState({ state: data.dataToState(body) }))
            setIsDataLoading(false)
            photosFilesInputRef.current.value = ''
            console.log(
              'handlePhotosUpload, photosFilesInputRef.current.files:',
              photosFilesInputRef.current.files
            )
          },
          (body, res) => {
            console.log(
              'handlePhotosUpload, api.product.upload responded with failure - body, res:',
              body,
              res
            )

            setIsDataLoading(false)
            photosFilesInputRef.current.files = []
            setIsError(true)
          }
        )
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

    const handleDeleteProductClick = () => {
      setIsRemoveProductConfirmationDialogOpen(true)
    }

    const handleDeleteProductDialogClose = () => {
      setIsRemoveProductConfirmationDialogOpen(false)
    }

    const handleErrorDialogClose = () => {
      setIsErrorDialogOpen(false)
    }

    const fieldPropsTime = register('time')

    useEffect(() => {
      const date = state.time ? new Date(state.time) : null
      setTimeData(date)
      setValue('time', date)
    }, [state])

    return (
      <>
        {isError ? (
          <div>
            <Dialog open={isErrorDialogOpen} onClose={handleErrorDialogClose}>
              <DialogContent>
                <DialogContentText>
                  Сталася помилка. Будь-ласка, перезавантажте сторінку.
                </DialogContentText>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="product-container">
            <div className="layout-col-center">
              <form className="product-data-form" onSubmit={handleFormElSubmit}>
                <div className="product-data__row">
                  <div className="product-data__column">
                    <ProductDataField
                      id="name"
                      label="Назва"
                      content={({ id, label }) => (
                        <TextField
                          id={id}
                          placeholder={label}
                          {...register('name', { onBlur: handleProductDataInputBlur })}
                          error={!!formErrors.name}
                          helperText={formErrors.name || null}
                          disabled={isDataLoading}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="product-data__row">
                  <div className="product-data__column">
                    <ProductDataField
                      id="description"
                      label="Опис"
                      error={formErrors.description || null}
                      content={({ id, label }) => (
                        <Editor
                          value={fieldPropsDescription.field.value}
                          onEditorChange={v => {
                            fieldPropsDescription.field.onChange(v)
                          }}
                          onBlur={v => {
                            fieldPropsDescription.field.onBlur(v)
                          }}
                          disabled={isDataLoading}
                          init={{
                            height: 500,
                            menubar: 'insert',
                            menu: {
                              insert: {
                                title: 'Insert',
                                items: 'link charmap insertdatetime',
                              },
                            },
                            plugins: [
                              // 'advlist',
                              'autolink',
                              'lists',
                              'link',
                              'charmap',
                              'insertdatetime',
                              'help',
                              'wordcount',
                            ],
                            toolbar:
                              'undo redo | ' +
                              'bold italic underline | bullist numlist | ' +
                              'removeformat | help',
                            content_style:
                              'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
                          }}
                          tinymceScriptSrc="/tinymce/tinymce.min.js"
                          licenseKey="gpl"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="product-data__row-2">
                  <div className="product-data__column">
                    <ProductDataField
                      id="priceHrn"
                      label="Ціна: гривні"
                      content={({ id, label }) => (
                        <TextField
                          id={id}
                          placeholder={label}
                          type="number"
                          {...register('priceHrn', { onBlur: handleProductDataInputBlur })}
                          error={!!formErrors.priceHrn}
                          helperText={formErrors.priceHrn || null}
                          disabled={isDataLoading}
                        />
                      )}
                    />
                  </div>
                  <div className="product-data__column">
                    <ProductDataField
                      id="priceKop"
                      label="Ціна: копійки"
                      content={({ id }) => (
                        <TextField
                          id={id}
                          placeholder="Копійки"
                          type="number"
                          {...register('priceKop', { onBlur: handleProductDataInputBlur })}
                          error={!!formErrors.priceKop}
                          helperText={formErrors.priceKop || null}
                          disabled={isDataLoading}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="product-data__row">
                  <div className="product-data__column">
                    <ProductDataField
                      error={formErrors.is_in_stock}
                      content={() => (
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
                      )}
                    />
                  </div>
                </div>
                <div className="product-data__row">
                  <div className="product-data__column">
                    <ProductDataField
                      id="time"
                      label="Час створення"
                      error={formErrors.time}
                      content={({ id }) => (
                        <DateTimePicker
                          id={id}
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
                      )}
                    />
                  </div>
                </div>
                <div className="product-data__row">
                  <div className="product-data__column">
                    <ProductDataField
                      error={formErrors.expose}
                      content={() => (
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
                      )}
                    />
                  </div>
                </div>
              </form>
              <div className="flex-justify-end">
                <Button
                  variant="contained"
                  disabled={isDataLoading}
                  onClick={handleSubmit(handleSubmitInner)}
                >
                  Зберегти дані
                </Button>
              </div>
              <ProductDataField
                label="Обкладинка"
                error={formErrors.photo_cover}
                content={() => (
                  <>
                    {fieldPropsPhotoCover.field.value ? (
                      <>
                        <img
                          className="product__cover-photo"
                          src={fieldPropsPhotoCover.field.value.pathsPublic.l}
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
                        <Button variant="contained" disabled={isDataLoading}>
                          Додати обкладинку
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              />
            </div>
            <ProductDataWideSection
              label="Публічні фотографії"
              error={formErrors.photosPublic}
              content={() => (
                <>
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
                      <div className="flex-justify-end">
                        <Link to="#photos-drawer">
                          <Button variant="contained">Додати фотографії</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            />
            <ProductDataWideSection
              label="Фотошухляда"
              target={location.hash.slice(1) === 'photos-drawer'}
              error={
                formErrors.photosPublic && formErrors.photo_cover
                  ? "Публічний продукт обо'язково повинен мати обкладинку і публічні фотографії"
                  : formErrors.photosPublic
                    ? "Публічний продукт обов'язково повинен мати публічні фотографії"
                    : formErrors.photo_cover
                      ? "Публічний продукт обов'язково повинен мати обкладинку"
                      : null
              }
              content={() => (
                <>
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
                      <div className="flex-justify-end">
                        <Link to="#photos-upload">
                          <Button variant="contained">Завантажити фотографії</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            />
            <div className="layout-col-center">
              <div className="product-data__row">
                <div className="product-data__column">
                  <ProductDataField
                    id="photos-upload"
                    label="Завантажити фото до фотошухляди"
                    target={location.hash.slice(1) === 'photos-upload'}
                    content={({ id }) => (
                      <>
                        <input
                          type="file"
                          ref={photosFilesInputRef}
                          id={id}
                          accept="image/*"
                          multiple
                        />
                        <div className="flex-justify-end">
                          <Button variant="contained" onClick={handlePhotosUpload}>
                            Завантажити
                          </Button>
                        </div>
                      </>
                    )}
                  />
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
                  Ви впевнені, що хочете видалити продукт? Ви безповоротно втратите усі дані
                  продукту та його фотографії.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="error" onClick={handleDeleteProductConfirmClick}>
                  Видалити
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </>
    )
  }

  return Product
}

export default main
