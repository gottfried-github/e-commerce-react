import React, { Component, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, redirect } from 'react-router-dom'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import parseIsoTime from 'parseisotime'

import { exposePromise } from '../utils/utils.js'
import * as data from './product-data.js'
import { PhotoPicker, PhotosPicker } from './photos-picker.js'
import { PhotosSortable } from './photos-sortable.js'

function main(api) {
  function ProductCreate() {
    const navigate = useNavigate()

    const [msg, setMsg] = useState('')

    useEffect(() => {
      api.product.create(
        {
          expose: false,
          // see Time in readme
          time: Date.now(),
        },
        (body, res) => {
          console.log('ProductCreate api success cb, body:', body)
          return navigate(`${body}`)
        },
        (body, res) => {
          if (res.status >= 500) {
            return alert("Something's wrong on the server, please consult a technician")
          }

          setMsg('Something wrong with the request, please consult a technician')
          console.log('bad request - body, res:', body, res)
        }
      )
    }, [])

    return <div>{msg}</div>
  }

  function useProduct() {
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

    const photosPublic = useMemo(
      () =>
        state.photos_all
          .filter(photo => photo.public)
          // sort in ascending order
          .sort((photoA, photoB) => (photoA.order > photoB.order ? 1 : -1)),
      [state.photos_all]
    )

    const [isDataLoading, setIsDataLoading] = useState(false)

    useEffect(() => {
      const promiseProduct = exposePromise()
      const promisePhotos = exposePromise()

      setIsDataLoading(true)

      Promise.all([promiseProduct.promise]).then(() => {
        setIsDataLoading(false)
      })

      api.product.get(params.id, body => {
        setState(data.dataToState(body))
        promiseProduct.resolve()
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
    const pickCb = (picked, photo) => {
      setIsDataLoading(true)

      api.product.updatePhotosPublicity(params.id, [{ id: photo.id, public: picked }], () => {
        // `expose` might have changed, so updating product state
        api.product.get(params.id, body => {
          setState(data.dataToState(body))

          setIsDataLoading(false)
        })
      })
    }

    const removePhotoCb = photo => {
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

    const coverPickCb = photo => {
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

    const photosReorderCb = photos => {
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

    const inputChange = _state => {
      console.log('inputChange, _state:', _state)

      setIsDataLoading(true)

      api.product.update(params.id, data.stateToData(_state), null, body => {
        setState(data.dataToState(body))
        setIsDataLoading(false)
      })
    }

    const deleteProductCb = () => {
      setIsDataLoading(true)

      api.product.delete(params.id, () => {
        setIsDataLoading(false)
        navigate('/dash/products')
      })
    }

    return {
      state,
      photosPublic,
      photosUpload,
      pickCb,
      removePhotoCb,
      coverPickCb,
      photosReorderCb,
      inputChange,
      deleteProductCb,
      disabled: isDataLoading,
    }
  }

  function Product() {
    const product = useProduct()

    // conditionally render `PhotosAll`
    const [photosActive, setPhotosActive] = useState(false)
    const [photoActive, setPhotoActive] = useState(false)

    useEffect(() => {
      if (!product.disabled) return

      setPhotosActive(false)
      setPhotoActive(false)
    }, [product.disabled])

    const inputKeydown = ev => {
      // if key is Enter
      if (13 === ev.keyCode) return ev.preventDefault()
    }

    const photosBtn = () => {
      if (product.disabled) return

      setPhotosActive(!photosActive)
    }

    const photoBtn = () => {
      if (product.disabled) return

      setPhotoActive(!photoActive)
    }

    // TODO: put this chunk of code into a hook
    let time = null
    if (product.state.time) {
      const _time = new Date(product.state.time)
      // see Converting javascript Date object to HTML date/time inputs, in readme
      _time.setTime(_time.getTime() - _time.getTimezoneOffset() * 60000)
      time = parseIsoTime(_time.toISOString())
    }

    const dateRef = useRef()
    const timeRef = useRef()

    return (
      <form onSubmit={ev => ev.preventDefault()} className="form">
        <label className="label" htmlFor="name">
          name
        </label>
        <input
          id="name"
          className="input-text"
          type="text"
          defaultValue={product.state.name}
          onBlur={ev =>
            product.inputChange(Object.assign(product.state, { name: ev.target.value }))
          }
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="price-hrn">
          hrn
        </label>
        <input
          id="price-hrn"
          className="input-number"
          type="number"
          defaultValue={product.state.priceHrn}
          onBlur={ev =>
            product.inputChange(
              Object.assign(product.state, { priceHrn: parseInt(ev.target.value, 10) })
            )
          }
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="price-kop">
          kop
        </label>
        <input
          id="price-kop"
          className="input-number"
          type="number"
          defaultValue={product.state.priceKop}
          onBlur={ev =>
            product.inputChange(
              Object.assign(product.state, { priceKop: parseInt(ev.target.value, 10) })
            )
          }
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="expose">
          expose
        </label>
        <input
          id="expose"
          className="input-checkbox"
          type="checkbox"
          checked={product.state.expose}
          onChange={ev => {
            /* don't check if any of the other fields are not filled */
            if (ev.target.checked) {
              if (
                product.state.name.length &&
                product.state.priceHrn !== null &&
                product.state.priceKop !== null &&
                typeof product.state.is_in_stock === 'boolean' &&
                product.photosPublic.length &&
                product.state.photo_cover &&
                product.state.description.length &&
                product.state.time !== null
              )
                return product.inputChange(
                  Object.assign(product.state, { expose: ev.target.checked })
                )

              ev.target.checked = false
              return
            }

            return product.inputChange(Object.assign(product.state, { expose: ev.target.checked }))
          }}
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="is-in-stock">
          in stock
        </label>
        <input
          id="is-in-stock"
          className="input-checkbox"
          type="checkbox"
          checked={product.state.is_in_stock}
          onChange={ev =>
            product.inputChange(Object.assign(product.state, { is_in_stock: ev.target.checked }))
          }
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="description">
          description
        </label>
        <input
          id="description"
          className="input-text"
          type="text"
          defaultValue={product.state.description}
          onBlur={ev =>
            product.inputChange(Object.assign(product.state, { description: ev.target.value }))
          }
          onKeyDown={inputKeydown}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="date">
          date
        </label>
        <input
          id="date"
          type="date"
          ref={dateRef}
          defaultValue={time ? time.date : ''}
          onBlur={ev => {
            product.inputChange({
              ...product.state,
              // see Sending time in readme
              time: new Date(`${ev.target.value}T${timeRef.current.value || '00:00'}`).getTime(),
            })
          }}
          disabled={product.disabled}
        />

        <label className="label" htmlFor="time">
          time
        </label>
        <input
          id="time"
          type="time"
          ref={timeRef}
          defaultValue={time ? time.time : ''}
          onBlur={ev => {
            if (!dateRef.current.value) return

            product.inputChange({
              ...product.state,
              time: new Date(`${dateRef.current.value}T${ev.target.value}`).getTime(),
            })
          }}
          disabled={product.disabled}
        />

        <span className="label">cover photo</span>
        {product.state.photo_cover ? (
          <div className="photo cover-photo">
            <img src={product.state.photo_cover.pathPublic} />
          </div>
        ) : null}

        <button className="control" onClick={photoBtn} disabled={product.disabled}>
          pick photo
        </button>
        {photoActive ? (
          <PhotoPicker
            photosAll={product.state.photos_all}
            photo={product.state.photo_cover}
            pickCb={product.coverPickCb}
            upload={product.photosUpload}
          />
        ) : null}

        <span className="label">photos</span>
        <DndProvider backend={HTML5Backend}>
          <PhotosSortable photos={product.photosPublic} reorderCb={product.photosReorderCb} />
        </DndProvider>
        {photosActive ? (
          <PhotosPicker
            photosAll={product.state.photos_all}
            photos={product.photosPublic}
            upload={product.photosUpload}
            pickCb={product.pickCb}
            removeCb={product.removePhotoCb}
          />
        ) : null}
        <button className="control" onClick={photosBtn} disabled={product.disabled}>
          add photos
        </button>
        <button className="control" onClick={product.deleteProductCb} disabled={product.disabled}>
          Delete Product
        </button>
      </form>
    )
  }

  return { ProductCreate, Product }
}

export default main
