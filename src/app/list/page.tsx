"use client";

import React, { useEffect, useState } from "react";
import { API_URLS } from "../constants";
import Link from "next/link";

// Type definition (optional, but improves clarity and safety)
interface Expense {
    _id: string;
    amount: string;
    category: string;
    description: string;
    date: string;
    time: string;
    payment_mode: string;
    payment_type: string;
}

export default function Page() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Expense[]>([]);

    const getAllExpenses = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URLS.EXPENSE.GET);

            if (!response.ok) throw new Error("Failed to fetch expenses.");

            const responseData = await response.json();
            setData(responseData);
        } catch (err) {
            alert("Something went wrong.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllExpenses();
    }, []);

    const calculateTotalBalance = () => {
        return data.reduce((total, expense) => {
            const amount = parseFloat(expense.amount);
            if (isNaN(amount)) return total;

            return expense.payment_type === 'credit'
                ? total + amount
                : total - amount;
        }, 0);
    };

    const calculateMonthlyExpense = () => {
        const now = new Date();
        const currentMonth = now.getMonth(); // 0 = Jan
        const currentYear = now.getFullYear();

        return data.reduce((total, expense) => {
            const { date, amount, payment_type } = expense;

            if (!date || payment_type !== 'debit') return total;

            try {
                // Parse "5 August, 2025" directly
                const parsedDate = new Date(date);

                if (
                    parsedDate instanceof Date &&
                    !isNaN(parsedDate.getTime()) &&
                    parsedDate.getMonth() === currentMonth &&
                    parsedDate.getFullYear() === currentYear
                ) {
                    const numericAmount = parseFloat(amount);
                    return !isNaN(numericAmount) ? total + numericAmount : total;
                }
            } catch (err) {
                console.error('Date parse error:', err);
            }

            return total;
        }, 0);
    };



    return (
        <main className="p-4 md:p-8 max-w-[1200px] w-full m-auto min-h-screen flex flex-col items-center justify-start relative">
            <div className="flex justify-between items-center w-full mb-5">
                <h1 className="text-2xl font-semibold mb-6">All Expenses</h1>
                <Link href={"/"} className='w-[120px] h-[36px] text-[14px] flex items-center justify-center rounded-[5px] cursor-pointer  bg-white text-black border-[1px] border-gray-400'>Go Home</Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center w-full mb-5">
                <h2 className="text-xl font-medium mb-4">
                    Total Balance: ₹{calculateTotalBalance().toFixed(2)}
                </h2>
                <h3 className="text-lg font-normal">
                    This Months Expense: ₹{calculateMonthlyExpense().toFixed(2)}
                </h3>
            </div>

            {isLoading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="w-full max-h-screen min-h-fit overflow-y-auto overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full border border-gray-300 text-sm text-left">
                        <thead className="bg-gray-200 text-gray-700 uppercase">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">Description</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Payment Mode</th>
                                <th className="px-4 py-2">Payment Type</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-gray-500">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="border-t border-gray-200">
                                        <td className="px-4 py-2">{item._id}</td>
                                        <td className="px-4 py-2">₹{item.amount}</td>
                                        <td className="px-4 py-2">{item.category}</td>
                                        <td className="px-4 py-2">{item.description}</td>
                                        <td className="px-4 py-2">{item.date || "-"}</td>
                                        <td className="px-4 py-2">{item.time || "-"}</td>
                                        <td className="px-4 py-2">{item.payment_mode}</td>
                                        <td className="px-4 py-2">{item.payment_type}</td>
                                        <td className="px-4 py-2">Coming Soon...</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
