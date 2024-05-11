import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { useOutletContext } from 'react-router-dom'

import products from './products.js'
import services from './services.js'
import about from './about.js'

export default api => {
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
        // see Determining the `about` section position in readme
        setTimeout(() => {
          sectionsPosCb({
            products: refProducts.current.offsetTop,
            about: refAbout.current.offsetTop,
          })
        }, 1000)
      })

      observer.observe(refProducts.current, {
        childList: true,
        subtree: true,
        characterData: true,
      })

      window.addEventListener('resize', () => {
        sectionsPosCb({
          products: refProducts.current.offsetTop,
          about: refAbout.current.offsetTop,
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
