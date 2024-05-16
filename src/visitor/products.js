import React, { useState, useEffect, useRef, forwardRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { kopToHrn } from '../price.js'

import Filters from './filters.js'

export default api => {
  return forwardRef(({ productsRenderedCb }, ref) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [fieldName, setFieldName] = useState('time')
    const [dir, setDir] = useState(-1)
    const [inStock, setInStock] = useState(false)

    useEffect(() => {
      setSearchParams({
        fieldName,
        dir,
        inStock,
      })
    }, [fieldName, dir, inStock])

    const searchParamsParsed = useMemo(
      () => ({
        fieldName: searchParams.get('fieldName') || 'time',
        dir: searchParams.get('dir') ? parseInt(searchParams.get('dir'), 10) : -1,
        inStock:
          searchParams.get('inStock') === 'true'
            ? true
            : searchParams.get('inStock') === 'false'
              ? false
              : false,
      }),
      [searchParams]
    )

    useEffect(() => {
      api.product.getMany(
        searchParamsParsed.fieldName,
        searchParamsParsed.dir,
        searchParamsParsed.inStock,
        body => {
          console.log('api.product.getMany, successCb - body:', body)
          setProducts(body)
        },
        () => {
          console.log('api.product.getMany, failureCb - body:', body)
        }
      )
    }, [searchParamsParsed])

    useEffect(() => {
      productsRenderedCb()
    }, [products])

    return (
      <section id="products" ref={ref}>
        <div className="products-container">
          <Filters
            fieldName={searchParamsParsed.fieldName}
            dir={searchParamsParsed.dir}
            inStock={searchParamsParsed.inStock}
            fieldNameChangeCb={fieldName => {
              setFieldName(fieldName)
            }}
            dirChangeCb={dir => {
              setDir(dir)
            }}
            inStockChangeCb={inStock => {
              setInStock(inStock)
            }}
          />
          <ul className="product-cards">
            {products.map(product => {
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  photoUrl={product.photo_cover.pathPublic}
                  name={product.name}
                  price={product.price}
                />
              )
            })}
          </ul>
        </div>
      </section>
    )
  })
}

function ProductCard({ id, photoUrl, name, price }) {
  const _price = kopToHrn(price)

  return (
    <li className="product-card">
      <Link className="product-card__photo-container" to={`/product/${id}`}>
        <img className="product-card__photo" src={photoUrl} alt="" />
      </Link>
      <div className="product-card__info">
        <Link className="product-card__price" to={`/product/${id}`}>{`₴${
          _price.kop ? `${_price.hrn}.${_price.kop}` : `${_price.hrn}`
        }`}</Link>
        <Link className="product-card__name" to={`/product/${id}`}>
          {name}
        </Link>
      </div>
    </li>
  )
}
