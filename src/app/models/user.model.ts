/**
 * **User**
 *
 * This class represents a user within the application. It encapsulates user-related information
 * such as name, profile image, email, activity status, online timestamp, password reset details,
 * associated channels, direct messages, and a unique user identifier. The class provides a method
 * to convert the user instance into a JSON object suitable for storage or transmission.
 *
 * **Usage Example:**
 * ```typescript
 * const newUser = new User();
 * newUser.name = 'John Doe';
 * newUser.email = 'john.doe@example.com';
 * newUser.active = true;
 * newUser.lastOnline = Date.now();
 * newUser.channels = ['channel_001', 'channel_002'];
 * newUser.directMessages = ['user_123', 'user_456'];
 * newUser.userID = 'user_789';
 *
 * const userJSON = newUser.toJSON();
 * ```
 *
 * In the above example, a new `User` instance is created, its properties are set, and then it is converted
 * into a JSON object for further use.
 */
export class User {
  /**
   * The name of the user.
   *
   * @type {string}
   */
  name!: string;

  /**
   * The URL or path to the user's profile image.
   *
   * @type {string}
   */
  profileImg!: string;

  /**
   * The email address of the user.
   *
   * @type {string}
   */
  email!: string;

  /**
   * Indicates whether the user's account is active.
   *
   * @type {boolean}
   */
  active!: boolean;

  /**
   * The timestamp representing the user's last online activity.
   *
   * @type {any}
   */
  lastOnline!: any;

  /**
   * The token used for password reset operations.
   *
   * @type {string}
   */
  passwordResetToken!: string;

  /**
   * The expiration time of the password reset token.
   *
   * @type {string}
   */
  passwordResetExpires!: string;

  /**
   * An array of channel identifiers that the user is a part of.
   *
   * @type {string[]}
   */
  channels!: string[];

  /**
   * An array of user identifiers with whom the user has direct messages.
   *
   * @type {string[]}
   */
  directMessages!: string[];

  /**
   * A unique identifier for the user.
   *
   * @type {string}
   */
  userID!: string;

  /**
   * Creates an instance of the User class.
   * Initializes all properties with default values.
   *
   * @constructor
   */
  constructor() {
    this.name = '';
    this.profileImg = '';
    this.email = '';
    this.active = false;
    this.lastOnline = 0;
    this.passwordResetToken = '';
    this.passwordResetExpires = '';
    this.channels = [];
    this.directMessages = [];
    this.userID = '';
  }

  /**
   * Converts the User instance into a JSON object.
   * This method is useful for serializing the user data for storage or transmission.
   *
   * @returns {object} - A JSON representation of the user.
   */
  public toJSON(): object {
    return {
      name: this.name,
      profileImg: this.profileImg,
      email: this.email,
      active: this.active,
      lastOnline: this.lastOnline,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpires: this.passwordResetExpires,
      channels: this.channels,
      directMessages: this.directMessages,
      userID: this.userID,
    };
  }
}
