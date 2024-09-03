import { User } from './user.model';

export class DirectMessage {
  member!: string[];
  directMessageID!: string;
  partnerUser?: any;

  constructor() {
    this.member = [];
    this.directMessageID = '';
  }

  public toJSON() {
    return {
      member: this.member,
      directMessageID: this.directMessageID,
    };
  }
}
