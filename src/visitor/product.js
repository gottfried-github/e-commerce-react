import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { kopToHrn } from '../price.js'

export default api => {
  return () => {
    const params = useParams()

    const [product, setProduct] = useState(null)

    useEffect(() => {
      api.product.get(
        params.id,
        body => {
          console.log('Product, got product from api - body:', body)
          setProduct({ ...body, priceHrn: kopToHrn(body.price) })
        },
        (body, res) => {
          alert('something went wrong, please consult a technician')
          console.log('something went wrong with the request - body, res:', body, res)
        }
      )
    }, [])

    const isSinglePhoto = useMemo(() => {
      if (!product) return false

      if (
        !product.photos_all.length ||
        (product.photos_all.length === 1 && product.photos_all[0].cover)
      )
        return true

      return false
    }, [product?.photos_all])

    return product ? (
      <section id="product">
        <div className="photos">
          <img className="photo" src={product.photo_cover.pathPublic} alt={product.name} />
          {product.photos_all.map(photo =>
            photo.cover ? null : <img className="photo" src={photo.pathPublic} key={photo.id} />
          )}
        </div>
        <div className={`info${isSinglePhoto ? ' single-photo' : ''}`}>
          <h1 className="info__title">{product.name}</h1>
          <div className="info__row">
            <span className="info__price">{`₴${
              product.priceHrn.kop
                ? `${product.priceHrn.hrn}.${product.priceHrn.kop}`
                : `${product.priceHrn.hrn}`
            }`}</span>
            <span className={`info__in-stock${product.is_in_stock ? ' positive' : ''}`}>
              {product.is_in_stock ? 'в наявності' : 'немає в наявності'}
            </span>
          </div>
          <p className="info__description">{product.description}</p>
        </div>
      </section>
    ) : null
  }
}
