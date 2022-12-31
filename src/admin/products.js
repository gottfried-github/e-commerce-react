import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

function main(api) {
    function Products() {
        const [products, setProducts] = useState([])

        useEffect(() => {
            api.product.getMany((products) => {
                setProducts(products)
            })
        }, [])

        return (
            <div>{products.map(product => <Product id={product.id}/>)}</div>
        )
    }

    function Product({id}) {
        return <div><Link to={`/dash/product/${id}`}>{id}</Link></div>
    }

    return Products
}

export default main