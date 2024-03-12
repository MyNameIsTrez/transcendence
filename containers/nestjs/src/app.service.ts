import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  getLoginError(str: string): string {
    return `There was an error while trying to access your intra profile: ${str}`
  }

  authenticate(code: string) {
    if (code === undefined) {
      return this.getLoginError('Could not retrieve your 42 authentication code')
    }
    // TODO: Store code in a 'Set' to use then a user connects

    // TODO: Move this whole precedure to when a socket opens to connect a socket to a profile
    const formData = new FormData() // TODO: free?
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
      .then((response) => {
        response
          .json()
          .then((j) => {
            console.log('j:', j)

            const access_token: string = j.access_token
            if (access_token === undefined) {
              console.log('Could not retrieve your 42 access token')
              return this.getLoginError('Could not retrieve your 42 access token')
            }
            console.log(`access_token: ${access_token}`)
            // return access_token

            // TODO: Free this?
            const requestHeaders = new Headers()
            requestHeaders.set('Authorization', `Bearer ` + access_token)
            fetch(`https://api.intra.42.fr/v2/me`, {
              headers: requestHeaders
            })
              .then((response) => {
                response
                  .json()
                  .then((j2) => {
                    console.log('H')
                    // console.log(j2)
                    console.log(`Unique ID is ${j2.id}`)
                  })
                  .catch((err) => {
                    console.log('X')
                    console.log(err)
                    return err
                  })
                return response
              })
              .catch((err) => {
                console.log('F')
                console.log(err)
                return err
              })
          })
          .catch((err) => {
            console.log('B')
            console.error(err)
            return err
          })
      })
      .catch((err) => {
        console.log('A')
        console.error(err)
        return err
      })

    // console.log('G')
  }
}
