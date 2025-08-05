'use client';

import {
    createContext,
    useReducer,
    useContext,
    useEffect,
    useRef,
    ReactNode,
} from 'react';
import Gemini from '@/classes/gemini.class';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API || '';
const gemini = Gemini.init(GEMINI_API_KEY);

// ---------------------------------------------
// Types
// ---------------------------------------------

interface State {
    listening: boolean;
    isLoading: boolean;
    transcript: string;
}

type Action =
    | { type: 'START_LISTENING' }
    | { type: 'STOP_LISTENING' }
    | { type: 'SET_TRANSCRIPT'; payload: string }
    | { type: 'IS_LOADING'; payload: boolean };

interface ISpeechRecognition extends EventTarget {
    start(): void;
    stop(): void;
    abort(): void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}


declare global {
    interface Window {
        webkitSpeechRecognition: {
            new(): ISpeechRecognition;
        };
        SpeechRecognition: {
            new(): ISpeechRecognition;
        };
    }
}

// ---------------------------------------------
// Initial state & reducer
// ---------------------------------------------

const initialState: State = {
    listening: false,
    isLoading: false,
    transcript: '',
};

function voiceReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'START_LISTENING':
            return { ...state, listening: true };
        case 'STOP_LISTENING':
            return { ...state, listening: false };
        case 'SET_TRANSCRIPT':
            return { ...state, transcript: action.payload };
        case 'IS_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

// ---------------------------------------------
// Helpers
// ---------------------------------------------

const getSpeechRecognition = (): { new(): ISpeechRecognition } | undefined => {
    if (typeof window === 'undefined') return undefined;
    return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// ---------------------------------------------
// Context Setup
// ---------------------------------------------

const VoiceContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => { } });

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(voiceReducer, initialState);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            console.warn('SpeechRecognition not supported.');
            return;
        }

        if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onresult = async (event: SpeechRecognitionEvent) => {
                const result = event.results[0][0].transcript;
                console.log('🎤 Voice Input:', result);

                try {
                    dispatch({ type: 'IS_LOADING', payload: true });
                    const processedData = await gemini.processInput(result);

                    dispatch({ type: 'SET_TRANSCRIPT', payload: processedData });
                } catch (err) {
                    console.error('Gemini processing error:', err);
                } finally {
                    dispatch({ type: 'IS_LOADING', payload: false });
                }
            };

            recognition.onend = () => {
                if (state.listening) {
                    recognition.start();
                }
            };

            recognitionRef.current = recognition;
        }

        const recognition = recognitionRef.current;

        if (state.listening) {
            recognition?.start();
        } else {
            recognition?.stop();
        }

        return () => {
            recognition?.stop();
        };
    }, [state.listening]);

    return (
        <VoiceContext.Provider value={{ state, dispatch }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => useContext(VoiceContext);
