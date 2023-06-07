import React from 'react'
import {useMatch, useLocation, useResolvedPath} from 'react-router-dom'

export default (api) => {  
    return () => {
        api.product.getMany('name', 1, false, (body) => {
            console.log('api.product.getMany, successCb - body:', body)
        }, () => {
            console.log('api.product.getMany, failureCb - body:', body)
        })

        return (
            <div id="products">
                Works
            </div>
        )
    }
}