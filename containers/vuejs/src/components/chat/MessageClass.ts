export default class Message {
  sender_name: string
  sender: number
  body: string
  date: Date

  constructor(sender_name: string, sender: number, body: string, date: Date) {
    this.sender_name = sender_name
    this.sender = sender
    this.body = body
    this.date = date
  }
}
