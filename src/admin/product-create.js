import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function main(api) {
  function ProductCreate() {
    const navigate = useNavigate()

    const [msg, setMsg] = useState('')

    useEffect(() => {
      api.product.create(
        {
          expose: false,
          // see Time in readme
          time: Date.now(),
        },
        (body, res) => {
          console.log('ProductCreate api success cb, body:', body)
          return navigate(`${body}`)
        },
        (body, res) => {
          if (res.status >= 500) {
            return alert("Something's wrong on the server, please consult a technician")
          }

          setMsg('Something wrong with the request, please consult a technician')
          console.log('bad request - body, res:', body, res)
        }
      )
    }, [])

    return <div>{msg}</div>
  }

  return ProductCreate
}

export default main
