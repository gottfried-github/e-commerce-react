import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { register } from 'swiper/element/bundle'
import { Navigation } from 'swiper/modules'

import { kopToHrn } from '../price.js'

register()

export default api => {
  return () => {
    const params = useParams()

    const [product, setProduct] = useState(null)
    const refSwiper = useRef(null)
    const refSwiperNavigationLeft = useRef(null)
    const refSwiperNavigationRight = useRef(null)

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

    useEffect(() => {
      if (
        !refSwiper.current ||
        !refSwiperNavigationLeft.current ||
        !refSwiperNavigationRight.current
      )
        return

      const swiperConfig = {
        spaceBetween: 5,
        slidesPerView: 1,
      }

      Object.assign(refSwiper.current, swiperConfig)
      refSwiper.current.initialize()

      /* using `navigation` parameter in swiperConfig doesn't work, so setting navigation up manually */
      refSwiperNavigationLeft.current.addEventListener('click', () => {
        refSwiper.current.swiper.slidePrev()
      })

      refSwiperNavigationRight.current.addEventListener('click', () => {
        refSwiper.current.swiper.slideNext()
      })
    }, [product])

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
        <div className="photos-mobile-container">
          <div class="photos-mobile-swiper-container">
            <div className="swipe-icon-container">
              <div className="swipe-icon"></div>
            </div>
            <swiper-container class="photos-mobile" ref={refSwiper}>
              <swiper-slide>
                <img
                  className="photo-mobile"
                  src={product.photo_cover.pathPublic}
                  alt={product.name}
                />
              </swiper-slide>
              {product.photos_all.map(photo =>
                photo.cover ? null : (
                  <swiper-slide key={photo.id}>
                    <img className="photo-mobile" src={photo.pathPublic} />
                  </swiper-slide>
                )
              )}
            </swiper-container>
          </div>
          <div className="photos-mobile__navigation">
            <div className="photos-mobile__navigation_left" ref={refSwiperNavigationLeft}></div>
            <div className="photos-mobile__navigation_right" ref={refSwiperNavigationRight}></div>
          </div>
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
