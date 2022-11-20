import * as m from '../../messages.js'

// import {useState} from "react"
import React, {Component, useState} from "react"
// import ReactDOM from "react-dom"
import { useNavigate } from "react-router-dom"

function signup(name, password, successCb, failureCb) {
    const body = new URLSearchParams()
    body.append('name', name)
    body.append('password', password)

    const req = new Request('/api/admin/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    })

    return fetch(req).then((res) => {
        // https://github.com/facebook/react-native/issues/6679
        setTimeout(() => null, 0)
        return res.json().then(body => {return {res, body}})
    }).then(({res, body}) => {
        res.ok ? successCb({res, body}, name, password) : failureCb({res, body}, name, password)
    })
}

function login(name, password, successCb, failureCb) {
    const body = new URLSearchParams()
    body.append('name', name)
    body.append('password', password)

    const req = new Request('/api/admin/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    })

    return fetch(req).then((res) => {
        // https://github.com/facebook/react-native/issues/6679
        setTimeout(() => null, 0)
        return res.json().then(body => {return {res, body}})
    }).then(({res, body}) => {
        res.ok ? successCb({res, body}, name, password) : failureCb({res, body}, name, password)
    })
}

function Signup(props) {
    const [name, setName] = useState('a')
    const [password, setPassword] = useState('a')
    const [nameMsgs, setNameMsgs] = useState([]);
    const [passwordMsgs, setPasswordMsgs] = useState([]);
    const navigate = useNavigate()

    const clickCb = () => {
        signup(name, password, ({res, body}, name, password) => {
            login(name, password, ({res, body}) => {
                // Login/response, in docs
                if (200 !== res.status) {
                    console.log('Signup, login response, body:', res, body)
                    return alert('consequent login response: dont know how to handle this response')
                }

                props.successCb(); return navigate('../')
            }, ({res, body}) => {
                console.log('Signup, login response, body:', res, body)
                return alert('something went wrong when trying to login with newly created user data')
            }).catch((e) => {
                console.log('Signup - consequent login rejected, error:', e)
                alert('Signup - consequent login rejected')
            })
        }, ({res, body}, name, password) => {
            console.log('Signup, fetch res:', res, body);
            if (500 === res.status) return alert("500: Internal Error")
            if (400 === res.status) {

                const o = [['name', setNameMsgs], ['password', setPasswordMsgs]].reduce((o, [k, setter]) => {
                    if (!(k in body)) {o.keys.splice(o.keys.indexOf(k), 1); return o}
                    const v = body[k]

                    if (m.FieldMissing.code === v.code || m.TypeErrorMsg.code === v.code) {
                        // reset possible displayed violations from previous requests
                        setNameMsgs([]); setPasswordMsgs([])

                        // alert(`${v.message}: please contact tech support`)
                        o.alertMsg += `\n${v.message}`
                        o.keys.splice(o.keys.indexOf(k), 1)
                        return o
                    }

                    if (m.EmptyError.code === v.code) {
                        setter([v.message])
                        o.keys.splice(o.keys.indexOf(k), 1)
                        return o
                    }

                    if (m.ValidationErrors.code === v.code) {
                        setter(v.errors.map(e => e.message))
                        o.keys.splice(o.keys.indexOf(k), 1)
                        return o
                    }
                }, {keys: ['name', 'password'], alertMsg: ''})

                if (o.keys.length) {
                    const msg = "errors detected, the handling of which isn't implemented yet"
                    return alert(o.alertMsg.length ? `${o.alertMsg};\nAlso, ${msg}` : msg)
                }

                return
            }

            if (409 === res.status) {
                if (m.NotUnique.code === body.code) return alert(body.message)
            }

            return alert("handling other errors except FieldMissing, Type, Empty, Validation and Internal errors is not implemented yet")

        }).catch((e) => {
            console.log('Signup - signup rejected, error:', e)
            alert('Signup - signup rejected')
        })
    }

    return (
        <form onSubmit={e => e.preventDefault()} id="signup">
            <input onInput={(ev) => {setName(ev.target.value); setNameMsgs([])}} value={name} type="text" name="name"/>
            <p>{nameMsgs.map(v => <span>{v}</span>)}</p>
            <input onInput={(ev) => {setPassword(ev.target.value); setPasswordMsgs([])}} value={password} type="text" name="password"/>
            <p>{passwordMsgs.map(v => <span>{v}</span>)}</p>
            <button onClick={clickCb}></button>
        </form>
    )
}

function Login(props) {
    const [name, setName] = useState('a')
    const [password, setPassword] = useState('a')
    const navigate = useNavigate()

    const clickCb = () => {
        login(name, password, ({res, body}, name, password) => {
            if (200 !== res.status) return alert('dont know how to handle this response')
            props.successCb(); return navigate('../')
        }, ({res, body}, name, password) => {
            if ([400, 404].includes(res.status)) {
                return alert(body.message ? body.message : 'dont know how to handle this response')
            }

            return alert('dont know how to handle this response')
        }).catch((e) => {
            console.log('Login - login rejected, error:', e)
            alert('Login - login rejected')
        })
    }

    return (
        <form onSubmit={e => e.preventDefault()} id="signup">
            <input onInput={(ev) => {setName(ev.target.value)}} value={name} type="text" name="name"/>
            <input onInput={(ev) => {setPassword(ev.target.value)}} value={password} type="text" name="password"/>
            <button onClick={clickCb}></button>
        </form>
    )
}

export {Signup, Login}
