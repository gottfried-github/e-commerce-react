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
        const matchWorks = useMatch('/works')
        const matchWork = useMatch('/works/:id')
        const matchServices = useMatch('/services')
        const matchAbout = useMatch('/about')
        
        const page = 
            matchWorks 
                ? 'page_works'
                : matchWork 
                    ? 'page_work'
                    : matchServices 
                        ? 'page_services'
                        : matchAbout 
                            ? 'page_about'
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

    const Works = works(api)
    const Services = services(api)
    const About = about(api)
    const Product = product(api)

    function App() {
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