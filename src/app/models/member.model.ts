export class Member {
  memberID!: string;
  name!: string;
  profileImg!: string;

  constructor() {
    this.memberID = '';
    this.name = '';
    this.profileImg = '';
  }

  public toJSON() {
    return {
      memberID: this.memberID,
      name: this.name,
      profileImg: this.profileImg,
    };
  }
}
