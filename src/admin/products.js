import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard.js'

function main(api) {
  function Products() {
    const [products, setProducts] = useState([])

    useEffect(() => {
      api.product.getMany(products => {
        setProducts(products)
      })
    }, [])

    return (
      <div className="products-container">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return Products
}

export default main
