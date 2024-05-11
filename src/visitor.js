import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
  useMatch,
} from 'react-router-dom'

import Header from './visitor/header.js'
import Footer from './visitor/footer.js'

import home from './visitor/home.js'
import product from './visitor/product.js'

function main(container, api) {
  function Index() {
    // pass positions of sections in Home to Header for it to scroll to when links are clicked (see Passing sections positions from `Home` to `Header` in readme)
    const [sectionsPos, setSectionsPos] = useState({})

    const matchHome = useMatch('/home')
    const matchProduct = useMatch('/product/:id')

    const page = matchHome ? 'page_home' : matchProduct ? 'page_product' : null

    return (
      <div className={`wrapper ${page ? ` ${page}` : ''}`}>
        <Header sectionsPos={sectionsPos} />
        <main id="main">
          <Outlet
            context={
              // this is to be called from within Home, which renders the sections
              pos => {
                setSectionsPos(pos)
              }
            }
          ></Outlet>
        </main>
        <Footer />
      </div>
    )
  }

  const Home = home(api)
  const Product = product(api)

  function App() {
    return (
      <Routes>
        <Route element={<Index />}>
          <Route index element={<Navigate to="home" />}></Route>
          <Route path="home" element={<Home />} />
          <Route path="product/:id" element={<Product />} />
        </Route>
      </Routes>
    )
  }

  const root = ReactDOM.createRoot(container)
  root.render(
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  )
}

export default main
