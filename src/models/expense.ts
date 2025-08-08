import { ObjectId, Db, Collection } from "mongodb";

export interface Expense {
  _id?: ObjectId;
  amount: number;
  category: string;
  description?: string;
  date: string;
  time?: string;
  payment_mode: string;
  payment_type: "debit" | "credit";
  bank: string;
  created_at: Date;
}

export function getExpenseCollection(db: Db): Collection<Expense> {
  return db.collection<Expense>("expenses");
}

export async function getExpenseById(
  db: Db,
  id: string
): Promise<Expense | null> {
  // if (!ObjectId.isValid(id)) {
  //   throw new Error("Invalid ObjectId");
  // }

  const expenses = getExpenseCollection(db);
  const expense = await expenses.findOne({ _id: new ObjectId(id) });

  return expense;
}
