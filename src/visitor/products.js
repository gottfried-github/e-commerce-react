import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

import {kopToHrn} from '../price.js'

import Filters from './filters.js'

export default (api) => {  
    return () => {
        const [products, setProducts] = useState([])
        const [fieldName, setFieldName] = useState('time')
        const [dir, setDir] = useState(-1)
        const [inStock, setInStock] = useState(false)

        useEffect(() => {
            api.product.getMany(fieldName, dir, inStock, (body) => {
                console.log('api.product.getMany, successCb - body:', body)
                setProducts(body)
            }, () => {
                console.log('api.product.getMany, failureCb - body:', body)
            })
        }, [])

        useEffect(() => {
            api.product.getMany(fieldName, dir, inStock, (body) => {
                console.log('api.product.getMany, successCb - body:', body)
                setProducts(body)
            }, () => {
                console.log('api.product.getMany, failureCb - body:', body)
            })
        }, [fieldName, dir, inStock])

        return (
            <section id="products">
                <div className="products-container">
                    <Filters 
                        fieldName={fieldName}
                        dir={dir}
                        inStock={inStock}
                        fieldNameChangeCb={(fieldName) => {
                            setFieldName(fieldName)
                        }}
                        dirChangeCb={(dir) => {
                            setDir(dir)
                        }}
                        inStockChangeCb={(inStock) => {
                            setInStock(inStock)
                        }}
                    />
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
                </div>
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