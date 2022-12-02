import {useNavigate, useParams, redirect} from 'react-router-dom'

function main(api) {
    function ProductCreate() {
        const [msg, setMsg] = useState('')

        api.product.create({expose: false}, (body, res) => {
            redirect(`/product/${body}`)
        }, (body, res) => {
            if (res.status >= 500) {
                return alert("Something's wrong on the server, please consult a technician")
            }

            setMsg("Something wrong with the request, please consult a technician")
            console.log("bad request - body, res:", body, res);
        })

        return (<div>{msg}</div>)
    }
}