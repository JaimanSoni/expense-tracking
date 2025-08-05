'use client';
import { useVoice } from '@/context/VoiceContext';

export default function VoiceInput() {
    const { state, dispatch } = useVoice();

    const toggleListening = () => {
        if (state.listening) {
            dispatch({ type: 'STOP_LISTENING' });
        } else {
            dispatch({ type: 'START_LISTENING' });
        }
    };
    const cancelInput = () => {
        dispatch({ type: "SET_TRANSCRIPT", payload: "" });
        dispatch({ type: "STOP_LISTENING" });
        dispatch({ type: "IS_LOADING", payload: false });
    }

    return (
        <div className="p-4 flex gap-[20px] ">
            <button
                onClick={toggleListening}
                className={` ${state.listening ? "bg-red-200 hover:bg-red-300" : "bg-green-200 hover:bg-green-300"} transition-all duration-200 shadow-md  text-black font-semibold w-[100px] h-[60px]  rounded-[10px] text-[15px] cursor-pointer`}
            >
                {state.listening ? 'STOP' : 'RECORD'}
            </button>
            <button onClick={cancelInput} className={`bg-slate-100 transition-all duration-200 shadow-md  text-black font-semibold w-[100px] h-[60px]  rounded-[10px] text-[15px] cursor-pointer`} >
                Cancel
            </button>
        </div >
    );
}
