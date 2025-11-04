import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Drill from '@/components/Drill';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [problemsSolved, setProblemsSolved] = useState(0);
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
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 mb-4">
                            一桁の足し算ドリル
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-6">
                            問題を解いて算数の力を伸ばしましょう！正解すると次の問題が表示されます。
                        </p>
                        <Drill onProblemSolved={handleProblemSolved} />
                    </div>
                </div>
            </main>
        </div>
    );
}