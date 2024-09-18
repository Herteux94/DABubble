import { serverTimestamp } from '@angular/fire/firestore';

/**
 * **Message**
 *
 * This class represents a message within the application. It encapsulates information such as the sender's ID,
 * creation time, content, attachments, reactions, unique message identifier, thread length, and the timestamp
 * of the last response. The class provides a method to convert the message instance into a JSON object suitable
 * for storage or transmission.
 *
 * **Usage Example:**
 * ```typescript
 * import { Message } from './models/message.model';
 *
 * const newMessage = new Message();
 * newMessage.senderID = 'user123';
 * newMessage.content = 'Hello, world!';
 * newMessage.attachments = ['image1.png', 'document.pdf'];
 * newMessage.reactions = [
 *   { emoji: '👍', count: 3, users: ['user456', 'user789', 'user101'] },
 *   { emoji: '❤️', count: 1, users: ['user112'] }
 * ];
 * newMessage.messageID = 'msg_001';
 * newMessage.threadLength = 5;
 * newMessage.lastAnswer = serverTimestamp();
 *
 * const messageJSON = newMessage.toJSON();
 * ```
 *
 * In the above example, a new `Message` instance is created, its properties are set, and then it is converted
 * into a JSON object for further use, such as storing in a database or sending over a network.
 */
export class Message {
  /**
   * The unique identifier of the user who sent the message.
   *
   * @type {string}
   */
  senderID!: string;

  /**
   * The timestamp representing when the message was created.
   * Initialized using Firebase's `serverTimestamp`.
   *
   * @type {any}
   */
  creationTime!: any;

  /**
   * The textual content of the message.
   *
   * @type {string}
   */
  content!: string;

  /**
   * An array of attachment URLs or paths associated with the message.
   * Supported attachment types include PDF, PNG, JPG, and JPEG.
   *
   * @type {string[]}
   */
  attachments!: string[]; //pdf, png, jpg, jpeg

  /**
   * An array of reactions to the message. Each reaction includes the emoji used,
   * the count of how many times it was used, and an array of user IDs who reacted.
   *
   * @type {{ emoji: string; count: number; users: string[] }[]}
   */
  reactions!: { emoji: string; count: number; users: string[] }[];

  /**
   * The unique identifier for the message.
   *
   * @type {string}
   */
  messageID!: string;

  /**
   * The number of replies or threads associated with the message.
   *
   * @type {number}
   */
  threadLength!: number;

  /**
   * The timestamp representing the last time someone responded to the message.
   * Initialized using Firebase's `serverTimestamp`.
   *
   * @type {any}
   */
  lastAnswer!: any;

  /**
   * Creates an instance of the Message class.
   * Initializes all properties with default values.
   *
   * @constructor
   */
  constructor() {
    this.senderID = '';
    this.creationTime = serverTimestamp();
    this.content = '';
    this.attachments = [];
    this.reactions = [];
    this.messageID = '';
    this.threadLength = 0;
    this.lastAnswer = serverTimestamp();
  }

  /**
   * Converts the Message instance into a JSON object.
   * This method is useful for serializing the message data for storage or transmission.
   *
   * @returns {object} - A JSON representation of the message.
   */
  public toJSON(): object {
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
