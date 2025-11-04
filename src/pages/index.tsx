import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Drill from '@/components/Drill';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectionProps {
    onSelectDifficulty: (difficulty: Difficulty) => void;
}

function DifficultySelection({ onSelectDifficulty }: DifficultySelectionProps) {
    const difficulties = [
        {
            id: 'easy' as Difficulty,
            title: '初級',
            description: '1から3の数字の足し算',
            icon: '🌟',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            id: 'medium' as Difficulty,
            title: '中級',
            description: '答えが9以下の足し算',
            icon: '⭐',
            color: 'bg-yellow-500 hover:bg-yellow-600'
        },
        {
            id: 'hard' as Difficulty,
            title: '上級',
            description: '1から9までの足し算',
            icon: '🏆',
            color: 'bg-red-500 hover:bg-red-600'
        }
    ];

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 mb-4 text-center">
                    難易度を選択してください
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
                    あなたのレベルに合った問題を選んで挑戦しましょう！
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {difficulties.map((difficulty) => (
                        <button
                            key={difficulty.id}
                            onClick={() => onSelectDifficulty(difficulty.id)}
                            className={`${difficulty.color} text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}
                        >
                            <div className="text-4xl mb-3">{difficulty.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{difficulty.title}</h3>
                            <p className="text-sm opacity-90">{difficulty.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getDifficultyTitle(difficulty: Difficulty): string {
    switch (difficulty) {
        case 'easy':
            return '初級 - 1から3の数字の足し算';
        case 'medium':
            return '中級 - 答えが9以下の足し算';
        case 'hard':
            return '上級 - 1から9までの足し算';
        default:
            return '足し算ドリル';
    }
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [problemsSolved, setProblemsSolved] = useState(0);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('サインアウトエラー:', error);
        }
    };

    const handleProblemSolved = () => {
        setProblemsSolved(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // リダイレクト中
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-6 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">算数ドリル</h1>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                                ログイン中: {user.email}
                            </p>
                        </div>
                        <div className="flex flex-row sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="text-center flex-1 sm:flex-none">
                                <p className="text-xl sm:text-2xl font-bold text-indigo-600">{problemsSolved}</p>
                                <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">今日解いた問題数</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base whitespace-nowrap min-h-[44px] min-w-[44px]"
                            >
                                サインアウト
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-4xl mx-auto py-4 px-3 sm:py-6 sm:px-4 md:px-6 lg:px-8">
                {!selectedDifficulty ? (
                    <DifficultySelection onSelectDifficulty={setSelectedDifficulty} />
                ) : (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900">
                                    {getDifficultyTitle(selectedDifficulty)}
                                </h2>
                                <button
                                    onClick={() => setSelectedDifficulty(null)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                >
                                    難易度変更
                                </button>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 mb-6">
                                問題を解いて算数の力を伸ばしましょう！正解すると次の問題が表示されます。
                            </p>
                            <Drill difficulty={selectedDifficulty} onProblemSolved={handleProblemSolved} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}