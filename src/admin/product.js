import React, { Component, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, redirect } from 'react-router-dom'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import parseIsoTime from 'parseisotime'

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
    })
    const [photos_all, setPhotosAll] = useState([])

    const photosPublic = useMemo(
      () =>
        photos_all
          .filter(photo => photo.public)
          // sort in ascending order
          .sort((photoA, photoB) => (photoA.order > photoB.order ? 1 : -1)),
      [photos_all]
    )
    const photoCover = useMemo(() => photos_all.find(photo => photo.cover) || null, [photos_all])

    useEffect(() => {
      api.product.get(params.id, body => {
        setState(data.dataToState(body))
      })

      api.product.getPhotos(params.id, null, body => {
        setPhotosAll(body)
      })
    }, [])

    // make api request to upload photos
    const photosUpload = files => {
      api.product.upload(params.id, files, () => {
        api.product.getPhotos(params.id, null, body => {
          setPhotosAll(body)
        })
      })
    }

    // add or remove a photo from `photos` based on whether it's checked or not and make api request to update the `photos` field
    const pickCb = (picked, photo) => {
      api.product.updatePhotosPublicity(params.id, [{ id: photo.id, public: picked }], () => {
        // `expose` might have changed, so updating product state
        api.product.get(params.id, body => {
          setState(data.dataToState(body))

          if (!picked) {
            setPhotosAll(
              photos_all.map(_photo => {
                if (_photo.id !== photo.id) return _photo

                return { ..._photo, public: false }
              })
            )
          } else {
            const orderDesc = photosPublic
              .map(photo => photo.order)
              .sort((a, b) => (a < b ? 1 : -1))
            const orderGreatest = orderDesc[0] + 1

            setPhotosAll(
              photos_all.map(_photo => {
                if (_photo.id !== photo.id) return _photo

                return { ..._photo, public: true, order: orderGreatest }
              })
            )
          }
        })
      })
    }

    const removePhotoCb = photo => {
      api.product.removePhotos(params.id, [photo.id], body => {
        // `expose` might have changed, so updating product state
        api.product.get(params.id, body => {
          setState(data.dataToState(body))
          setPhotosAll(photos_all.filter(_photo => _photo.id !== photo.id))
        })
      })
    }

    const coverPickCb = photo => {
      api.product.setCoverPhoto(params.id, { id: photo.id, cover: true }, () => {
        setPhotosAll(
          photos_all.map(_photo => {
            if (_photo.id !== photo.id) return _photo

            return { ..._photo, cover: true }
          })
        )
      })
    }

    const photosReorderCb = photos => {
      const photosData = photos.map((photo, i) => ({ id: photo.id, order: i }))

      api.product.reorderPhotos(params.id, photosData, () => {
        const photosDataIds = photosData.map(photo => photo.id)

        setPhotosAll(
          photos_all.map(photo => {
            if (!photosDataIds.includes(photo.id)) return photo

            return { ...photo, order: photosData[photosDataIds.indexOf(photo.id)].order }
          })
        )
      })
    }

    const inputChange = _state => {
      console.log('inputChange, _state:', _state)
      api.product.update(params.id, data.stateToData(_state), null, body => {
        setState(data.dataToState(body))
      })
    }

    const deleteProductCb = () => {
      api.product.delete(params.id, () => {
        navigate('/dash/products')
      })
    }

    return {
      state,
      photos_all,
      photosPublic,
      photoCover,
      photosUpload,
      pickCb,
      removePhotoCb,
      coverPickCb,
      photosReorderCb,
      inputChange,
      deleteProductCb,
    }
  }

  function Product() {
    const product = useProduct()

    // conditionally render `PhotosAll`
    const [photosActive, setPhotosActive] = useState(false)
    const [photoActive, setPhotoActive] = useState(false)

    const inputKeydown = ev => {
      // if key is Enter
      if (13 === ev.keyCode) return ev.preventDefault()
    }

    const photosBtn = () => {
      setPhotosActive(!photosActive)
    }

    const photoBtn = () => {
      setPhotoActive(!photoActive)
    }

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
                product.state.photos !== null &&
                product.state.cover_photo &&
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
        />

        <span className="label">cover photo</span>
        {product.photoCover ? (
          <div className="photo cover-photo">
            <img src={product.photoCover.pathPublic} />
          </div>
        ) : null}

        <button className="control" onClick={photoBtn}>
          pick photo
        </button>
        {photoActive ? (
          <PhotoPicker
            photosAll={product.photos_all ? product.photos_all : []}
            photo={product.photoCover}
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
            photosAll={product.photos_all ? product.photos_all : []}
            photos={product.photosPublic}
            upload={product.photosUpload}
            pickCb={product.pickCb}
            removeCb={product.removePhotoCb}
          />
        ) : null}
        <button className="control" onClick={photosBtn}>
          add photos
        </button>
        <button className="control" onClick={product.deleteProductCb}>
          Delete Product
        </button>
      </form>
    )
  }

  return { ProductCreate, Product }
}

export default main
