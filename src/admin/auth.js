import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Paper from '@mui/material/Paper/index.js'
import TextField from '@mui/material/TextField/index.js'
import Button from '@mui/material/Button/index.js'
import Dialog from '@mui/material/Dialog/index.js'
import DialogContent from '@mui/material/DialogContent/index.js'
import DialogContentText from '@mui/material/DialogContentText/index.js'

import * as m from '../../../e-commerce-common/messages.js'
import validate from './auth-validate.js'

function main(api) {
  const Login = () => {
    const navigate = useNavigate()

    const [errors, setErrors] = useState({})
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(true)

    const {
      register,
      handleSubmit,
      formState: { errors: formErrors },
    } = useForm({
      mode: 'onTouched',
      defaultValues: {
        username: '',
        password: '',
      },
      errors,
      resolver: validate,
    })

    const handleSubmitInner = values => {
      setIsDataLoading(true)

      api.auth.login(
        values.username,
        values.password,
        () => {
          navigate('../')
        },
        (body, res) => {
          setIsDataLoading(false)

          if (body.code === m.ResourceNotFound.code) {
            setErrors({ ...errors, username: body.message })
          } else if (body.code === m.InvalidCriterion.code) {
            setErrors({ ...errors, password: body.message })
          } else {
            setIsError(true)
          }
        }
      )
    }

    const handleFormElSubmit = ev => {
      ev.preventDefault()
    }

    const handleErrorDialogClose = () => {
      setIsErrorDialogOpen(false)
    }

    return (
      <>
        {isError ? (
          <div>
            <Dialog open={isErrorDialogOpen} onClose={handleErrorDialogClose}>
              <DialogContent>
                <DialogContentText>
                  Сталася помилка. Будь-ласка, перезавантажте сторінку.
                </DialogContentText>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="auth__page">
            <Paper className="auth__form-container" elevation={8}>
              <h1 className="auth__heading">Увійти</h1>
              <form className="auth__form" onSubmit={handleFormElSubmit}>
                <TextField
                  {...register('username')}
                  error={!!formErrors.username}
                  helperText={formErrors.username || null}
                  disabled={isDataLoading}
                  label="Ім'я користувача"
                  placeholder="Ім'я користувача"
                  fullWidth
                />
                <TextField
                  type="password"
                  {...register('password')}
                  error={!!formErrors.password}
                  helperText={formErrors.password || null}
                  disabled={isDataLoading}
                  label="Пароль"
                  placeholder="Пароль"
                  fullWidth
                />
                <Button onClick={handleSubmit(handleSubmitInner)} variant="contained">
                  Увійти
                </Button>
              </form>
            </Paper>
          </div>
        )}
      </>
    )
  }

  /*
  function Login() {
    const [name, setName] = useState('a')
    const [password, setPassword] = useState('a')
    const [nameMsgs, setNameMsgs] = useState([])
    const [passwordMsgs, setPasswordMsgs] = useState([])
    const [msg, setMsg] = useState('')

    const navigate = useNavigate()

    const clickCb = () => {
      api.auth
        .login(
          name,
          password,
          (body, res) => {
            return navigate('../')
          },
          (body, res) => {
            if (res.status >= 500) {
              console.log(`signup, internal error - res, body`, res, body)
              return alert(`Something's wrong on the server, please consult a technician`)
            }

            if (body.tree) {
              if (body.tree.node.name)
                setNameMsgs([
                  ...body.tree.node.name.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                  }, []),
                ])

              if (body.tree.node.password)
                setPasswordMsgs([
                  ...body.tree.node.password.errors.reduce((msgs, e) => {
                    if (e.message) msgs.push(e.message)
                  }, []),
                ])

              return
            }

            if (!body.message) {
              console.log(`signup, response not ok - res, body:`, res, body)
              return setMsg(`Some fields are filled incorrectly`)
            }

            setMsg(body.message)
          }
        )
        .catch(e => {
          console.log('login rejected - error:', e)
          alert(`Something is wrong with the program, please consult a technician`)
        })
    }

    return (
      <form onSubmit={e => e.preventDefault()} id="signup">
        <input
          onInput={ev => {
            setName(ev.target.value)
          }}
          value={name}
          type="text"
          name="name"
        />
        <p>
          {nameMsgs.map(v => (
            <span>{v}</span>
          ))}
        </p>
        <input
          onInput={ev => {
            setPassword(ev.target.value)
          }}
          value={password}
          type="text"
          name="password"
        />
        <p>
          {passwordMsgs.map(v => (
            <span>{v}</span>
          ))}
        </p>
        <p>
          <span>{msg}</span>
        </p>
        <button onClick={clickCb}></button>
      </form>
    )
  }
  */

  return { Login }
}

export default main
