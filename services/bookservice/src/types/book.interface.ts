import { ObjectId } from 'mongodb';

export interface IBook {
  _id?: ObjectId;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}