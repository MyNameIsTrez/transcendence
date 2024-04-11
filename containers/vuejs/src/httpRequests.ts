import axios from 'axios'
// import { useRouter } from 'vue-router'

// const router = useRouter()

export async function get(path: string) {
  const jwt = localStorage.getItem('jwt')
  return await axios
    .get(`http://localhost:4242/api/${path}`, { headers: { Authorization: `Bearer ${jwt}` } })
    .then((response) => {
      return response.data
    })
  // TODO: Put this back! This should be easy if this is turned into a .vue file
  // .catch(() => {
  //   localStorage.removeItem('jwt')
  //   router.replace({ path: '/login' })
  // })
}
