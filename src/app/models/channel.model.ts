export class Channel {
  name!: string;
  creator!: string;
  description!: string;
  member!: any[];
  messages?: string[];
  createdAt!: string;

  constructor() {
    this.name = '';
    this.creator = '';
    this.description = '';
    this.member = [];
    this.messages = [];
    this.createdAt = '';
  }

  public toJSON() {
    return {
      name: this.name,
      creator: this.creator,
      description: this.description,
      member: this.member,
      messages: this.messages,
      createdAt: this.createdAt,
    };
  }
}
