import * as m from '../../../fi-common/messages.js'

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
    const [msg, setMsg] = useState('')

    const navigate = useNavigate()

    const clickCb = () => {
        signup(name, password, ({res, body}, name, password) => {
            login(name, password, ({res, body}) => {
                props.successCb(); return navigate('../')
            }, ({res, body}) => {
                // console.log('Signup, login response, body:', res, body)
                
                if (res.status >= 500) {
                    console.log(`signup, internal error when logging in - res, body`, res, body)
                    return alert(`Something's wrong on the server, please consult a technician`)
                }

                if (!body.message) {
                    console.log(`signup, response not ok when logging in - res, body:`, res, body);
                    return setMsg(`Some fields are filled incorrectly`)
                }

                setMsg(body.message)
            }).catch((e) => {
                console.log('signup, login rejected - error:', e)
                alert(`Something is wrong with the program, please consult a technician`)
            })
        }, ({res, body}, name, password) => {
            // console.log('Signup, fetch res:', res, body);

            if (res.status >= 500) {
                console.log(`signup, internal error - res, body`, res, body)
                return alert(`Something's wrong on the server, please consult a technician`)
            }

            if (body.tree) {
                if (body.tree.node.name) setNameMsgs([...body.tree.node.name.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                }, [])])

                if (body.tree.node.password) setPasswordMsgs([...body.tree.node.password.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                }, [])])

                return
            }

            if (!body.message) {
                console.log(`signup, response not ok - res, body:`, res, body);
                return setMsg(`Some fields are filled incorrectly`)
            }

            setMsg(body.message)
        }).catch((e) => {
            console.log('signup rejected - error:', e)
            alert(`Something is wrong with the program, please consult a technician`)
        })
    }

    return (
        <form onSubmit={e => e.preventDefault()} id="signup">
            <input onInput={(ev) => {setName(ev.target.value); setNameMsgs([])}} value={name} type="text" name="name"/>
            <p>{nameMsgs.map(v => <span>{v}</span>)}</p>
            <input onInput={(ev) => {setPassword(ev.target.value); setPasswordMsgs([])}} value={password} type="text" name="password"/>
            <p>{passwordMsgs.map(v => <span>{v}</span>)}</p>
            <p><span>{msg}</span></p>
            <button onClick={clickCb}></button>
        </form>
    )
}

function Login(props) {
    const [name, setName] = useState('a')
    const [password, setPassword] = useState('a')
    const [nameMsgs, setNameMsgs] = useState([])
    const [passwordMsgs, setPasswordMsgs] = useState([])
    const [msg, setMsg] = useState('')

    const navigate = useNavigate()

    const clickCb = () => {
        login(name, password, ({res, body}, name, password) => {
            props.successCb(); return navigate('../')
        }, ({res, body}, name, password) => {
            if (res.status >= 500) {
                console.log(`signup, internal error - res, body`, res, body)
                return alert(`Something's wrong on the server, please consult a technician`)
            }

            if (body.tree) {
                if (body.tree.node.name) setNameMsgs([...body.tree.node.name.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                }, [])])

                if (body.tree.node.password) setPasswordMsgs([...body.tree.node.password.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                }, [])])

                return
            }

            if (!body.message) {
                console.log(`signup, response not ok - res, body:`, res, body);
                return setMsg(`Some fields are filled incorrectly`)
            }

            setMsg(body.message)
        }).catch((e) => {
            console.log('login rejected - error:', e)
            alert(`Something is wrong with the program, please consult a technician`)
        })
    }

    return (
        <form onSubmit={e => e.preventDefault()} id="signup">
            <input onInput={(ev) => {setName(ev.target.value)}} value={name} type="text" name="name"/>
            <p>{nameMsgs.map(v => <span>{v}</span>)}</p>
            <input onInput={(ev) => {setPassword(ev.target.value)}} value={password} type="text" name="password"/>
            <p>{passwordMsgs.map(v => <span>{v}</span>)}</p>
            <p><span>{msg}</span></p>
            <button onClick={clickCb}></button>
        </form>
    )
}

export {Signup, Login}
