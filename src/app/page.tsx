'use client';
import { useVoice } from '@/context/VoiceContext';
import VoiceInput from '@/components/VoiceInput';
import Link from 'next/link';
import { API_URLS } from './constants';
import { useState } from 'react';
import { BANK_TRANSFERS } from './preDefinedExpenses';


interface Expense {
  amount: string;
  category: string;
  description: string;
  date: string;
  time: string;
  payment_mode: string;
  payment_type: string;
  bank: string;
}

export default function Home() {
  const { state, dispatch } = useVoice();
  const [modal, setModal] = useState(false)
  const [transferData, setTransferData] = useState<Expense[]>([])
  const [transferAmount, setTransferAmount] = useState("")
  const [selectedTransferType, setSelectedTransferType] = useState("")

  const [isLoading, setLoading] = useState(false);

  const saveExpense = async () => {
    if (!state.transcript) {
      alert("Please speak again.")
      return;
    }
    try {
      setLoading(true)
      const response = await fetch(API_URLS.EXPENSE.CREATE, {
        method: "POST",
        body: state.transcript
      })
      if (response.ok) {

        alert("Success in adding.")
        localStorage.removeItem("data")
        window.location.href = "/list"
      }
    } catch (err) {
      alert("Something went wrong.")
      console.log(err)
    } finally {
      dispatch({ type: "SET_TRANSCRIPT", payload: "" });
      dispatch({ type: "STOP_LISTENING" });
      dispatch({ type: "IS_LOADING", payload: false });
      setLoading(false)
    }


  }

  const saveBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferAmount || isNaN(Number(transferAmount))) {
      alert("Please enter a valid amount.");
      return;
    }

    let transfers: Expense[] = [];

    switch (selectedTransferType) {
      case "axis-sbi":
        transfers = BANK_TRANSFERS.AXIS_TO_SBI(transferAmount);
        break;
      case "axis-dcb":
        transfers = BANK_TRANSFERS.AXIS_TO_DCB(transferAmount);
        break;
      case "dcb-sbi":
        transfers = BANK_TRANSFERS.DCB_TO_SBI(transferAmount);
        break;
      case "dcb-axis":
        transfers = BANK_TRANSFERS.DCB_TO_AXIS(transferAmount);
        break;
      case "sbi-dcb":
        transfers = BANK_TRANSFERS.SBI_TO_DCB(transferAmount);
        break;
      case "sbi-axis":
        transfers = BANK_TRANSFERS.SBI_TO_AXIS(transferAmount);
        break;
      default:
        alert("Invalid transfer type selected.");
        return;
    }

    // Add date and time to each transfer
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }); // e.g., "8 August, 2025"

    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // e.g., "10:30 AM"

    const finalTransfers = transfers.map((t) => ({
      ...t,
      date,
      time,
    }));

    try {
      setLoading(true);

      for (const transfer of finalTransfers) {
        const res = await fetch(API_URLS.EXPENSE.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transfer),
        });

        if (!res.ok) {
          throw new Error("Failed to save one or more transfers.");
        }
      }

      alert("Bank transfer recorded successfully.");
      closeModal();
      setTransferAmount("0");
      localStorage.clear();
      window.location.href = "/list";

    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving transfer.");
    } finally {
      setLoading(false);
    }
  };


  const closeModal = () => {
    setModal(false)
  }

  const handleTransferClick = (item: string) => {
    setModal(true)
    setSelectedTransferType(item)
  }

  return (
    <main className="px-4 md:px-8 py-[50px] max-w-[500px] w-full m-auto min-h-[100dvh] flex flex-col items-center justify-between relative">

      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
      <div className='w-full'>
        <div className='m-auto w-fit '>
          <VoiceInput />
        </div>

        <div className='w-full flex gap-3'>
          <input className="w-full border rounded px-3 py-2" type="text" value={state.manual_transcript} placeholder='Write something' onChange={(e) => { dispatch({ type: "MANUAL_TRANSCRIPT", payload: e.target.value }); }} />
          <button type='button' onClick={() => { dispatch({ type: "MANUAL", payload: true }); }} className='w-[70px] bg-black rounded text-white cursor-pointer'>Ok</button>
        </div>
        <div className='w-full flex flex-nowrap gap-5 overflow-scroll my-[15px]'>
          <div onClick={() => handleTransferClick("axis-sbi")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            Axis to SBI
          </div>
          <div onClick={() => handleTransferClick("axis-dcb")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            Axis to DCB
          </div>
          <div onClick={() => handleTransferClick("dcb-sbi")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            DCB to SBI
          </div>
          <div onClick={() => handleTransferClick("dcb-axis")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            DCB to Axis
          </div>
          <div onClick={() => handleTransferClick("sbi-dcb")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            SBI to DCB
          </div>
          <div onClick={() => handleTransferClick("sbi-axis")} className="min-w-[100px] cursor-pointer border rounded p-1 text-center">
            SBI to Axis
          </div>
        </div>
        <div className="my-6 p-4 bg-slate-50 rounded shadow-md w-full">
          <div className='w-full min-h-[150px] h-fit max-h-[350px] overflow-scroll  '>
            {state.transcript ? <>
              <pre className="p-4 rounded text-sm overflow-auto">
                <code>{state.transcript}</code>
              </pre>
            </> : state.isLoading ? "Loading..." : "Waiting for input..."}
          </div>
        </div>
        <div className='w-full flex items-center justify-center gap-6'>
          <Link href={"/list"} className='w-full h-[45px] flex items-center justify-center rounded-[5px] cursor-pointer  bg-white text-black border-[1px] border-gray-400'>View All</Link>
          <button onClick={saveExpense} type='submit' className='w-full h-[45px] rounded-[5px] cursor-pointer  bg-black text-white'>{isLoading ? "Adding..." : "Add"}</button>
        </div>
      </div>

      <div
        className={` transition-all duration-200 ${modal ? "opacity-100" : "opacity-0 pointer-events-none"} fixed inset-0 z-50 flex items-center justify-center bg-[#64646460] bg-opacity-30 backdrop-blur-sm`}
      >
        <div className="bg-white w-[350px] p-6 rounded-2xl shadow-lg relative">
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            ✕
          </button>

          <h2 className="text-xl font-medium mb-4">Enter transfer amount.</h2>

          <div className="flex justify-end gap-3">
            <form action="" className="space-y-4" onSubmit={saveBankTransfer}>
              <input autoFocus={true} type="text" className="w-full border rounded px-3 py-2" value={transferAmount} onChange={(e) => {
                setTransferAmount(e.target.value)
              }} placeholder="Secret" />
              <button
                className="px-4 py-2 bg-black cursor-pointer text-white rounded"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

    </main>
  );
}
