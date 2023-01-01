import React, {Component, useState, useEffect, useRef} from "react"
import {useNavigate, useParams, redirect} from 'react-router-dom'

function main(api) {

    function kopToHrn(kop) {
        return {
            hrn: Number(kop.toString().slice(0, kop.toString().length-2)),
            kop: Number(kop.toString().slice(kop.toString().length-2))
        }
    }

    function hrnToKop(hrn, kop) {
        return hrn * 100 + kop
    }
    
    function fieldsToState(fields) {
        const state = {
            name: fields.name || '',
            expose: fields.expose || false,
            is_in_stock: fields.is_in_stock || false,
            photos: fields.photos || [],
            cover_photo: fields.cover_photo || '',
            description: fields.description || ''
        }

        if (undefined === fields.price) {
            state.priceHrn = null
            state.priceKop = null

            return state
        }
        
        const price = kopToHrn(fields.price)

        state.priceHrn = price.hrn
        state.priceKop = price.kop

        return state
    }

    function stateToFields(state) {
        const fields = {}

        if (null !== state.priceHrn || null !== state.priceKop) {
            fields.price = null === state.priceHrn 
                ? hrnToKop(0, state.priceKop)
                : null === state.priceKop 
                    ? hrnToKop(state.priceHrn, 0)
                    : hrnToKop(state.priceHrn, state.priceKop)
        }

        if (undefined !== state.name && state.name) fields.name = state.name
        if (undefined !== state.expose) fields.expose = state.expose
        if (undefined !== state.is_in_stock) fields.is_in_stock = state.is_in_stock
        if (undefined !== state.photos) fields.photos = state.photos
        if (undefined !== state.cover_photo && state.cover_photo) fields.cover_photo = state.cover_photo
        if (undefined !== state.description && state.description) fields.description = state.name

        return fields
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

    function Product() {
        const params = useParams()

        const [state, setState] = useState({
            name: '', 
            priceHrn: null, priceKop: null, 
            expose: false,
            is_in_stock: false,
            photos: [],
            cover_photo: '',
            description: ''
        })
        const [photos_all, setPhotosAll] = useState([])
        const [photosActive, setPhotosActive] = useState(false)

        useEffect(() => {
            api.product.get(params.id, (body) => {
                setPhotosAll(body.photos_all)
                setState(fieldsToState(body))
            })
        }, [])

        const photosUpload = (files) => {
            api.product.upload(params.id, files, (body) => {
                setPhotosAll(body.photos_all)
                setState(fieldsToState(body))
            })
        }

        const photosUpdCb = (photos) => {
            api.product.update(stateToFields({...state, photos}), (body) => {
                setState(fieldsToState(body))
            })
        }

        const photosBtn = () => {
            setPhotosActive(!photosActive)
        }

        return (
            <form onSubmit={ev => ev.preventDefault()} className="edit-main">
                <label>name</label><input id="name" className="input" type="text" />
                <label>hrn</label><input id="price-hrn" className="input-text" type="number" />
                <label>kop</label><input id="price-kop" className="input-text" type="number" />
                <label>expose</label><input id="expose" className="input" type="checkbox" />
                <label>in stock</label><input id="is-in-stock" className="input" type="checkbox" />
                <label>description</label><input id="description" className="input-text" type="text" />
                <label>photos</label>
                <PhotosAll 
                    active={photosActive} 
                    photosAll={photos_all} photos={state.photos} 
                    upload={photosUpload} photosUpdCb={photosUpdCb}
                />
                <Photos photos={state.photos} />
                <button onClick={photosBtn}>add photos</button>
            </form>
        )
    }

    function PhotosAll({active, photosAll, photos, photosUpdCb, upload}) {
        const files = useRef()

        const pickCb = (picked, photo) => {
            if (!picked) {
                const photosPicked = [...photos]

                photosPicked.splice(photosPicked.map(photo => photo.id).indexOf(photo.id), 1)
                
                return photosUpdCb(photosPicked)
            }

            photosUpdCb([...photos, photo])
        }

        return (
            active
            
            ? 
            <div>
                {photosAll.map(photo => <PhotoPickable photo={photo} pickCb={pickCb}/>)}
                <div>
                    <input ref={files} type='file' accept="image/*" multiple />
                    <button onClick={upload}>upload</button>
                </div>
            </div>
            
            :
            null
        )
    }

    function PhotoPickable({photo, pickCb}) {
        const _pickCb = (ev) => {
          pickCb(ev.target.checked, photo)
        }

        return (
          <div className="photo-pickable">
              <img src={photo.path} />
              <input type="checkbox" onClick={_pickCb}></input>
          </div>
        )
    }

    function Photos({photos}) {
        return (<div>{photos.map(photo => (
            <div className="photo">
                <img src={photo.path} />
            </div>
        ))}</div>)
    }

    return {ProductCreate, Product}
}

export default main