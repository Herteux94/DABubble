export class DirectMessage {
    member!: string[];
  
    constructor() {
      this.member = [];
    }
  
    public toJSON() {
      return {
        member: this.member
      };
    }
  }