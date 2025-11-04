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
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    足し算問題
                </h3>

                <div className="text-6xl font-bold text-indigo-600 mb-6">
                    {num1} + {num2} = ?
                </div>

                {!showNextButton ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="w-32 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                placeholder="?"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                        >
                            答える
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="text-2xl font-bold">
                            答え: {userAnswer}
                        </div>
                        <button
                            onClick={handleNextProblem}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                        >
                            次の問題
                        </button>
                    </div>
                )}

                {feedback && (
                    <div className={`mt-4 p-4 rounded-lg text-lg font-semibold ${isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
}