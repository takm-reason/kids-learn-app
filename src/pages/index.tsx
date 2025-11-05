import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Drill from '@/components/Drill';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type OperationType = 'addition' | 'subtraction';

interface DifficultySelectionProps {
    onSelectDifficulty: (difficulty: Difficulty, operation: OperationType) => void;
}

function DifficultySelection({ onSelectDifficulty }: DifficultySelectionProps) {
    const additionDifficulties = [
        {
            id: 'easy' as Difficulty,
            title: '初級',
            description: '1から3の数字の足し算',
            icon: '🌟',
            color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
        },
        {
            id: 'medium' as Difficulty,
            title: '中級',
            description: '答えが9以下の足し算',
            icon: '⭐',
            color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
        },
        {
            id: 'hard' as Difficulty,
            title: '上級',
            description: '1から9までの足し算',
            icon: '🏆',
            color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
        }
    ];

    const subtractionDifficulties = [
        {
            id: 'easy' as Difficulty,
            title: '初級',
            description: '1から3の数字を使った引き算',
            icon: '🌟',
            color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
        },
        {
            id: 'medium' as Difficulty,
            title: '中級',
            description: '1から5の数字を使った引き算',
            icon: '⭐',
            color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
        },
        {
            id: 'hard' as Difficulty,
            title: '上級',
            description: '1から9の数字を使った引き算',
            icon: '🏆',
            color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
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

                {/* 足し算セクション */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <span className="text-2xl mr-3">➕</span>
                        <h3 className="text-xl font-bold text-gray-900">足し算</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {additionDifficulties.map((difficulty) => (
                            <button
                                key={`addition-${difficulty.id}`}
                                onClick={() => onSelectDifficulty(difficulty.id, 'addition')}
                                className={`${difficulty.color} border rounded-lg p-6 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md`}
                            >
                                <div className="text-4xl mb-3">{difficulty.icon}</div>
                                <h4 className="text-xl font-bold mb-2">{difficulty.title}</h4>
                                <p className="text-sm opacity-80">{difficulty.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 引き算セクション */}
                <div>
                    <div className="flex items-center justify-center mb-6">
                        <span className="text-2xl mr-3">➖</span>
                        <h3 className="text-xl font-bold text-gray-900">引き算</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {subtractionDifficulties.map((difficulty) => (
                            <button
                                key={`subtraction-${difficulty.id}`}
                                onClick={() => onSelectDifficulty(difficulty.id, 'subtraction')}
                                className={`${difficulty.color} border rounded-lg p-6 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md`}
                            >
                                <div className="text-4xl mb-3">{difficulty.icon}</div>
                                <h4 className="text-xl font-bold mb-2">{difficulty.title}</h4>
                                <p className="text-sm opacity-80">{difficulty.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getDifficultyTitle(difficulty: Difficulty, operation: OperationType): string {
    const operationText = operation === 'addition' ? '足し算' : '引き算';

    switch (difficulty) {
        case 'easy':
            if (operation === 'addition') {
                return '初級 - 1から3の数字の足し算';
            } else {
                return '初級 - 1から3の数字の数字を使った引き算';
            }
        case 'medium':
            if (operation === 'addition') {
                return '中級 - 答えが9以下の足し算';
            } else {
                return '中級 - 1から5の数字を使った引き算';
            }
        case 'hard':
            if (operation === 'addition') {
                return '上級 - 1から9までの足し算';
            } else {
                return '上級 - 1から9の数字を使った引き算';
            }
        default:
            return `${operationText}ドリル`;
    }
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [problemsSolved, setProblemsSolved] = useState(0);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [selectedOperation, setSelectedOperation] = useState<OperationType | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // メニュー外のクリックでメニューを閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen) {
                const target = event.target as Element;
                if (!target.closest('header')) {
                    setIsMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // ログイン画面にリダイレクトせず、現在のページに留まる
        } catch (error) {
            console.error('サインアウトエラー:', error);
        }
    };

    const handleProblemSolved = () => {
        setProblemsSolved(prev => prev + 1);
    };

    const handleSetComplete = (correctCount: number) => {
        // 10問セット完了時の処理（結果画面を表示するためのログのみ）
        console.log(`セット完了: ${correctCount}/10問正解`);
    };

    const handleSelectDifficulty = (difficulty: Difficulty, operation: OperationType) => {
        setSelectedDifficulty(difficulty);
        setSelectedOperation(operation);
    };

    const handleBackToDifficulty = () => {
        // 明示的に難易度選択画面に戻る
        setSelectedDifficulty(null);
        setSelectedOperation(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 md:py-6">
                        {/* ロゴ・タイトル */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">算数ドリル</h1>
                        </div>

                        {/* デスクトップメニュー (md以上で表示) */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-700">{problemsSolved}</p>
                                <p className="text-sm text-gray-600">今日解いた問題数</p>
                            </div>
                            {user ? (
                                <>
                                    <div className="text-sm text-gray-600">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-base"
                                    >
                                        サインアウト
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => router.push('/login')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-base"
                                >
                                    ログイン
                                </button>
                            )}
                        </div>

                        {/* ハンバーガーメニューボタン (md未満で表示) */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 transition-colors duration-200"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">{isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}</span>
                                {/* アイコンの切り替え */}
                                {isMenuOpen ? (
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* モバイルメニュー (md未満で表示) */}
                    <div className={`md:hidden border-t border-gray-200 transition-all duration-300 ease-in-out ${isMenuOpen
                        ? 'max-h-48 opacity-100 py-4'
                        : 'max-h-0 opacity-0 py-0 overflow-hidden'
                        }`}>
                        <div className="space-y-4">
                            {/* ユーザー情報 */}
                            {user ? (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">ログイン中:</span> {user.email}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">ゲストモード</span>
                                </div>
                            )}

                            {/* 統計情報 */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">今日解いた問題数</span>
                                <span className="text-xl font-bold text-gray-700">{problemsSolved}</span>
                            </div>

                            {/* ログイン/サインアウトボタン */}
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded text-base transition-colors duration-200"
                                >
                                    サインアウト
                                </button>
                            ) : (
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded text-base transition-colors duration-200"
                                >
                                    ログイン
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-4xl mx-auto py-4 px-3 sm:py-6 sm:px-4 md:px-6 lg:px-8">
                {!selectedDifficulty || !selectedOperation ? (
                    <DifficultySelection onSelectDifficulty={handleSelectDifficulty} />
                ) : (
                    <>
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                                <div className="mb-4">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 text-center">
                                        {getDifficultyTitle(selectedDifficulty, selectedOperation)}
                                    </h2>
                                </div>
                                <Drill
                                    difficulty={selectedDifficulty}
                                    operation={selectedOperation}
                                    onProblemSolved={handleProblemSolved}
                                    onSetComplete={handleSetComplete}
                                    onBackToDifficulty={handleBackToDifficulty}
                                />
                            </div>
                        </div>

                        {/* 下部のメッセージとボタン */}
                        <div className="mt-4 bg-white rounded-lg shadow p-4">
                            <p className="text-sm sm:text-base text-gray-600 text-center mb-4">
                                問題を解いて算数の力を伸ばしましょう！正解すると次の問題が表示されます。
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        setSelectedDifficulty(null);
                                        setSelectedOperation(null);
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                >
                                    問題選択に戻る
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}