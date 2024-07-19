import React from 'react'
import { NavLink } from 'react-router-dom'
import Button from '@mui/material/Button/index.js'
import AppBar from '@mui/material/AppBar/index.js'

const Header = () => {
  return (
    <AppBar position="static">
      <nav className="page-width header-content">
        <div className="buttons-group">
          <NavLink to="products">
            <Button variant="header">Продукти</Button>
          </NavLink>
        </div>
        <div className="buttons-group">
          <NavLink to="product">
            <Button variant="header">Створити продукт</Button>
          </NavLink>
          <NavLink to="logout">
            <Button color="error">Вийти</Button>
          </NavLink>
        </div>
      </nav>
    </AppBar>
  )
}

export default Header
