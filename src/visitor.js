function main(api) {
    api.product.getMany('name', 1, false, (body) => {
        console.log('api.product.getMany, successCb - body:', body)
    }, () => {
        console.log('api.product.getMany, failureCb - body:', body)
    })
}

export default main