import type Visibility from './VisibilityEnum'

export default class Chat {
  chat_id: string
  name: string
  visibility: Visibility

  constructor(chat_id: string, name: string, visibility: Visibility) {
    this.chat_id = chat_id
    this.name = name
    this.visibility = visibility
  }
}
