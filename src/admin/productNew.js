import React, { Component, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, redirect } from 'react-router-dom'
import { boolean, number, string, object } from 'yup'
import { useForm } from 'react-hook-form'
import parseIsoTime from 'parseisotime'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@mui/material/Button/index.js'
import Typography from '@mui/material/Typography/index.js'
import TextField from '@mui/material/TextField/index.js'
import Checkbox from '@mui/material/Checkbox/index.js'
import FormControlLabel from '@mui/material/FormControlLabel/index.js'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker/index.js'

import * as data from './product-data.js'
import productValidate from './product-validate.js'
import { PhotoPicker, PhotosPicker } from './photos-picker.js'
import { PhotosSortable } from './photos-sortable.js'

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

const main = api => {
  const ProductNew = () => {
    const navigate = useNavigate()
    const params = useParams()

    const [state, setState] = useState({
      name: '',
      priceHrn: null,
      priceKop: null,
      expose: false,
      is_in_stock: false,
      description: '',
      time: null,
      photos_all: [],
      photo_cover: null,
    })
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isPhotosPickerVisible, setIsPhotosPickerVisible] = useState(false)
    const [isPhotoPickerVisible, setIsPhotoPickerVisible] = useState(false)
    const [timeData, setTimeData] = useState(state.time ? new Date(state.time) : null)

    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      trigger,
      getFieldState,
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
      },
      resolver: productValidate({ productExposedSchema, productNotExposedSchema }),
    })

    const photosPublic = useMemo(
      () =>
        state.photos_all
          .filter(photo => photo.public)
          // sort in ascending order
          .sort((photoA, photoB) => (photoA.order > photoB.order ? 1 : -1)),
      [state.photos_all]
    )

    useEffect(() => {
      setIsDataLoading(true)

      api.product.get(params.id, body => {
        setState(data.dataToState(body))
        setIsDataLoading(false)
      })
    }, [])

    // make api request to upload photos
    const photosUpload = files => {
      setIsDataLoading(true)

      api.product.upload(params.id, files, () => {
        api.product.get(params.id, body => {
          setState(data.dataToState(body))
          setIsDataLoading(false)
        })
      })
    }

    // add or remove a photo from `photos` based on whether it's checked or not and make api request to update the `photos` field
    const handlePhotoPick = (picked, photo) => {
      setIsDataLoading(true)

      api.product.updatePhotosPublicity(params.id, [{ id: photo.id, public: picked }], () => {
        // `expose` might have changed, so updating product state
        api.product.get(params.id, body => {
          setState(data.dataToState(body))

          setIsDataLoading(false)
        })
      })
    }

    const handlePhotoRemove = photo => {
      setIsDataLoading(true)

      api.product.removePhotos(params.id, [photo.id], body => {
        // `expose` might have changed, so updating product state
        api.product.get(params.id, body => {
          setState(data.dataToState(body))
          // setPhotosAll(photos_all.filter(_photo => _photo.id !== photo.id))

          setIsDataLoading(false)
        })
      })
    }

    const handlePhotoCoverPick = photo => {
      setIsDataLoading(true)

      api.product.setCoverPhoto(params.id, { id: photo.id, cover: true }, () => {
        setState({
          ...state,
          photos_all: state.photos_all.map(_photo => {
            if (_photo.id !== photo.id) return _photo

            return { ..._photo, cover: true }
          }),
          photo_cover: { ...photo, cover: true },
        })

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

    /*
      const inputChange = _state => {
      console.log('inputChange, _state:', _state)

      setIsDataLoading(true)

      api.product.update(params.id, data.stateToData(_state), null, body => {
        setState(data.dataToState(body))
        setIsDataLoading(false)
      })
    }
    */

    const handleDeleteProduct = () => {
      setIsDataLoading(true)

      api.product.delete(params.id, () => {
        setIsDataLoading(false)
        navigate('/dash/products')
      })
    }

    const handleSubmitInner = async values => {
      console.log('handleSubmitInner, values:', values)
    }

    const handleSubmitErrors = async errors => {
      console.log('handleSubmitErrors, errors:', errors)
    }

    const fieldPropsTime = register('time')

    useEffect(() => {
      const date = state.time ? new Date(state.time) : null
      setTimeData(date)
      setValue('time', date)
    }, [state])

    return (
      <div className="product-container">
        <form className="product-data-form">
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label htmlFor="name">Назва</label>
                <TextField
                  id="name"
                  placeholder="Назва"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name || null}
                />
              </div>
            </div>
          </div>
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label htmlFor="description">Опис</label>
                <TextField
                  id="description"
                  placeholder="Опис"
                  multiline
                  minRows={6}
                  maxRows={12}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description || null}
                />
              </div>
            </div>
          </div>
          <div className="product-data__row-2">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label htmlFor="priceHrn">Ціна: гривні</label>
                <TextField
                  id="priceHrn"
                  placeholder="Гривні"
                  type="number"
                  {...register('priceHrn')}
                  error={!!errors.priceHrn}
                  helperText={errors.priceHrn || null}
                />
              </div>
            </div>
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label htmlFor="priceKop">Ціна: копійки</label>
                <TextField
                  id="priceKop"
                  placeholder="Копійки"
                  type="number"
                  {...register('priceKop')}
                  error={!!errors.priceKop}
                  helperText={errors.priceKop || null}
                />
              </div>
            </div>
          </div>
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <div className="product-data__checkbox-container">
                  <FormControlLabel
                    control={<Checkbox {...register('is_in_stock')} />}
                    label={'В наявності'}
                  />
                  {errors.is_in_stock ? (
                    <div className="product-data__error">{errors.is_in_stock}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <label htmlFor="time">Час створення</label>
                <DateTimePicker
                  id="time"
                  value={timeData}
                  name={fieldPropsTime.name}
                  onBlur={fieldPropsTime.onBlur}
                  inputRef={fieldPropsTime.ref}
                  onChange={date => {
                    setTimeData(date)
                    setValue('time', date)
                    trigger('time')
                  }}
                />
                {errors.time ? <div className="product-data__error">{errors.time}</div> : null}
              </div>
            </div>
          </div>
          <div className="product-data__row">
            <div className="product-data__column">
              <div className="product-data__field-container">
                <div className="product-data__checkbox-container">
                  <FormControlLabel
                    control={<Checkbox {...register('expose')} />}
                    label={'Показувати відвідувачам'}
                  />
                  {errors.expose ? (
                    <div className="product-data__error">{errors.expose}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </form>
        <Button onClick={handleSubmit(handleSubmitInner, handleSubmitErrors)}>Submit</Button>
      </div>
    )
  }

  return ProductNew
}

export default main
