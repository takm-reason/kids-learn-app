import { useReducer } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DrillProps {
    difficulty: Difficulty;
    onProblemSolved: () => void;
    onSetComplete: (correctCount: number) => void;
    onBackToDifficulty: () => void;
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
    currentProblem: number;
    correctAnswers: number;
    results: boolean[];
    showResults: boolean;
}

type DrillAction =
    | { type: 'NEW_PROBLEM'; difficulty: Difficulty }
    | { type: 'SELECT_ANSWER'; answer: number; correctAnswer: number; onProblemSolved: () => void }
    | { type: 'RESET_FOR_NEXT' }
    | { type: 'RESTART_SET' }
    | { type: 'SHOW_RESULTS'; onSetComplete: (correctCount: number) => void };

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
                showNextButton: false,
                currentProblem: 1,
                correctAnswers: 0,
                results: [],
                showResults: false
            };
        }
        case 'SELECT_ANSWER': {
            const isCorrect = action.answer === action.correctAnswer;
            if (isCorrect) {
                action.onProblemSolved();
            }

            const newResults = [...state.results, isCorrect];
            const newCorrectAnswers = state.correctAnswers + (isCorrect ? 1 : 0);

            // 10問目の場合は答えを表示してから結果表示ボタンを表示
            if (state.currentProblem === 10) {
                return {
                    ...state,
                    selectedAnswer: action.answer,
                    feedback: isCorrect ? '正解です！🎉' : `不正解です。正解は ${action.correctAnswer} です。`,
                    isCorrect,
                    showNextButton: true, // 「結果を見る」ボタンを表示
                    results: newResults,
                    correctAnswers: newCorrectAnswers,
                    showResults: false // まだ結果画面は表示しない
                };
            }

            return {
                ...state,
                selectedAnswer: action.answer,
                feedback: isCorrect ? '正解です！🎉' : `不正解です。正解は ${action.correctAnswer} です。`,
                isCorrect,
                showNextButton: true,
                results: newResults,
                correctAnswers: newCorrectAnswers
            };
        }
        case 'RESET_FOR_NEXT': {
            // 10問目の場合は結果表示に移行（onSetCompleteは呼ばない）
            if (state.currentProblem === 10) {
                return {
                    ...state,
                    showResults: true,
                    showNextButton: false
                };
            }

            const newProblem = createNewProblem(state.difficulty, state.num1, state.num2);
            return {
                ...state,
                ...newProblem,
                prevNum1: state.num1,
                prevNum2: state.num2,
                selectedAnswer: null,
                feedback: '',
                isCorrect: null,
                showNextButton: false,
                currentProblem: state.currentProblem + 1
            };
        }
        case 'RESTART_SET': {
            const newProblem = createNewProblem(state.difficulty);
            return {
                ...state,
                ...newProblem,
                selectedAnswer: null,
                feedback: '',
                isCorrect: null,
                showNextButton: false,
                currentProblem: 1,
                correctAnswers: 0,
                results: [],
                showResults: false,
                prevNum1: null,
                prevNum2: null
            };
        }
        case 'SHOW_RESULTS': {
            action.onSetComplete(state.correctAnswers);
            return {
                ...state,
                showResults: true,
                showNextButton: false
            };
        }
        default:
            return state;
    }
};

export default function Drill({ difficulty, onProblemSolved, onSetComplete, onBackToDifficulty }: DrillProps) {
    const initialProblem = createNewProblem(difficulty);

    const [state, dispatch] = useReducer(drillReducer, {
        ...initialProblem,
        selectedAnswer: null,
        feedback: '',
        isCorrect: null,
        showNextButton: false,
        difficulty,
        prevNum1: null,
        prevNum2: null,
        currentProblem: 1,
        correctAnswers: 0,
        results: [],
        showResults: false
    });

    // 難易度が変更された場合の処理
    if (state.difficulty !== difficulty) {
        dispatch({ type: 'NEW_PROBLEM', difficulty });
    }

    const handleAnswerSelect = (answer: number) => {
        if (state.showNextButton || state.showResults) return; // 既に回答済みまたは結果表示中の場合は何もしない

        const correctAnswer = state.num1 + state.num2;
        dispatch({
            type: 'SELECT_ANSWER',
            answer,
            correctAnswer,
            onProblemSolved
        });
    };

    const handleNextProblem = () => {
        // 10問目の場合は結果表示
        if (state.currentProblem === 10) {
            dispatch({ type: 'SHOW_RESULTS', onSetComplete });
        } else {
            dispatch({ type: 'RESET_FOR_NEXT' });
        }
    };

    const handleRestartSet = () => {
        dispatch({ type: 'RESTART_SET' });
    };

    if (state.showResults) {
        // 正解率に応じたメッセージとアイコンを決定
        const percentage = Math.round((state.correctAnswers / 10) * 100);
        let resultMessage = '';
        let resultIcon = '';
        let resultColor = '';

        if (percentage === 100) {
            resultMessage = 'パーフェクト！素晴らしいです！';
            resultIcon = '🏆';
            resultColor = 'text-yellow-600';
        } else if (percentage >= 80) {
            resultMessage = 'とても良くできました！';
            resultIcon = '🌟';
            resultColor = 'text-green-600';
        } else if (percentage >= 60) {
            resultMessage = 'よく頑張りました！';
            resultIcon = '👍';
            resultColor = 'text-blue-600';
        } else if (percentage >= 40) {
            resultMessage = 'もう少し練習してみましょう！';
            resultIcon = '💪';
            resultColor = 'text-orange-600';
        } else {
            resultMessage = '諦めずに頑張りましょう！';
            resultIcon = '📚';
            resultColor = 'text-red-600';
        }

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    {/* メインタイトル */}
                    <div className="text-6xl mb-4">{resultIcon}</div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                        結果発表
                    </h3>
                    <p className={`text-xl sm:text-2xl font-semibold mb-6 ${resultColor}`}>
                        {resultMessage}
                    </p>

                    {/* スコア表示 */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
                        <div className="text-2xl sm:text-3xl font-bold mb-2">あなたのスコア</div>
                        <div className="text-5xl sm:text-6xl font-bold mb-2">
                            {state.correctAnswers} / 10
                        </div>
                        <div className="text-xl sm:text-2xl">
                            正解率: {percentage}%
                        </div>
                    </div>

                    {/* 詳細結果 */}
                    <div className="mb-8">
                        <div className="text-xl font-semibold text-gray-700 mb-4">問題別結果</div>
                        <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto mb-4">
                            {state.results.map((isCorrect, index) => (
                                <div
                                    key={index}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform hover:scale-110 ${isCorrect
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>

                        {/* 統計表示 */}
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="bg-green-100 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{state.correctAnswers}</div>
                                <div className="text-green-700">正解</div>
                            </div>
                            <div className="bg-red-100 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{10 - state.correctAnswers}</div>
                                <div className="text-red-700">不正解</div>
                            </div>
                        </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleRestartSet}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg text-lg min-h-[52px] transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                            🔄 もう一度挑戦
                        </button>
                        <button
                            onClick={onBackToDifficulty}
                            className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg text-lg min-h-[52px] transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                            🏠 難易度選択に戻る
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="text-center mb-4 sm:mb-6">
                {/* 進捗表示 */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">問題 {state.currentProblem} / 10</span>
                        <span className="text-sm font-medium text-gray-700">正解数: {state.correctAnswers}</span>
                    </div>

                </div>

                {/* 全10問の進捗表示 */}
                <div className="mb-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                        {Array.from({ length: 10 }, (_, index) => {
                            const problemIndex = index;
                            const isAnswered = problemIndex < state.results.length;
                            const isCurrent = problemIndex === state.currentProblem - 1;

                            if (isAnswered) {
                                // 解答済みの問題
                                const isCorrect = state.results[problemIndex];
                                return (
                                    <div
                                        key={index}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    >
                                        {isCorrect ? '○' : '×'}
                                    </div>
                                );
                            } else if (isCurrent) {
                                // 現在の問題
                                return (
                                    <div
                                        key={index}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white text-sm font-bold shadow-md animate-pulse"
                                    >
                                        {problemIndex + 1}
                                    </div>
                                );
                            } else {
                                // まだ解いていない問題
                                return (
                                    <div
                                        key={index}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-600 text-sm font-bold"
                                    >
                                        {problemIndex + 1}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

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
                            {state.currentProblem === 10 ? '結果を見る' : '次の問題'}
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