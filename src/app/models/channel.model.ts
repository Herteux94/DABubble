export class Channel {
  name!: string;
  creator!: string;
  description!: string;
  creationTime!: number;
  member!: string[];
  channelID!: string;

  constructor() {
    this.name = '';
    this.creator = '';
    this.description = '';
    this.creationTime;
    this.member = [];
    this.channelID = '';
  }

  public toJSON() {
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
