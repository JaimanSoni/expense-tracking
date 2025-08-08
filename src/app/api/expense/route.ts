import { connectToDatabase } from "@/lib/mongodb";
import { getExpenseCollection, Expense } from "@/models/expense";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function GET(req: Request) {
  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  const { searchParams } = new URL(req.url);
  const bank = searchParams.get("bank");
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let query = {};
  if (bank && bank.trim() !== "") {
    query = { bank };
  }

  const allExpenses = await expenses
    .find(query)
    .sort({ date: -1 }) // or use created_at if needed
    .skip(offset)
    .limit(limit)
    .toArray();

  return Response.json(allExpenses);
}

export async function POST(req: Request) {
  const data: Omit<Expense, "_id" | "createdAt"> = await req.json();

  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  // Get current IST time
  const now = new Date();
  const indianTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  // Manually format date to "6 August, 2025"
  const day = indianTime.getDate();
  const month = indianTime.toLocaleString("default", { month: "long" });
  const year = indianTime.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  // Format time like "10:30 AM"
  const formattedTime = indianTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Use passed date/time if available, else use generated ones
  const finalDate = data.date?.trim() ? data.date : formattedDate;
  const finalTime = data.time?.trim() ? data.time : formattedTime;

  const result = await expenses.insertOne({
    ...data,
    date: finalDate,
    time: finalTime,
    created_at: indianTime,
  });

  return Response.json({ insertedId: result.insertedId });
}

// PATCH: Update expense by ID
export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  const dataToSend = {
    amount: data.amount,
    category: data.category,
    description: data.description,
    payment_mode: data.payment_mode,
    payment_type: data.payment_type,
    date: data.date,
    time: data.time,
    bank: data.bank,
  };
  console.log(dataToSend);

  const result = await expenses.updateOne(
    { _id: new ObjectId(data._id) },
    { $set: { ...dataToSend } }
  );

  return Response.json({ modifiedCount: result.modifiedCount });
}

// DELETE: Delete expense by ID
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  const result = await expenses.deleteOne({ _id: new ObjectId(data.id) });

  return Response.json({ deletedCount: result.deletedCount });
}
