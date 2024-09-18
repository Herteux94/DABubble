/**
 * **Channel**
 *
 * This class represents a communication channel within the application.
 * It encapsulates properties such as the channel's name, creator, description,
 * creation time, members, and a unique identifier. The class provides a method
 * to convert the channel instance into a JSON object suitable for storage or transmission.
 *
 * **Usage Example:**
 * ```typescript
 * const newChannel = new Channel();
 * newChannel.name = 'General';
 * newChannel.creator = 'user123';
 * newChannel.description = 'A general discussion channel.';
 * newChannel.creationTime = Date.now();
 * newChannel.member = ['user123', 'user456'];
 * newChannel.channelID = 'channel_001';
 *
 * const channelJSON = newChannel.toJSON();
 * ```
 *
 * In the above example, a new `Channel` instance is created, its properties are set,
 * and then it is converted into a JSON object for further use.
 */
export class Channel {
  /**
   * The name of the channel.
   *
   * @type {string}
   */
  name!: string;

  /**
   * The identifier of the user who created the channel.
   *
   * @type {string}
   */
  creator!: string;

  /**
   * A brief description of the channel's purpose or topic.
   *
   * @type {string}
   */
  description!: string;

  /**
   * The timestamp representing when the channel was created.
   *
   * @type {number}
   */
  creationTime!: number;

  /**
   * An array of user identifiers who are members of the channel.
   *
   * @type {string[]}
   */
  member!: string[];

  /**
   * A unique identifier for the channel.
   *
   * @type {string}
   */
  channelID!: string;

  /**
   * Creates an instance of the Channel class.
   * Initializes the channel properties with default values.
   *
   * @constructor
   */
  constructor() {
    this.name = '';
    this.creator = '';
    this.description = '';
    this.creationTime;
    this.member = [];
    this.channelID = '';
  }

  /**
   * Converts the Channel instance into a JSON object.
   * This method is useful for serializing the channel data for storage or transmission.
   *
   * @returns {object} - A JSON representation of the channel.
   */
  public toJSON(): object {
    return {
      name: this.name,
      creator: this.creator,
      description: this.description,
      createdAt: this.creationTime,
      member: this.member,
      channelID: this.channelID
    };
  }
}
