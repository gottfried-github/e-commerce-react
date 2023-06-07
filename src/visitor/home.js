import React from 'react'

import products from './products.js'
import services from './services.js'
import about from './about.js'

export default (api) => {
    const Products = products(api)
    const Services = services(api)
    const About = about(api)

    return () => {
        return (
            <div id="home">
                <Products />
                <Services />
                <About />
            </div>
        )
    }
}