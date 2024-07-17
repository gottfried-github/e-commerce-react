import React from 'react'

import IconInstagram from './icons/IconInstagram.js'
import IconFacebook from './icons/IconFacebook.js'

function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-main__content">
        <p className="timestamp">
          <a href="fi-jewelry.com.ua" className="site-link">
            fi-jewelry.com.ua
          </a>
          <span className="timestamp">{`, ${new Date().getFullYear()}. All rights reserved.`}</span>
        </p>
        <ul className="social-links">
          <li className="social-link-container">
            <a
              className="social-link"
              href="https://www.instagram.com/animato_jewelry/"
              target="_blank"
            >
              <IconInstagram className="social-icon" />
            </a>
          </li>
          <li className="social-link-container">
            <a
              className="social-link"
              href="https://www.facebook.com/bySophiaSalo/"
              target="_blank"
            >
              <IconFacebook className="social-icon" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
