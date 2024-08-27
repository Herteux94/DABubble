export class DirectMessage {
    member!: string[];
    directMessageID!: string;
  
    constructor() {
      this.member = [];
      this.directMessageID = '';
    }
  
    public toJSON() {
      return {
        member: this.member,
        directMessageID: this.directMessageID
      };
    }
  }