import { useState } from 'react';

interface DrillProps {
    onProblemSolved: () => void;
}

export default function Drill({ onProblemSolved }: DrillProps) {
    const [num1, setNum1] = useState(() => Math.floor(Math.random() * 9) + 1);
    const [num2, setNum2] = useState(() => Math.floor(Math.random() * 9) + 1);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showNextButton, setShowNextButton] = useState(false);

    // 新しい問題を生成
    const generateNewProblem = () => {
        setNum1(Math.floor(Math.random() * 9) + 1);  // 1-9の範囲
        setNum2(Math.floor(Math.random() * 9) + 1);  // 1-9の範囲
        setUserAnswer('');
        setFeedback('');
        setIsCorrect(null);
        setShowNextButton(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const correctAnswer = num1 + num2;
        const userAnswerNum = parseInt(userAnswer);

        if (isNaN(userAnswerNum)) {
            setFeedback('数字を入力してください');
            setIsCorrect(false);
            return;
        }

        if (userAnswerNum === correctAnswer) {
            setFeedback('正解です！🎉');
            setIsCorrect(true);
            setShowNextButton(true);
            onProblemSolved(); // 正解時にコールバックを呼び出し
        } else {
            setFeedback(`不正解です。正解は ${correctAnswer} です。`);
            setIsCorrect(false);
            setShowNextButton(true);
        }
    };

    const handleNextProblem = () => {
        generateNewProblem();
    };

    return (
        <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    足し算問題
                </h3>

                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-600 mb-6 break-all">
                    {num1} + {num2} = ?
                </div>

                {!showNextButton ? (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="w-24 sm:w-32 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg px-2 sm:px-4 py-3 sm:py-2 focus:outline-none focus:border-indigo-500 min-h-[44px] touch-manipulation"
                                placeholder="?"
                                autoFocus
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg min-h-[44px] min-w-[120px] touch-manipulation transition-colors duration-150"
                        >
                            答える
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="text-xl sm:text-2xl font-bold">
                            答え: {userAnswer}
                        </div>
                        <button
                            onClick={handleNextProblem}
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg min-h-[44px] min-w-[120px] touch-manipulation transition-colors duration-150"
                        >
                            次の問題
                        </button>
                    </div>
                )}

                {feedback && (
                    <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg text-base sm:text-lg font-semibold ${isCorrect
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
}