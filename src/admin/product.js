import React, {Component, useState, useEffect, useRef} from "react"
import {useNavigate, useParams, redirect} from 'react-router-dom'

import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import * as data from './product-data.js'
import {PhotoPicker, PhotosPicker} from './photos-picker.js'
import {PhotosSortable} from './photos-sortable.js'

function main(api) {

    function ProductCreate() {
        const navigate = useNavigate()

        const [msg, setMsg] = useState('')

        useEffect(() => {
            api.product.create({
                expose: false,
                // see Time in readme
                time: Date.now()
            }, (body, res) => {
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

        const coverPickCb = (photo) => {
            console.log('coverPickCb, photo:', photo)
            api.product.update(params.id, data.stateToData({...state, cover_photo: photo}), null, (body) => {
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
            console.log('inputChange, _state:', _state)
            api.product.update(params.id, data.stateToData(_state), null, (body) => {
                setPhotosAll(body.photos_all)
                setState(data.dataToState(body))
            })
        }

        return {state, photos_all, photosUpload, pickCb, coverPickCb, photosReorderCb, inputChange}
    }

    function Product() {
        const product = useProduct()

        // conditionally render `PhotosAll`
        const [photosActive, setPhotosActive] = useState(false)
        const [photoActive, setPhotoActive] = useState(false)

        const inputKeydown = (ev) => {
            // if key is Enter
            if (13 === ev.keyCode) return ev.preventDefault()
        }

        const photosBtn = () => {
            setPhotosActive(!photosActive)
        }

        const photoBtn = () => {
            setPhotoActive(!photoActive)
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
                                product.state.name.length &&
                                product.state.priceHrn !== null &&
                                product.state.priceKop !== null &&
                                typeof(product.state.is_in_stock) === 'boolean' &&
                                product.state.photos !== null &&
                                product.state.cover_photo &&
                                product.state.description.length
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

                <span className="label">cover photo</span>
                {
                    product.state.cover_photo 
                    
                    ? 
                    <div className="photo cover-photo">
                        <img src={product.state.cover_photo.path}/>
                    </div>

                    :
                    null
                }

                <button className="control" onClick={photoBtn}>pick photo</button>
                {
                    photoActive

                    ?
                    <PhotoPicker 
                        photosAll={product.photos_all ? product.photos_all : []}
                        photo={product.state.cover_photo ? product.state.cover_photo : null}
                        pickCb={product.coverPickCb}
                        upload={product.photosUpload}
                    />

                    : 
                    null
                }

                <span className="label">photos</span>
                <DndProvider backend={HTML5Backend}>
                    <PhotosSortable 
                        photos={product.state.photos ? product.state.photos : []} 
                        reorderCb={product.photosReorderCb}
                    />
                </DndProvider>
                {
                    photosActive 
                    
                    ? 
                    <PhotosPicker 
                        photosAll={product.photos_all ? product.photos_all : []} 
                        photos={product.state.photos ? product.state.photos : []} 
                        upload={product.photosUpload} 
                        pickCb={product.pickCb}
                    />
                    
                    : 
                    null
                }
                <button className="control" onClick={photosBtn}>add photos</button>
            </form>
        )
    }

    return {ProductCreate, Product}
}

export default main