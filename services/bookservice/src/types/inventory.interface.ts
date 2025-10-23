import { ObjectId } from 'mongodb';

export interface IInventory {
  _id?: ObjectId;
  bookId: string; // BookID as string
  shelf: string; // ShelfId
  count: number;
}
