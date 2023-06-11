import React, {useState, useEffect} from "react"
import {Link} from 'react-router-dom'

function Header() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className={`header-main${isOpen ? ' header-main_opened' : ''}`}>
            <div id="logo"></div>
            <nav className="nav-main">
                <ul className="nav-links">
                    <li className="nav-link-container"><Link className="nav-link" to="/home#products">Вироби</Link></li>
                    <li className="nav-link-container"><Link className="nav-link" to="/home#services">Послуги</Link></li>
                    <li className="nav-link-container"><Link className="nav-link" to="/home#about">Про мене</Link></li>
                </ul>

                <ul className="social-links">
                    <li className="social-link instagram"></li>
                    <li className="social-link facebook"></li>
                </ul>
            </nav>
            <div id="menu-open" 
                onClick={() => {
                    setIsOpen(true)
                }
            }></div>
            <div id="menu-close" 
                onClick={() => {
                    setIsOpen(false)
                }
            }></div>
            <p id="timestamp">{`fi-jewelry.com.ua, ${new Date().getFullYear()}. ©`}</p>
        </header>
    )
}

export default Header