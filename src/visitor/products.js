import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

import {kopToHrn} from '../price.js'

export default (api) => {  
    return () => {
        const [products, setProducts] = useState([])

        useEffect(() => {
            api.product.getMany('name', 1, false, (body) => {
                console.log('api.product.getMany, successCb - body:', body)
                setProducts(body)
            }, () => {
                console.log('api.product.getMany, failureCb - body:', body)
            })
        }, [])

        return (
            <section id="products">
                <ul className="filters"></ul>
                <ul className="product-cards">
                    {
                        products.map((product) => {
                            return <ProductCard 
                                id={product.id}
                                photoUrl={product.cover_photo.path}
                                name={product.name}
                                price={product.price}
                            />
                        })
                    }
                </ul>
            </section>
        )
    }
}

function ProductCard({id, photoUrl, name, price}) {
    const _price = kopToHrn(price)

    return (
        <li className="product-card">
            <Link className="product-card__photo-container" to={`/product/${id}`}>
                <img className="product-card__photo" src={photoUrl} alt="" />
            </Link>
            <div className="product-card__info">
                <Link className="product-card__price" to={`/product/${id}`}>{
                    `₴${
                        _price.kop 
                            ? `${_price.hrn}.${_price.kop}`
                            : `${_price.hrn}`
                    }`
                }</Link>
                <Link className="product-card__name" to={`/product/${id}`}>{name}</Link>
            </div>
        </li>
    )
}