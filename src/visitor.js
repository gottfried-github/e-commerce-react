import React, {useState, useEffect} from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate, useParams, useNavigate, useLocation, useMatch } from "react-router-dom"

import Header from './visitor/header.js'
import Footer from './visitor/footer.js'

import works from './visitor/works.js'
import services from './visitor/services.js'
import about from './visitor/about.js'
import product from './visitor/product.js'

function main(container, api) {
    function Index() {
        return (
            <div className={`wrapper`}>
                <Header />
                <main id="main">
                    <Outlet></Outlet>
                </main>
                <Footer />
            </div>
        )
    }

    const Works = works(api)
    const Services = services(api)
    const About = about(api)
    const Product = product(api)

    function App() {
        api.product.getMany('name', 1, false, (body) => {
            console.log('api.product.getMany, successCb - body:', body)
        }, () => {
            console.log('api.product.getMany, failureCb - body:', body)
        })

        return (
            <Routes>
                <Route element={<Index />}>
                    <Route index element={<Navigate to="works" />}></Route>
                    <Route path="works" element={<Works />} />
                    <Route path="works/:id" element={<Product />} />
                    <Route path="services" element={<Services />} />
                    <Route path="about" element={<About />} />
                </Route>
            </Routes>
        )
    }

    const root = ReactDOM.createRoot(container)
    root.render(<BrowserRouter basename='/'><App /></BrowserRouter>)
}

export default main