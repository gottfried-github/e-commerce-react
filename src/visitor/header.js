import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import IconInstagram from './icons/IconInstagram.js'
import IconFacebook from './icons/IconFacebook.js'

function Header({ sectionsPos }) {
  const [isOpen, setIsOpen] = useState(false)

  console.log('Header - sectionsPos:', sectionsPos)

  return (
    <div className="header-container">
      <header className="header-desktop">
        <Link className="logo-container" to="/">
          <div className="logo"></div>
        </Link>
        <nav className="nav-main">
          <ul className="nav-links">
            <li className="nav-link-container">
              <Link
                className="nav-link"
                to="/home#products"
                onClick={() => {
                  if (isOpen) setIsOpen(false)
                  window.scrollTo(0, sectionsPos.products)
                }}
              >
                Вироби
              </Link>
            </li>
            {/* <li className="nav-link-container"><Link className="nav-link" to="/home#services">Послуги</Link></li> */}
            <li className="nav-link-container">
              <Link
                className="nav-link"
                to="/home#about"
                onClick={() => {
                  if (isOpen) setIsOpen(false)
                  window.scrollTo(0, sectionsPos.about)
                }}
              >
                Про мене
              </Link>
            </li>
          </ul>
        </nav>
        <div
          id="menu-open"
          onClick={() => {
            setIsOpen(true)
          }}
        ></div>
      </header>
      <header className={`header-mobile${isOpen ? ' header-mobile_opened' : ''}`}>
        <div className="header-mobile__content">
          <Link className="logo-container" to="/">
            <div className="logo"></div>
          </Link>
          <nav className="nav-main">
            <ul className="nav-links">
              <li className="nav-link-container">
                <Link
                  className="nav-link"
                  to="/home#products"
                  onClick={() => {
                    if (isOpen) setIsOpen(false)
                    window.scrollTo(0, sectionsPos.products)
                  }}
                >
                  Вироби
                </Link>
              </li>
              {/* <li className="nav-link-container"><Link className="nav-link" to="/home#services">Послуги</Link></li> */}
              <li className="nav-link-container">
                <Link
                  className="nav-link"
                  to="/home#about"
                  onClick={() => {
                    if (isOpen) setIsOpen(false)
                    window.scrollTo(0, sectionsPos.about)
                  }}
                >
                  Про мене
                </Link>
              </li>
            </ul>

            <ul className="social-links">
              <li className="social-link-container">
                <a
                  className="social-link"
                  href="https://www.instagram.com/animato_jewelry/"
                  target="_blank"
                >
                  <IconInstagram className="social-icon_light" />
                </a>
              </li>
              <li className="social-link-container">
                <a
                  className="social-link"
                  href="https://www.facebook.com/bySophiaSalo/"
                  target="_blank"
                >
                  <IconFacebook className="social-icon_light" />
                </a>
              </li>
            </ul>
          </nav>
          <div
            id="menu-close"
            onClick={() => {
              setIsOpen(false)
            }}
          ></div>
          <p id="timestamp">{`fi-jewelry.com.ua, ${new Date().getFullYear()}. ©`}</p>
        </div>
      </header>
    </div>
  )
}

export default Header
