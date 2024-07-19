import React, { Component, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom' // , useNavigate
import { uk } from 'date-fns/locale'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles/index.js'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3/index.js'
import { LocalizationProvider } from '@mui/x-date-pickers'

import theme from './admin/theme.js'
import Auth from './admin/auth.js'
import ProductCreate from './admin/product-create.js'
import Product from './admin/product/product.js'
import Products from './admin/products.js'
import Header from './admin/Header.js'

function main(container, api) {
  const auth = Auth(api)
  const _ProductCreate = ProductCreate(api)
  const _Product = Product(api)
  const _Products = Products(api)

  // check the api for whether the client is authenticated
  function useIsLoggedIn() {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    useEffect(() => {
      api.auth.isAuthenticated(
        body => {
          setIsLoggedIn(body)
        },
        () => {}
      )
    }, [])

    return isLoggedIn
  }

  // log out over the api and navigate to the root
  function Logout() {
    const navigate = useNavigate()

    useEffect(() => {
      api.user.logout(
        () => {
          navigate('/')
        },
        (body, res) => {
          console.log('logout response not ok - res, body:', res, body)
          return alert('something is wrong with the program, please consult a technician')
        }
      )
    }, [])

    return <div>{'logging out'}</div>
  }

  function Blank(props) {
    return <div>{"route doesn't exist"}</div>
  }

  function Dash() {
    return (
      <div className="admin">
        <Header />
        <section className="page-width page-container">
          <Routes>
            <Route index element={<Navigate to="products" />}></Route>
            <Route path="products" element={<_Products />} />
            <Route
              path="product"
              element={
                <div className="product-create">
                  <_ProductCreate />
                </div>
              }
            />
            <Route
              path="product/:id/*"
              element={
                <div className="product">
                  <_Product />
                </div>
              }
            />
            <Route path="logout" element={<Logout />} />
          </Routes>
        </section>
      </div>
    )
  }

  // render Dash only if client is authenticated, otherwise - navigate to sign in page
  function DashController(props) {
    const navigate = useNavigate()

    const isLoggedIn = useIsLoggedIn()

    useEffect(() => {
      if (null === isLoggedIn) return

      if (!isLoggedIn) navigate('/login')
    }, [isLoggedIn])

    return isLoggedIn ? <Dash /> : null
  }

  // create routes for login, sign up, sign in and dash. Navigate to dash.
  function App(props) {
    return (
      <div className="app">
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <Routes>
                <Route path="/">
                  <Route index element={<Navigate to="dash" />} />
                  <Route path="dash/*" element={<DashController />} />
                  <Route path="login" element={<auth.Login />} />
                  {/* <Route path="signup" element={<auth.Signup />} /> */}
                </Route>
                <Route path="/*" element={<Blank />} />
              </Routes>
            </ThemeProvider>
          </StyledEngineProvider>
        </LocalizationProvider>
      </div>
    )
  }

  const root = ReactDOM.createRoot(container)
  root.render(
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  )
}

export default main
