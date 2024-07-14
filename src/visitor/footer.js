import React from 'react'

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
              className="social-link instagram"
              href="https://www.instagram.com/animato_jewelry/"
              target="_blank"
            ></a>
          </li>
          <li className="social-link-container">
            <a
              className="social-link facebook"
              href="https://www.facebook.com/bySophiaSalo/"
              target="_blank"
            ></a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
