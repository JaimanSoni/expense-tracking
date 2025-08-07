"use client";

import React, { useEffect, useState } from "react";
import { API_URLS, CATEGORIES, MONTHS, PAYMENT_MODES, PAYMENT_TYPES } from "../constants";
import Link from "next/link";
import { FaRegTrashCan } from "react-icons/fa6";



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
    const [filteredData, setFilteredData] = useState<Expense[]>([]);
    const [modal, setModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [openedData, setOpenedData] = useState<Expense | null | undefined>(null)


    // filters
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("");
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [formData, setFormData] = useState<Expense | null>(null);

    const getAllExpenses = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URLS.EXPENSE.GET);

            if (!response.ok) throw new Error("Failed to fetch expenses.");

            const responseData: Expense[] = await response.json();

            // Custom parser for "6 August, 2025" and "10:30 AM"
            const parseDateTime = (dateStr: string, timeStr: string) => {
                const [day, month, year] = dateStr.split(" ");
                const formatted = `${day} ${month} ${year} ${timeStr}`;
                return new Date(formatted);
            };

            // Sort by combined date and time
            const sorted: Expense[] = responseData.sort((a, b) => {
                const dateTimeA = parseDateTime(a.date, a.time);
                const dateTimeB = parseDateTime(b.date, b.time);
                return dateTimeB.getTime() - dateTimeA.getTime(); // latest first
            });

            setData(sorted);
            setFilteredData(sorted);
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
        const currentMonth = now.getMonth();
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

    useEffect(() => {
        const applyFilters = () => {
            let filtered = [...data];

            if (selectedCategory) {
                filtered = filtered.filter(item => item.category === selectedCategory);
            }

            if (selectedPaymentType) {
                filtered = filtered.filter(item => item.payment_type === selectedPaymentType);
            }

            if (selectedPaymentMode) {
                filtered = filtered.filter(item => item.payment_mode === selectedPaymentMode);
            }

            if (selectedMonth) {
                filtered = filtered.filter(item => {
                    if (!item.date) return false;

                    // Convert "5 August, 2025" → Date object
                    const parsedDate = new Date(`${item.date} IST`);
                    const itemMonth = parsedDate.toLocaleString('en-IN', { month: 'long' });

                    return itemMonth === selectedMonth;
                });
            }

            // if (selectedDate) {
            //     filtered = filtered.filter(item => {
            //         if (!item.date) return false;

            //         // Convert "5 August, 2025" to "YYYY-MM-DD"
            //         const parsedDate = new Date(`${item.date} IST`);
            //         const itemFormatted = parsedDate.toLocaleDateString("en-CA", {
            //             timeZone: "Asia/Kolkata",
            //         });
            //         console.log(selectedDate)
            //         console.log(itemFormatted)
            //         return itemFormatted === selectedDate;
            //     });
            // }

            setFilteredData(filtered);
        };

        applyFilters();
    }, [selectedCategory, selectedPaymentType, selectedPaymentMode, selectedMonth, selectedDate, data]);

    const handleModalClick = (id: string, type: string) => {
        const single = data.find((item) => item._id === id);
        if (!single) return;

        // Re-parse "6 August, 2025" using locale-aware parsing
        const parsedDate = new Date(
            new Date(single.date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        const formattedDate = parsedDate.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
        }); // "YYYY-MM-DD"

        // Convert "10:30 AM" to "10:30" (24-hour)
        const timeString = single.time;
        const [hours12, minutes, modifier] = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];

        let hours24 = parseInt(hours12, 10);
        if (modifier?.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
        if (modifier?.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;

        const formattedTime = `${hours24.toString().padStart(2, "0")}:${minutes}`;

        const formattedData = {
            ...single,
            date: formattedDate, // e.g. "2025-08-06"
            time: formattedTime, // e.g. "22:30"
        };

        if (type === "delete") {
            setDeleteModal(true);
        } else {
            setModal(true);
        }

        setOpenedData(single);
        setFormData(formattedData);
    };



    const closeModal = () => {
        setModal(false);
        setOpenedData(null);
        setFormData(null);
    };

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setOpenedData(null);
    }


    const updateData = async () => {
        if (!openedData || !openedData._id) {
            alert("Please select something");
            return;
        }

        try {
            // --- Date formatting: "YYYY-MM-DD" ➝ "5 August, 2025"
            const originalDate = new Date(formData?.date || "");
            const day = originalDate.getDate();
            const month = originalDate.toLocaleString("default", { month: "long" });
            const year = originalDate.getFullYear();
            const formattedDate = `${day} ${month}, ${year}`;

            // --- Time formatting: "14:30" ➝ "2:30 PM"
            const [hoursStr, minutes] = (formData?.time || "").split(":");
            let hours = parseInt(hoursStr || "0", 10);
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12; // Convert 0 => 12
            const formattedTime = `${hours}:${minutes} ${ampm}`;

            const payload = {
                _id: formData?._id,
                amount: formData?.amount,
                category: formData?.category,
                description: formData?.description,
                payment_mode: formData?.payment_mode,
                payment_type: formData?.payment_type,
                date: formattedDate, // e.g. "5 August, 2025"
                time: formattedTime, // e.g. "2:30 PM"
            };

            console.log("Sending payload:", payload);

            setLoading(true);

            const response = await fetch(API_URLS.EXPENSE.UPDATE, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            console.log("Response:", responseData);

            if (responseData.modifiedCount > 0) {
                alert("Update successful");
                window.location.reload();
            } else {
                alert("No changes were made.");
            }
        } catch (err) {
            alert("Something went wrong");
            console.error("Error updating data:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteData = async () => {
        if (!openedData || !openedData._id) {
            alert("Please select something");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URLS.EXPENSE.DELETE, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: openedData._id }),
            });

            const responseData = await response.json();

            if (response.ok && responseData.deletedCount > 0) {
                alert("Deleted successfully");
                window.location.reload(); // Or optionally refetch expenses without reload
            } else {
                alert("Failed to delete. Item may not exist.");
            }
        } catch (err) {
            alert("Something went wrong");
            console.error("Error deleting data:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className=" bg-slate-50 px-4 pb-[40px] md:px-8 max-w-[1200px] w-full m-auto min-h-[100dvh] flex flex-col items-center justify-start relative">
            <div className="flex justify-between items-center w-full border-b-[1px] border-gray-300 py-[15px] mb-[15px]">
                <h1 className="text-2xl font-semibold">All Expenses</h1>
                <Link href={"/"} className='w-[100px] h-[35px] text-[14px] flex items-center justify-center rounded-[5px] cursor-pointer  bg-white text-black border-[1px] border-gray-400'>Add +</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-[20px] w-full mb-5">
                <div className="w-full py-3 md:py-4 px-4 h-[95px] md:h-[130px] rounded-[15px] shadow-md bg-white flex flex-col justify-between">
                    <div className=" text-[13px] md:text-[17px] font-normal">Total Balance</div>
                    <div className=" text-[20px] md:text-[25px] font-medium text-green-600">
                        ₹{balance.toFixed(2)}
                    </div>
                </div>
                <div className="w-full py-3 md:py-4 px-4 h-[95px] md:h-[130px] rounded-[15px] shadow-md bg-white flex flex-col justify-between">
                    <div className=" text-[13px] md:text-[17px] font-normal">This Month Earnings</div>
                    <div className=" text-[20px] md:text-[25px] font-medium text-green-600">
                        Working...
                    </div>
                </div>
                <div className="w-full py-3 md:py-4 px-4 h-[95px] md:h-[130px] rounded-[15px] shadow-md bg-white flex flex-col justify-between">
                    <div className=" text-[13px] md:text-[17px] font-normal">This Month Expense</div>
                    <div className=" text-[20px] md:text-[25px] font-medium text-red-600">
                        ₹{calculateMonthlyExpense().toFixed(2)}
                    </div>
                </div>
                <div className="w-full py-3 md:py-4 px-4 h-[95px] md:h-[130px] rounded-[15px] shadow-md bg-white flex flex-col justify-between">
                    <div className=" text-[13px] md:text-[17px]  font-normal">Total Expense</div>
                    <div className=" text-[20px] md:text-[25px] font-medium text-red-600">
                        ₹{totalDebit.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="text-[20px] font-medium text-start w-full mt-[10px] mb-[5px]">
                Filters
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-[8px] md:gap-[10px] w-full mb-5">
                <div className="w-full">
                    <label className="text-[14px] inline-block mb-1" >Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-1 border rounded w-full"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((item, index) => (
                            <option key={index} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full">
                    <label className="text-[14px] inline-block mb-1" >Payment Type</label>
                    <select
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                        className="p-1 border rounded w-full"
                    >
                        <option value="">All Types</option>
                        {PAYMENT_TYPES.map((item, index) => (
                            <option key={index} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full">
                    <label className="text-[14px] inline-block mb-1" >Payment Mode</label>
                    <select
                        value={selectedPaymentMode}
                        onChange={(e) => setSelectedPaymentMode(e.target.value)}
                        className="p-1 border rounded w-full"
                    >
                        <option value="">All Modes</option>
                        {PAYMENT_MODES.map((item, index) => (
                            <option key={index} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full">
                    <label className="text-[14px] inline-block mb-1" >Month</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-1 border rounded w-full"
                    >
                        <option value="">All Months</option>
                        {MONTHS.map((item, index) => (
                            <option key={index} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
                {/* <div className="self-end w-full">
                    <label className="text-[14px] inline-block mb-1" >Date</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-1 border rounded w-full" />
                </div> */}

                <button
                    onClick={() => {
                        setSelectedCategory("");
                        setSelectedPaymentMode("");
                        setSelectedPaymentType("");
                        setSelectedMonth("");
                        setSelectedDate("");
                    }}
                    className="p-1 flex items-center justify-center cursor-pointer self-end border rounded "
                >
                    Clear Filters
                </button>





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
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr className="min-h-[50px]">
                                    <td colSpan={8} className="text-center py-4 text-gray-500">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr onClick={() => handleModalClick(item._id, "form")} key={item._id} className="border-t border-gray-200 hover:bg-gray-100 cursor-pointer h-[80px]">
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

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={` ${modal ? "opacity-100" : "opacity-0 pointer-events-none"} transition-all duration-200 w-screen h-screen flex justify-center py-[50px] px-[15px] items-center fixed top-0 left-0 bg-[#64646460] backdrop-blur-sm`}>
                <div className="relative max-w-[500px] w-full  py-[60px] bg-white rounded-[20px] shadow-md p-6">
                    <div onClick={closeModal} className="absolute top-[20px] right-[20px] text-[18px] w-[35px] h-[35px] bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                        X
                    </div>
                    {formData && (
                        <form
                            className="grid grid-cols-2 gap-4"
                            onSubmit={() => {
                                updateData();
                                closeModal()
                            }}
                        >
                            <div>
                                <label className="block text-sm mb-1">Amount</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Category</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map((type, i) => (
                                        <option key={i} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Payment Type</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.payment_type}
                                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                                >
                                    {PAYMENT_TYPES.map((type, i) => (
                                        <option key={i} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Payment Mode</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.payment_mode}
                                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                                >
                                    {PAYMENT_MODES.map((mode, i) => (
                                        <option key={i} value={mode}>{mode}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Time</label>
                                <input
                                    type="time"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                            <div className="flex w-full items-center justify-center self-end gap-[5px]">
                                <button type="submit" className="w-full bg-black  text-white rounded py-2 cursor-pointer">
                                    Save
                                </button>
                                <div onClick={() => handleModalClick(formData._id, "delete")} className="py-2 cursor-pointer w-[50px] h-[40px] flex items-center justify-center bg-red-200 hover:bg-red-300 rounded">
                                    <FaRegTrashCan size={15} />
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && openedData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#64646460] bg-opacity-30 backdrop-blur-sm"
                >
                    <div className="bg-white w-[350px] p-6 rounded-2xl shadow-lg relative">
                        <button
                            onClick={closeDeleteModal}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-6">Are you sure you want to delete this expense?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteData();
                                    closeDeleteModal();
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
