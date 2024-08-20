export class Message {
  senderID!: string;
  threadID!: string;
  content?: string;

  constructor() {
    this.senderID = '';
    this.threadID = '';
    this.content = '';
  }

  public toJSON() {
    return {
      threadID: this.threadID,
      senderID: this.senderID,
      content: this.content
    };
  }


}