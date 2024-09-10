export class Message {
  senderID!: string;
  creationTime!: number;
  content!: string;
  attachments!: string[]; //pdf, png, jpg, jpeg
  reactions!: { emoji: string; count: number; users: string[] }[];
  messageID!: string;
  threadLength!: number;
  lastAnswer!: number;

  constructor() {
    this.senderID = '';
    this.creationTime = Date.now();
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
    this.threadLength = 0;
    this.lastAnswer = Date.now();
  }

  public toJSON() {
    return {
      senderID: this.senderID,
      creationTime: this.creationTime,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions.map((reaction) => ({
        emoji: reaction.emoji,
        count: reaction.count,
        users: reaction.users,
      })),
      messageID: this.messageID,
      threadLength: this.threadLength,
      lastAnswer: this.lastAnswer,
    };
  }
}
