import React, {Component, useState, useEffect, useRef} from "react"
import {useNavigate, useParams, redirect} from 'react-router-dom'

import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {useDrag, useDrop} from 'react-dnd'

import * as data from './product-data.js'

function main(api) {
    const DndTypes = {
        item: 'ITEM'
    }

    function ProductCreate() {
        const navigate = useNavigate()

        const [msg, setMsg] = useState('')

        useEffect(() => {
            api.product.create({expose: false}, (body, res) => {
                console.log("ProductCreate api success cb, body:", body)
                return navigate(`${body}`)
            }, (body, res) => {
                if (res.status >= 500) {
                    return alert("Something's wrong on the server, please consult a technician")
                }
    
                setMsg("Something wrong with the request, please consult a technician")
                console.log("bad request - body, res:", body, res);
            })
        }, [])

        return (<div>{msg}</div>)
    }

    function useProduct() {
        const params = useParams()

        const [state, setState] = useState({
            name: '', 
            priceHrn: null, priceKop: null, 
            expose: false,
            is_in_stock: false,
            photos: null,
            cover_photo: '',
            description: ''
        })
        const [photos_all, setPhotosAll] = useState([])

        useEffect(() => {
            api.product.get(params.id, (body) => {
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }, [])

        // make api request to upload photos
        const photosUpload = (files) => {
            api.product.upload(params.id, files, (body) => {
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }

        // add or remove a photo from `photos` based on whether it's checked or not and make api request to update the `photos` field
        const pickCb = (picked, photo) => {
            const photosPicked = state.photos ? [...state.photos] : []

            if (!picked) {
                photosPicked.splice(photosPicked.map(photo => photo.id).indexOf(photo.id), 1)
            } else {
                photosPicked.push(photo)
            }

            if (!photosPicked.length) {
                return api.product.update(params.id, data.stateToData({...state, photos: null}), ['photos'], (body) => {
                    console.log('Product, product.update successCb - body:', body);
                    setPhotosAll(body.photos_all)
                    setState(data.dataToState(body))
                })
            }

            api.product.update(params.id, data.stateToData({...state, photos: photosPicked}), null, (body) => {
                console.log('Product, product.update successCb - body:', body);
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }

        const photosReorderCb = (photos) => {
            console.log('photosReorderCb - photos, state.photos:', photos, state.photos)
            api.product.update(params.id, data.stateToData({...state, photos}), null, (body) => {
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }

        const inputChange = (_state) => {
            api.product.update(params.id, data.stateToData(_state), null, (body) => {
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }

        return {state, photos_all, photosUpload, pickCb, photosReorderCb, inputChange}
    }

    function Product() {
        const product = useProduct()

        // conditionally render `PhotosAll`
        const [photosActive, setPhotosActive] = useState(false)

        const inputKeydown = (ev) => {
            // if key is Enter
            if (13 === ev.keyCode) return ev.preventDefault()
        }

        const photosBtn = () => {
            setPhotosActive(!photosActive)
        }

        return (
            <form onSubmit={ev => ev.preventDefault()} className="form">
                <label className="label" htmlFor="name">name</label>
                <input id="name" className="input-text" type="text" 
                    defaultValue={product.state.name}
                    onBlur={(ev) => product.inputChange(Object.assign(product.state, {name: ev.target.value}))}
                    onKeyDown={inputKeydown}
                />

                <label className="label" htmlFor="price-hrn">hrn</label>
                <input id="price-hrn" className="input-number" type="number" 
                    defaultValue={product.state.priceHrn}
                    onBlur={(ev) => product.inputChange(Object.assign(product.state, {priceHrn: parseInt(ev.target.value, 10)}))} 
                    onKeyDown={inputKeydown}
                />

                <label className="label" htmlFor="price-kop">kop</label>
                <input id="price-kop" className="input-number" type="number" 
                    defaultValue={product.state.priceKop}
                    onBlur={(ev) => product.inputChange(Object.assign(product.state, {priceKop: parseInt(ev.target.value, 10)}))}
                    onKeyDown={inputKeydown}
                />

                <label className="label" htmlFor="expose">expose</label>
                <input id="expose" className="input-checkbox" type="checkbox" 
                    defaultValue={product.state.expose}
                    onChange={(ev) => {
                        /* don't check if any of the other fields are not filled */
                        if (ev.target.checked) {
                            if (
                                state.name.length &&
                                state.priceHrn !== null &&
                                state.priceKop !== null &&
                                typeof(is_in_stock) === 'boolean' &&
                                state.photos !== null &&
                                state.cover_photo.length &&
                                state.description.length
                            ) return product.inputChange(Object.assign(product.state, {expose: ev.target.checked}))

                            ev.target.checked = false
                            return
                        }

                        return product.inputChange(Object.assign(product.state, {expose: ev.target.checked}))
                    }}
                    onKeyDown={inputKeydown}
                />

                <label className="label" htmlFor="is-in-stock">in stock</label>
                <input id="is-in-stock" className="input-checkbox" type="checkbox"
                    defaultValue={product.state.is_in_stock}
                    onChange={(ev) => product.inputChange(Object.assign(product.state, {is_in_stock: ev.target.checked}))}
                    onKeyDown={inputKeydown}
                />

                <label className="label" htmlFor="description">description</label>
                <input id="description" className="input-text" type="text" 
                    defaultValue={product.state.description}
                    onBlur={(ev) => product.inputChange(Object.assign(product.state, {description: ev.target.value}))}
                    onKeyDown={inputKeydown}
                />

                <span className="label">photos</span>
                {photosActive 
                    ? 
                    <PhotosPicker 
                        photosAll={product.photos_all ? product.photos_all : []} photos={product.state.photos ? product.state.photos : []} 
                        upload={product.photosUpload} pickCb={product.pickCb}
                    />
                    
                    : 
                    null}
                <DndProvider backend={HTML5Backend}>
                    <PhotosSortable 
                        photos={product.state.photos ? product.state.photos : []} 
                        reorderCb={product.photosReorderCb}
                    />
                </DndProvider>
                <button className="control" onClick={photosBtn}>add photos</button>
            </form>
        )
    }

    function PhotosPicker({photosAll, photos, pickCb, upload}) {
        return (
            <div className="photos-container">
                <PhotosPickable 
                    photos={photosAll.map(photo => 
                        Object.assign({picked: photos.map(photo => photo.id).includes(photo.id)}, photo)
                    )} 
                    pickCb={pickCb} 
                />
                <PhotosUpload upload={upload}/>
            </div>
        )
    }

    function PhotosUpload({upload}) {
        const files = useRef()

        return (
            <div>
                <input id="photos-upload" ref={files} type='file' accept="image/*" multiple />
                <button onClick={() => {
                    upload(files.current.files)
                }}>upload</button>
            </div>
        )
    }

    /**
     * @param {Array} photos photos to pick from
     * @param {Function} pickCb callback to pass to PhotoPicked
     * @description renders `photos` using PhotoPickable
    */
    function PhotosPickable({photos, pickCb}) {
        return (
            <div className="photos">{
                photos.map(photo => <PhotoPickable 
                    key={photo.id} 
                    photo={photo} 
                    pickCb={pickCb}
                    picked={photo.picked}
                />)
            }</div>
        )
    }

    /**
     * @param {Object} photo photo to render
     * @param {Boolean} picked whether to render the photo checkmarked
     * @param {Function} pickCb callback for when photo gets checked or unchecked
    */
    function PhotoPickable({photo, picked, pickCb}) {
        const _pickCb = (ev) => {
          pickCb(ev.target.checked, photo)
        }

        return (
          <div className="photo photo-pickable">
              <img src={photo.path} />
              
              {
              picked 
              ? 
              <input type="checkbox" onChange={_pickCb} defaultChecked></input>

              :
              <input type="checkbox" onChange={_pickCb}></input>
              }
          </div>
        )
    }

    /**
     * @param {Array} photos photos to render
     * @param {Function} reorderCb callback to fire on reorder
     * @description uses react-dnd to reorder rendered photos
    */
    function PhotosSortable({photos, reorderCb}) {
        const dropCb = (target, source) => {
            const _photos = [...photos]

            const tI = _photos.map(photo => photo.id).indexOf(target)
            const sI = _photos.map(photo => photo.id).indexOf(source)

            // insert source before target
            _photos.splice(tI, 0, _photos.splice(sI, 1)[0])

            reorderCb(_photos)
        }

        return (
            <div className="photos">
                {photos.map(photo => <PhotoSortable 
                    key={photo.id}
                    id={photo.id} 
                    photo={photo} 
                    dropCb={dropCb}
                />)}
            </div>
        )
    }

    /**
     * @param {String} id the photo's id as it is in the array of photos at the level above
     * @param {Object} photo the photo
     * @param {Function} dropCb callback to fire when a photo is dropped on the photo
     * @description uses react-dnd to implement draggable and droppable photos
    */
    function PhotoSortable({id, photo, dropCb}) {
        const [collectedDrop, drop] = useDrop({
            accept: DndTypes.item,
            // hover: (item, monitor) => {
            //     console.log('Item, hover - item:', item)
            // },
            drop: (item, monitor) => {
                dropCb(id, item.id)
            }
        })
    
        const [collectedDrag, drag, dragPreview] = useDrag(() => ({
            type: DndTypes.item,
            item: {id},
        }))
    
        const ref = useRef()
        drag(drop(ref))

        return (
            <div className='photo photo-sortable' ref={ref}>
                <img src={photo.path} />
            </div>
        )
    }

    return {ProductCreate, Product}
}

export default main