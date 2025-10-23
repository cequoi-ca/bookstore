import { ObjectId } from 'mongodb';

export interface IOrder {
  _id?: ObjectId;
  books: Record<string, number>; // BookID -> count
  status: 'pending' | 'fulfilled';
  createdAt: Date;
  fulfilledAt?: Date;
}

export interface IOrderFulfillment {
  book: string; // BookID
  shelf: string; // ShelfId
  numberOfBooks: number;
}
