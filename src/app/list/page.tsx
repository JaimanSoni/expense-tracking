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

    const totalCredit = data?.reduce((acc, item) => {
        return item.payment_type === "credit" ? acc + Number(item.amount) : acc;
    }, 0) || 0;

    const totalDebit = data?.reduce((acc, item) => {
        return item.payment_type === "debit" ? acc + Number(item.amount) : acc;
    }, 0) || 0;
    const balance = totalCredit - totalDebit;


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
        <main className="px-4 pb-[40px] md:px-8 max-w-[1200px] w-full m-auto min-h-screen flex flex-col items-center justify-start relative">
            <div className="flex justify-between items-center w-full border-b-[1px] border-gray-300 py-[15px] mb-[15px]">
                <h1 className="text-2xl font-semibold">All Expenses</h1>
                <Link href={"/"} className='w-[100px] h-[35px] text-[14px] flex items-center justify-center rounded-[5px] cursor-pointer  bg-white text-black border-[1px] border-gray-400'>Add +</Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between  md:items-center gap-[6px] w-full mb-5">
                <h2 className=" text-md md:text-xl font-semibold">
                    Balance: ₹{balance.toFixed(2)}
                </h2>
                <h3 className="text-md md:text-lg font-normal">
                    Monthly Expense: ₹{calculateMonthlyExpense().toFixed(2)}
                </h3>
            </div>

            {isLoading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="w-full max-h-screen min-h-fit overflow-y-auto overflow-x-auto rounded-lg shadow-md ">
                    <table className="min-w-full border border-gray-300 text-sm text-left text-nowrap">
                        <thead className="bg-gray-200 text-gray-700 uppercase text-[13px] ">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Payment Type</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">Description</th>
                                <th className="px-4 py-2">Date & Time</th>
                                {/* <th className="px-4 py-2">Time</th> */}
                                <th className="px-4 py-2">Payment Mode</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr className="min-h-[50px]">
                                    <td colSpan={8} className="text-center py-4 text-gray-500">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item._id} className="border-t border-gray-200 h-[80px]">
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2">₹{item.amount}</td>
                                        <td className="px-4 py-2">
                                            {
                                                item.payment_type === "credit" ?
                                                    <div className="w-[65px] h-[28px] cursor-pointer text-[13px] bg-green-100 rounded-full flex items-center justify-center">{item.payment_type}</div>
                                                    :
                                                    <div className="w-[65px] h-[28px] cursor-pointer text-[13px] bg-red-100 rounded-full flex items-center justify-center">{item.payment_type}</div>
                                            }
                                        </td>
                                        <td className="px-4 py-2">{item.category || "-"}</td>
                                        <td className="px-4 py-2">{item.description}</td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[14px] font-medium ">{item.date || "-"}</span>
                                                <span className="text-[13px] ">{item.time || "-"}</span>
                                            </div>
                                        </td>
                                        {/* <td className="px-4 py-2">{item.date || "-"}</td>
                                        <td className="px-4 py-2">{item.time || "-"}</td> */}
                                        <td className="px-4 py-2">{item.payment_mode || "-"}</td>
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
