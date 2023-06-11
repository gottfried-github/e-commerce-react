import React, {useState, useEffect, useRef, forwardRef} from 'react'
import {useOutletContext} from 'react-router-dom'

import products from './products.js'
import services from './services.js'
import about from './about.js'

export default (api) => {
    const Products = products(api)
    const Services = services(api)
    const About = about(api)

    return () => {
        const sectionsPosCb = useOutletContext()

        const refProducts = useRef()
        const refAbout = useRef()

        const [productsRendered, setProductsRendered] = useState(false)

        useEffect(() => {
            // scan the positions each time Products renders data
            const observer = new MutationObserver(() => {
                sectionsPosCb({
                    products: refProducts.current.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop || body.scrollTop,
                    about: refAbout.current.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop || body.scrollTop,
                })
            })

            observer.observe(refProducts.current, {
                childList: true, 
                subtree: true
            })

            window.addEventListener('resize', () => {
                sectionsPosCb({
                    products: refProducts.current.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop || body.scrollTop,
                    about: refAbout.current.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop || body.scrollTop,
                })
            })
        }, [productsRendered])

        return (
            <div id="home">
                <Products 
                    ref={refProducts} 
                    productsRenderedCb={() => {
                        setProductsRendered(true)
                    }}
                />
                {/* <Services /> */}
                <About ref={refAbout} />
            </div>
        )
    }
}