'use client';
import { useVoice } from '@/context/VoiceContext';
import VoiceInput from '@/components/VoiceInput';
import Link from 'next/link';
import { API_URLS } from './constants';
import { useState } from 'react';


export default function Home() {
  const { state, dispatch } = useVoice();

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

  return (
    <main className="p-4 md:p-8 max-w-[500px] w-full m-auto min-h-screen flex flex-col items-center justify-between relative">

      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
      <div className='w-full'>
        <div className='m-auto w-fit '>
          <VoiceInput />
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
    </main>
  );
}
