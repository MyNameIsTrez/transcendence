import axios from 'axios'
// import { useRouter } from 'vue-router'

// const router = useRouter()

export async function get(path: string) {
  const jwt = localStorage.getItem('jwt')

  const options = { headers: { Authorization: `Bearer ${jwt}` } }

  // TODO: Don't hardcode "localhost:4242"; use the env!
  return await axios.get(`http://localhost:4242/api/${path}`, options).then((response) => {
    return response.data
  })
}

export async function post(path: string, body: any) {
  const jwt = localStorage.getItem('jwt')
  // TODO: Don't hardcode "localhost:4242"; use the env!
  return await axios
    .post(`http://localhost:4242/api/${path}`, body, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then((response) => {
      return response.data
    })
}

export async function getImage(path: string) {
  return 'data:image/png;base64,' + (await get(path))
}
