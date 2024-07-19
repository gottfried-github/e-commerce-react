import React from 'react'
import { Link } from 'react-router-dom'
import Card from '@mui/material/Card/index.js'
import CardContent from '@mui/material/CardContent/index.js'

import { kopToHrnStr } from '../utils/price.js'

const ProductCard = ({ product }) => {
  const price = typeof product.price === 'number' ? kopToHrnStr(product.price) : null

  return (
    <Card className="product-card__container" elevation={8}>
      <Link to={`/dash/product/${product.id}`} className="product-link">
        <CardContent className="product-card__content">
          <div className={`product-card__cover${product.photo_cover ? '' : ' placeholder'}`}>
            {product.photo_cover ? (
              <img src={product.photo_cover.pathsPublic.s} alt={product.name || 'cover'} />
            ) : null}
          </div>
          <div className="product-card__info">
            <p className="product-card__id">{product.id}</p>
            {product.name ? <h1 className="product-card__name">{product.name}</h1> : null}
            {price ? (
              <p className="product-card__price">
                {price.kop ? `₴${price.hrn}.${price.kop}` : `₴${price.hrn}`}
              </p>
            ) : null}
            {typeof product.is_in_stock === 'boolean' ? (
              <p>{product.is_in_stock ? 'В наявності' : 'Немає в няавності'}</p>
            ) : null}
            <p>{product.expose ? 'Показується відвідувачам' : 'Не показується відвідувачам'}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default ProductCard
