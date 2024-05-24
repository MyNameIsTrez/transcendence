import axios from 'axios'

const api_url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT + '/'

export async function get(path: string) {
  const jwt = localStorage.getItem('jwt')

  const options = { headers: { Authorization: `Bearer ${jwt}` } }

  return await axios
    .get(api_url + path, options)
    .then((response) => {
      return response.data
    })
    .catch((e) => {
      if (e.response.data.message === 'JWT was issued before the database existed') {
        localStorage.removeItem('jwt')
        location.reload()
      }
      throw e
    })
}

export async function post(path: string, body: any) {
  const jwt = localStorage.getItem('jwt')

  return await axios
    .post(api_url + path, body, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
    .then((response) => {
      return response.data
    })
    .catch((e) => {
      if (e.response.data.message === 'JWT was issued before the database existed') {
        localStorage.removeItem('jwt')
        location.reload()
      }
      throw e
    })
}

export async function getImage(path: string) {
  return 'data:image/png;base64,' + (await get(path))
}
