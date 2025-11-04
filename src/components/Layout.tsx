import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen-safe bg-gray-50 relative no-horizontal-scroll safe-area-inset">
            <div className="w-full max-w-full overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}