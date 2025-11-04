import { useReducer } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DrillProps {
    difficulty: Difficulty;
    onProblemSolved: () => void;
}

interface DrillState {
    num1: number;
    num2: number;
    choices: number[];
    selectedAnswer: number | null;
    feedback: string;
    isCorrect: boolean | null;
    showNextButton: boolean;
    difficulty: Difficulty;
    prevNum1: number | null;
    prevNum2: number | null;
}

type DrillAction =
    | { type: 'NEW_PROBLEM'; difficulty: Difficulty }
    | { type: 'SELECT_ANSWER'; answer: number; correctAnswer: number; onProblemSolved: () => void }
    | { type: 'RESET_FOR_NEXT' };

const generateNumbers = (diff: Difficulty, prevNum1?: number | null, prevNum2?: number | null) => {
    let num1: number, num2: number;
    let attempts = 0;
    const maxAttempts = 50; // 無限ループを防ぐため

    do {
        switch (diff) {
            case 'easy':
                // 1から3の数字の足し算
                num1 = Math.floor(Math.random() * 3) + 1; // 1-3
                num2 = Math.floor(Math.random() * 3) + 1; // 1-3
                break;
            case 'medium':
                // 答えが9以下の足し算
                do {
                    num1 = Math.floor(Math.random() * 9) + 1; // 1-9
                    num2 = Math.floor(Math.random() * 9) + 1; // 1-9
                } while (num1 + num2 > 9);
                break;
            case 'hard':
                // 1から9までの足し算
                num1 = Math.floor(Math.random() * 9) + 1; // 1-9
                num2 = Math.floor(Math.random() * 9) + 1; // 1-9
                break;
            default:
                num1 = 1;
                num2 = 1;
        }
        attempts++;
    } while (
        prevNum1 !== null &&
        prevNum2 !== null &&
        ((num1 === prevNum1 && num2 === prevNum2) || (num1 === prevNum2 && num2 === prevNum1)) &&
        attempts < maxAttempts
    );

    return { num1, num2 };
};

const generateChoices = (correctAnswer: number) => {
    const choices = [correctAnswer];

    // 正解以外の選択肢を2つ生成
    while (choices.length < 3) {
        const wrongAnswer = correctAnswer + Math.floor(Math.random() * 6) - 3; // -3から+2の範囲で間違った答えを生成
        if (wrongAnswer > 0 && wrongAnswer <= 18 && !choices.includes(wrongAnswer)) {
            choices.push(wrongAnswer);
        }
    }

    // 数字の小さい順に並べる
    return choices.sort((a, b) => a - b);
};

const createNewProblem = (difficulty: Difficulty, prevNum1?: number | null, prevNum2?: number | null): Pick<DrillState, 'num1' | 'num2' | 'choices'> => {
    const newNumbers = generateNumbers(difficulty, prevNum1, prevNum2);
    const correctAnswer = newNumbers.num1 + newNumbers.num2;
    return {
        num1: newNumbers.num1,
        num2: newNumbers.num2,
        choices: generateChoices(correctAnswer)
    };
};

const drillReducer = (state: DrillState, action: DrillAction): DrillState => {
    switch (action.type) {
        case 'NEW_PROBLEM': {
            const newProblem = createNewProblem(action.difficulty, state.prevNum1, state.prevNum2);
            return {
                ...state,
                ...newProblem,
                difficulty: action.difficulty,
                prevNum1: state.num1,
                prevNum2: state.num2,
                selectedAnswer: null,
                feedback: '',
                isCorrect: null,
                showNextButton: false
            };
        }
        case 'SELECT_ANSWER': {
            const isCorrect = action.answer === action.correctAnswer;
            if (isCorrect) {
                action.onProblemSolved();
            }
            return {
                ...state,
                selectedAnswer: action.answer,
                feedback: isCorrect ? '正解です！🎉' : `不正解です。正解は ${action.correctAnswer} です。`,
                isCorrect,
                showNextButton: true
            };
        }
        case 'RESET_FOR_NEXT': {
            const newProblem = createNewProblem(state.difficulty, state.num1, state.num2);
            return {
                ...state,
                ...newProblem,
                prevNum1: state.num1,
                prevNum2: state.num2,
                selectedAnswer: null,
                feedback: '',
                isCorrect: null,
                showNextButton: false
            };
        }
        default:
            return state;
    }
};

export default function Drill({ difficulty, onProblemSolved }: DrillProps) {
    const initialProblem = createNewProblem(difficulty);

    const [state, dispatch] = useReducer(drillReducer, {
        ...initialProblem,
        selectedAnswer: null,
        feedback: '',
        isCorrect: null,
        showNextButton: false,
        difficulty,
        prevNum1: null,
        prevNum2: null
    });

    // 難易度が変更された場合の処理
    if (state.difficulty !== difficulty) {
        dispatch({ type: 'NEW_PROBLEM', difficulty });
    } const handleAnswerSelect = (answer: number) => {
        if (state.showNextButton) return; // 既に回答済みの場合は何もしない

        const correctAnswer = state.num1 + state.num2;
        dispatch({
            type: 'SELECT_ANSWER',
            answer,
            correctAnswer,
            onProblemSolved
        });
    };

    const handleNextProblem = () => {
        dispatch({ type: 'RESET_FOR_NEXT' });
    };

    return (
        <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    足し算問題
                </h3>

                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-600 mb-6 break-all">
                    {state.num1} + {state.num2} = ?
                </div>

                {!state.showNextButton ? (
                    <div className="space-y-4 sm:space-y-6">
                        <p className="text-lg sm:text-xl text-gray-700 mb-4">答えを選んでください：</p>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-xs mx-auto">
                            {state.choices.map((choice: number, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(choice)}
                                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-4 px-6 rounded-lg text-xl sm:text-2xl min-h-[60px] touch-manipulation transition-colors duration-150 shadow-md hover:shadow-lg"
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="text-xl sm:text-2xl font-bold">
                            あなたの答え: {state.selectedAnswer}
                        </div>
                        <button
                            onClick={handleNextProblem}
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg min-h-[44px] min-w-[120px] touch-manipulation transition-colors duration-150"
                        >
                            次の問題
                        </button>
                    </div>
                )}

                {state.feedback && (
                    <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg text-base sm:text-lg font-semibold ${state.isCorrect
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {state.feedback}
                    </div>
                )}
            </div>
        </div>
    );
}