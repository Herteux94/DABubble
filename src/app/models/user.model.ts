import { Channel } from "./channel.model";
import { Message } from "./message.model";

export class User {
  name!: string;
  profileImg!: string;
  email!: string;
  active!: boolean;
  lastOnline!: string;
  passwordResetToken!: string;
  passwordResetExpires!: string;
  channels!: string[];
  directMessages!: Message[];
  userID!: string;

  constructor() {
    this.name = '';
    this.profileImg = '';
    this.email = '';
    this.active = false;
    this.lastOnline = '';
    this.passwordResetToken = '';
    this.passwordResetExpires = '';
    this.channels = [];
    this.directMessages = [];
    this.userID = '';
  }

  public toJSON() {
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
      userID: this.userID
    };
  }
}
