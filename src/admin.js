import React, {Component, useState, useEffect} from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate } from "react-router-dom" // , useNavigate

import {Signup, Login} from './admin/auth.js'

function Signin(props) {
    return (
        <div>
            <Link to="/login">{'login'}</Link>
            <Link to="/signup">{'signup'}</Link>
        </div>
    )
}

function Dash(props) {
    return (
        <div className="admin">
            <nav>
                <Link to="orders">orders</Link>
                <Link to="products">products</Link>
                <Link to="product">product</Link>
            </nav>
            <section>
                <Routes>
                    <Route index element={<Navigate to="orders"/>}></Route>
                    <Route path="orders" element={<div className="orders">orders</div>} />
                    <Route path="products" element={<div className="products">products</div>} />
                    <Route path="product" element={<div className="product-create">create product</div>} />
                    <Route path="product/:id" element={<div className="product">product</div>} />
                </Routes>
            </section>
        </div>
    )
}

function AuthSwitch(props) {
    return (
        props.isLoggedIn
            ? <Dash />
            : <Signin />
        )
}

function App(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    useEffect(() => {
        fetch('/api/admin/auth/is-authenticated', {method: 'GET'}).then(async (res) => {
            const body = await res.json()
            console.log('App, /api/admin/auth/is-authenticated response body:', body);
            setIsLoggedIn(body)
        })
    }, [])

    const authSuccessCb = () => setIsLoggedIn(true)

    return (
        <div className="app">
            <Routes>
                <Route path="/">
                    <Route index element={<Navigate to="dash"/>} />
                    <Route path="dash/*" element={<AuthSwitch isLoggedIn={isLoggedIn}/>} />
                    <Route path="login" element={<Login successCb={authSuccessCb}/>} />
                    <Route path="signup" element={<Signup successCb={authSuccessCb}/>} />
                </Route>
            </Routes>
        </div>
    )
}

function main(container) {
    ReactDOM.render(<BrowserRouter basename="/admin"><App /></BrowserRouter>, container)
}

export default main