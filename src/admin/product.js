import React, {Component, useState, useEffect, useRef} from "react"
import {useNavigate, useParams, redirect} from 'react-router-dom'

function main(api) {

    /**
     * @param {Number} kop
     * @description express kopiykas as hryvnias with kopiykas
    */
    function kopToHrn(kop) {
        return {
            hrn: Number(kop.toString().slice(0, kop.toString().length-2)),
            kop: Number(kop.toString().slice(kop.toString().length-2))
        }
    }

    /**
     * @param {Number} hrn 
     * @param {Number} kop
     * @description express hryvnias with kopiykas as kopiykas 
    */ 
    function hrnToKop(hrn, kop) {
        return hrn * 100 + kop
    }
    
    /**
     * @param {Object} fields
     * @description convert api response to Product's state
    */
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

    /**
     * @param {Object} state
     * @description convert Product's state to api request
    */
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
        if (state.photos) fields.photos = state.photos.map(photo => photo.id)
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
            photos: null,
            cover_photo: '',
            description: ''
        })
        const [photos_all, setPhotosAll] = useState([])

        // conditionally render `PhotosAll`
        const [photosActive, setPhotosActive] = useState(false)

        useEffect(() => {
            api.product.get(params.id, (body) => {
                setPhotosAll(body.photos_all)
                setState(fieldsToState(body))
            })
        }, [])

        // make api request to upload photos
        const photosUpload = (files) => {
            api.product.upload(params.id, files, (body) => {
                setPhotosAll(body.photos_all)
                setState(fieldsToState(body))
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
                return api.product.update(params.id, stateToFields({...state, photos: null}), ['photos'], (body) => {
                    console.log('Product, product.update successCb - body:', body);
                    setPhotosAll(body.photos_all)
                    setState(fieldsToState(body))
                })
            }

            api.product.update(params.id, stateToFields({...state, photos: photosPicked}), null, (body) => {
                console.log('Product, product.update successCb - body:', body);
                setPhotosAll(body.photos_all)
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
                {photosActive 
                    ? 
                    <PhotosUpload 
                        photosAll={photos_all ? photos_all : []} photos={state.photos ? state.photos : []} 
                        upload={photosUpload} pickCb={pickCb}
                    />
                    
                    : 
                    null}
                <Photos photos={state.photos ? state.photos : []} />
                <button onClick={photosBtn}>add photos</button>
            </form>
        )
    }

    function PhotosUpload({photosAll, photos, pickCb, upload}) {
        const files = useRef()

        return (
            <div>
                {<PhotosPickable 
                    photos={photosAll.map(photo => 
                        Object.assign({picked: photos.map(photo => photo.id).includes(photo.id)}, photo)
                    )} 
                    pickCb={pickCb} 
                />}
                <div>
                    <input ref={files} type='file' accept="image/*" multiple />
                    <button onClick={() => {
                        upload(files.current.files)
                    }}>upload</button>
                </div>
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
            <div>{
                photos.map(photo => <PhotoPickable 
                    key={photo.id} 
                    photo={photo} 
                    pickCb={pickCb}
                    picked={photo.picked}
                />)
            }</div>
        )
    }

    function Photos({photos}) {
        return (<div>{photos.map((photo, i) => (
            <div key={i} className="photo">
                <img src={photo.path} />
            </div>
        ))}</div>)
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
          <div className="photo-pickable">
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

    return {ProductCreate, Product}
}

export default main