export default class MyInfo {
  owner: boolean
  admin: boolean
  banned: boolean
  muted: boolean

  constructor(owner: boolean, admin: boolean, banned: boolean, muted: boolean) {
    this.owner = owner
    this.admin = admin
    this.banned = banned
    this.muted = muted
  }
}
