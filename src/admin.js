import React, {Component, useState, useEffect} from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useNavigate } from "react-router-dom" // , useNavigate

import Auth from './admin/auth.js'
import Product from './admin/product.js'
import Products from './admin/products.js'

function main(container, api) {
    const auth = Auth(api)
    const product = Product(api)
    const _Products = Products(api)

    // check the api for whether the client is authenticated
    function useIsLoggedIn() {
        const [isLoggedIn, setIsLoggedIn] = useState(null)
    
        useEffect(() => {
            api.auth.isAuthenticated((body) => {
                setIsLoggedIn(body)
            }, () => {})
        }, [])
    
        return isLoggedIn
    }
    
    function Signin(props) {
        return (
            <div>
                <Link to="/login">{'login'}</Link>
                <Link to="/signup">{'signup'}</Link>
            </div>
        )
    }
    
    // log out over the api and navigate to the root
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
    
    function Blank(props) {
        return (<div>{"route doesn't exist"}</div>)
    }
    
    function Dash() {
        return (
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
                        <Route path="products" element={<_Products />} />
                        <Route path="product" element={<div className="product-create"><product.ProductCreate /></div>} />
                        <Route path="product/:id/*" element={<div className="product"><product.Product /></div>} />
                        <Route path="logout" element={<Logout />}/>
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
    
            if (!isLoggedIn) navigate('/signin')
        }, [isLoggedIn])
    
        return (
            isLoggedIn 
            
            ?  
            <Dash />
            
            : 
            null
        )
    }

    // create routes for login, sign up, sign in and dash. Navigate to dash.
    function App(props) {
        return (
            <div className="app">
                <Routes>
                    <Route path="/">
                        <Route index element={<Navigate to="dash"/>} />
                        <Route path="dash/*" element={<DashController />} />
                        <Route path="signin" element={<Signin />}/>
                        <Route path="login" element={<auth.Login />} />
                        <Route path="signup" element={<auth.Signup />} />
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