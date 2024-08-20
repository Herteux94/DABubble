export class Channel {
  name!: string;
  creator!: string;
  description!: string;
  createdAt!: string;

  constructor() {
    this.name = '';
    this.creator = '';
    this.description = '';
    this.createdAt = '';
  }

  public toJSON() {
    return {
      name: this.name,
      creator: this.creator,
      description: this.description,
      createdAt: this.createdAt
    };
  }
}
