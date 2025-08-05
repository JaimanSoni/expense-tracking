import { connectToDatabase } from "@/lib/mongodb";
import { getExpenseCollection, Expense } from "@/models/expense";

export async function GET() {
  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  const allExpenses = await expenses.find().sort({ date: -1 }).toArray();
  return Response.json(allExpenses);
}

export async function POST(req: Request) {
  const data: Omit<Expense, "_id" | "createdAt"> = await req.json();

  const db = await connectToDatabase();
  const expenses = getExpenseCollection(db);

  // Get current time in IST
  const now = new Date();
  const indianTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  // Extract formatted date and time
  const formattedDate = indianTime.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }); // e.g. "5 August, 2025"

  const formattedTime = indianTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); // e.g. "10:30 AM"

  // Fallback if date/time missing
  const finalDate = data.date?.trim() ? data.date : formattedDate;
  const finalTime = data.time?.trim() ? data.time : formattedTime;

  const result = await expenses.insertOne({
    ...data,
    date: finalDate,
    time: finalTime,
    created_at: indianTime, // store IST time
  });

  return Response.json({ insertedId: result.insertedId });
}
