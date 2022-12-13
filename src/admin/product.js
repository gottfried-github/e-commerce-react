import React, {Component, useState, useEffect, useRef} from "react"
import {useNavigate, useParams, redirect} from 'react-router-dom'

function main(api) {
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
        // const [state, setState] = useState({
        //     name: '', 
        //     priceHrn: 0, priceKop: 0, 
        //     expose: false,
        //     is_in_stock: false,
        //     photos_all: [],
        //     photos: [],
        //     cover_photo: '',
        //     description: ''
        // })

        const files = useRef()
        const params = useParams()

        const upload = (ev) => {
            api.product.upload(params.id, files.current.files)
        }

        return (
            <form onSubmit={e => e.preventDefault()}>
                <input ref={files} type='file' accept="image/*" multiple />
                <button onClick={upload}>upload</button>
            </form>
        )
    }

    return {ProductCreate, Product}
}

export default main