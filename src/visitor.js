import React, {useState, useEffect} from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate, useParams, useNavigate, useLocation, useMatch } from "react-router-dom"

import Header from './visitor/header.js'
import Footer from './visitor/footer.js'

import home from './visitor/home.js'
import product from './visitor/product.js'

function main(container, api) {
    function Index() {
        const matchHome = useMatch('/home')
        const matchProduct = useMatch('/product/:id')
        
        const page = 
            matchHome 
                ? 'page_home'
                : matchProduct 
                    ? 'page_product'
                    : null

        return (
            <div className={`wrapper ${page ? ` ${page}` : ''}`}>
                <Header />
                <main id="main">
                    <Outlet></Outlet>
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
    root.render(<BrowserRouter basename='/'><App /></BrowserRouter>)
}

export default main