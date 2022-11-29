import React, {Component, useState, useEffect} from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate } from "react-router-dom" // , useNavigate

import auth from './admin/auth.js'

function main(container, api) {
    const {Signup, Login} = auth(api)

    function useIsLoggedIn() {
        const [isLoggedIn, setIsLoggedIn] = useState(null)
    
        useEffect(() => {
            api.auth.isAuthenticated((body) => {
                setIsLoggedIn(body)
            }, () => {})
        }, [])
    
        return isLoggedIn
    }
    
    function Logout() {
        const navigate = useNavigate()
    
        useEffect(() => {
            api.user.logout(() => {
                navigate('/')
            }, (body, res) => {
                console.log("logout response not ok - res, body:", res, body);
                return alert("something is wrong with the program, please consult a technician")
            })
        }, [])
    
        return (<div>{'logging out'}</div>)
    }
    
    function Dash(props) {
        const navigate = useNavigate()
    
        const isLoggedIn = useIsLoggedIn()
        
        useEffect(() => {
            if (null === isLoggedIn) return
    
            if (!isLoggedIn) navigate('/signin')
        }, [isLoggedIn])
    
        return (
            isLoggedIn 
            
            ?  
            <div className="admin">
                <nav>
                    <Link to="orders">orders</Link>
                    <Link to="products">products</Link>
                    <Link to="product">product</Link>
                    <Link to="logout">logout</Link>
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
    
    function Blank(props) {
        return (<div>{"route doesn't exist"}</div>)
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
                    <Route path="/*" element={<Blank />} />
                </Routes>
            </div>
        )
    }

    const root = ReactDOM.createRoot(container)
    root.render(<BrowserRouter basename="/admin"><App /></BrowserRouter>)
}

export default main