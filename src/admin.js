import React, {Component, useState, useEffect} from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate } from "react-router-dom" // , useNavigate

import {Signup, Login} from './admin/auth.js'

function useIsLoggedIn() {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    useEffect(() => {
        fetch('/api/admin/auth/is-authenticated', {method: 'GET'}).then((res) => {
            res.json().then((body) => {
                setIsLoggedIn(body)
            })
        })
    }, [])

    return isLoggedIn
}

function Logout() {
    const navigate = useNavigate()

    useEffect(() => {
        fetch('/api/admin/auth/logout', {method: 'GET'}).then(res => {
            if (!res.ok) {
                console.log("logout response not ok - res:", res);
                return alert("something is wrong with the program, please consult a technician")
            }

            navigate('../')
        })
    }, [])

    return (<div>{'logging out'}</div>)
}

function Dash(props) {
    const navigate = useNavigate()

    const isLoggedIn = useIsLoggedIn()
    
    useEffect(() => {
        if (null === isLoggedIn) return
        if (!isLoggedIn) navigate('../signin')
    }, [isLoggedIn])

    return (
        isLoggedIn 
        
        ?  
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
                    <Route path="logout" element={<Logout />}/>
                </Routes>
            </section>
        </div>
        
        : 
        null
    )
}

function Signin(props) {
    return (
        <div>
            <Link to="/login">{'login'}</Link>
            <Link to="/signup">{'signup'}</Link>
        </div>
    )
}

function App(props) {
    return (
        <div className="app">
            <Routes>
                <Route path="/">
                    <Route index element={<Navigate to="dash"/>} />
                    <Route path="dash/*" element={<Dash />} />
                    <Route path="signin" element={<Signin />}/>
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                </Route>
            </Routes>
        </div>
    )
}

function main(container) {
    const root = ReactDOM.createRoot(container)
    root.render(<BrowserRouter basename="/admin"><App /></BrowserRouter>)
}

export default main