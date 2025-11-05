import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push('/');
        } catch (error: unknown) {
            console.error('認証エラー:', error);
            const firebaseError = error as { code?: string };
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                    setError('このメールアドレスのユーザーは見つかりません');
                    break;
                case 'auth/wrong-password':
                    setError('パスワードが正しくありません');
                    break;
                case 'auth/email-already-in-use':
                    setError('このメールアドレスは既に使用されています');
                    break;
                case 'auth/weak-password':
                    setError('パスワードは6文字以上で入力してください');
                    break;
                case 'auth/invalid-email':
                    setError('有効なメールアドレスを入力してください');
                    break;
                default:
                    setError('認証に失敗しました。もう一度お試しください');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-3 sm:py-12 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 sm:space-y-8">
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {isRegistering ? 'アカウント作成' : 'ログイン'}
                    </h2>
                </div>
                <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            メールアドレス
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm min-h-[44px]"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            パスワード
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm min-h-[44px]"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm sm:text-base text-center p-2 bg-red-50 rounded-md border border-red-200">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 min-h-[44px] touch-manipulation"
                        >
                            {loading
                                ? '処理中...'
                                : isRegistering
                                    ? 'アカウント作成'
                                    : 'ログイン'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-indigo-600 hover:text-indigo-500 text-sm sm:text-base p-2 min-h-[44px] touch-manipulation"
                            >
                                {isRegistering
                                    ? 'ログインする'
                                    : 'アカウントを作成する'}
                            </button>
                        </div>

                        <div className="text-center border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-600 mb-3">
                                アカウントなしでも利用できます
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-base transition-colors duration-200 min-h-[44px] touch-manipulation"
                            >
                                ゲストとして続行
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}