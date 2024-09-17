export class DirectMessage {
  /**
   * An array of user identifiers participating in the direct message.
   *
   * @type {string[]}
   */
  member!: string[];

  /**
   * A unique identifier for the direct message conversation.
   *
   * @type {string}
   */
  directMessageID!: string;

  /**
   * An optional property representing the partner user in the direct message.
   * This could hold user-related data or a reference to the partner's user object.
   *
   * @type {any}
   * @optional
   */
  partnerUser?: any;

  /**
   * Creates an instance of the DirectMessage class.
   * Initializes the `member` array and `directMessageID` with default values.
   *
   * @constructor
   */
  constructor() {
    this.member = [];
    this.directMessageID = '';
  }

  /**
   * Converts the DirectMessage instance into a JSON object.
   * This method is useful for serializing the direct message data for storage or transmission.
   *
   * @returns {object} - A JSON representation of the direct message.
   */
  public toJSON(): object {
    return {
      member: this.member,
      directMessageID: this.directMessageID,
    };
  }
}
