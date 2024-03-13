import { Injectable } from '@nestjs/common'
import { UsersService } from './users/users.service'

@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) {}

  getHello(): string {
    return 'Hello World!'
  }

  async authenticate(code: string): Promise<boolean> {
    const formData = new FormData()
    formData.set('grant_type', 'authorization_code')
    formData.set('client_id', process.env.INTRA_CLIENT_ID || '') // TODO: Don't push this
    formData.set('client_secret', process.env.INTRA_CLIENT_SECRET || '') // TODO: Don't push this
    formData.set('code', code)
    formData.set(
      'redirect_uri',
      (process.env.VITE_ADDRESS || '') + ':' + (process.env.FRONTEND_PORT || '')
    )

    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((j) => {
        const access_token: string = j.access_token
        if (access_token === undefined) {
          throw 'Could not retrieve your 42 access token'
        }

        const requestHeaders = new Headers()
        requestHeaders.set('Authorization', `Bearer ` + access_token)
        return fetch('https://api.intra.42.fr/v2/me', {
          headers: requestHeaders
        })
      })
      .then((response) => response.json())
      .then((j) => {
        this.usersService.create({
          intra_id: j.id,
          displayname: j.displayname,
          email: j.email,
          image_url: j.image.versions.medium
        })
        return true
      })
      .catch((err) => {
        console.error(err)
        return false
      })
  }
}
