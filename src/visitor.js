import React, {Component, useState, useEffect} from "react"
import ReactDOM from "react-dom/client"

function main(container, api) {
    function App() {
        api.product.getMany('name', 1, false, (body) => {
            console.log('api.product.getMany, successCb - body:', body)
        }, () => {
            console.log('api.product.getMany, failureCb - body:', body)
        })

        return <div></div>
    }

    const root = ReactDOM.createRoot(container)
    root.render(<App />)
}

export default main