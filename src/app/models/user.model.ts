export class User {
  name!: string;
  profileImg!: string;
  email!: string;
  active!: boolean;
  lastOnline!: any;
  passwordResetToken!: string;
  passwordResetExpires!: string;
  channels!: string[];
  directMessages!: string[];
  userID!: string;

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
      userID: this.userID,
    };
  }
}
