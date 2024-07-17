import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { register } from 'swiper/element/bundle'

import { kopToHrnStr } from '../utils/price.js'
import Notification from './notification.js'
import IconInstagram from './icons/IconInstagram.js'
import IconFacebook from './icons/IconFacebook.js'

register()

export default api => {
  return () => {
    const params = useParams()

    const [product, setProduct] = useState(null)
    const [isCopiedNotificationVisible, setIsCopiedNotificationVisible] = useState(false)

    const refSwiper = useRef(null)
    const refSwiperNavigationLeft = useRef(null)
    const refSwiperNavigationRight = useRef(null)

    useEffect(() => {
      api.product.get(
        params.id,
        body => {
          console.log('Product, got product from api - body:', body)
          setProduct({ ...body, priceHrn: kopToHrnStr(body.price) })
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

    const handleIdBadgeClick = async () => {
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(product._id)

          if (!isCopiedNotificationVisible) {
            setIsCopiedNotificationVisible(true)

            setTimeout(() => {
              setIsCopiedNotificationVisible(false)
            }, 1500)
          }
        } catch (e) {
          console.log('navigator.clipboard.writeText errored, error:', e)
        }
      } else {
        const textarea = document.createElement('textarea')

        textarea.value = product._id
        textarea.style.position = 'fixed'
        textarea.style.top = '-9999px'
        textarea.style.left = '-9999px'

        document.body.appendChild(textarea)

        textarea.focus()
        textarea.select()

        try {
          const res = document.execCommand('copy')

          if (res) {
            if (!isCopiedNotificationVisible) {
              setIsCopiedNotificationVisible(true)

              setTimeout(() => {
                setIsCopiedNotificationVisible(false)
              }, 1500)
            }
          } else {
            console.log("document.execCommand('copy') returned false")
          }
        } catch (e) {
          console.log("document.execCommand('copy') errored, error:", e)
        }

        document.body.removeChild(textarea)
      }
    }

    return product ? (
      <section id="product">
        <div className="photos">
          <img className="photo" src={product.photo_cover.pathsPublic.l} alt={product.name} />
          {product.photos_all.map(photo =>
            photo.cover ? null : <img className="photo" src={photo.pathsPublic.l} key={photo.id} />
          )}
        </div>
        <div className="photos-mobile-container">
          <div className="photos-mobile-swiper-container">
            <div className="swipe-icon-container">
              <div className="swipe-icon"></div>
            </div>
            <swiper-container className="photos-mobile" ref={refSwiper}>
              <swiper-slide>
                <img
                  className="photo-mobile"
                  src={product.photo_cover.pathsPublic.l}
                  alt={product.name}
                />
              </swiper-slide>
              {product.photos_all.map(photo =>
                photo.cover ? null : (
                  <swiper-slide key={photo.id}>
                    <img className="photo-mobile" src={photo.pathsPublic.l} />
                  </swiper-slide>
                )
              )}
            </swiper-container>
          </div>
          <div className="photos-mobile__navigation">
            <div className="photos-mobile__navigation_left" ref={refSwiperNavigationLeft}>
              <div className="navigation__arrow-icon"></div>
            </div>
            <div className="photos-mobile__navigation_right" ref={refSwiperNavigationRight}>
              <div className="navigation__arrow-icon"></div>
            </div>
          </div>
        </div>
        <div className={`info${isSinglePhoto ? ' single-photo' : ''}`}>
          <div className="info__heading-block">
            <h1 className="info__title">{product.name}</h1>
            <div className="info__id-container">
              <div className="info__id-text-container" onClick={handleIdBadgeClick}>
                #<span className="info__id-text">{product._id}</span>
              </div>
              <button className="info__id-copy-btn" onClick={handleIdBadgeClick}>
                <span className="info__id-copy-icon"></span>скопіювати
              </button>
            </div>
          </div>
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
          <p
            className="info__description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          ></p>
          <div className="info__social-links-container">
            <h2 className="info__social-links-heading">Написати:</h2>
            <div className="social-links">
              <a className="social-link" href="https://ig.me/m/animato_jewelry" target="_blank">
                <IconInstagram className="social-icon" />
              </a>
              <a
                className="social-link"
                href={`https://m.me/bySophiaSalo?text=${encodeURIComponent(`Вітаю. \n \n Мене цікавить ${product.name} (${product._id}). \n \n`)}`}
                target="_blank"
              >
                <IconFacebook className="social-icon" />
              </a>
            </div>
          </div>
          <Notification hidden={!isCopiedNotificationVisible}>
            <div className="notification">
              <span className="notification__copied-icon"></span>скопійовано
            </div>
          </Notification>
        </div>
      </section>
    ) : null
  }
}
