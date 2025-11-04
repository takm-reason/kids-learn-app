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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">読み込み中...</p>
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
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">算数ドリル</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                ログイン中: {user.email}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{problemsSolved}</p>
                                <p className="text-sm text-gray-600">今日解いた問題数</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                サインアウト
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            一桁の足し算ドリル
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            問題を解いて算数の力を伸ばしましょう！正解すると次の問題が表示されます。
                        </p>
                        <Drill onProblemSolved={handleProblemSolved} />
                    </div>
                </div>
            </main>
        </div>
    );
}