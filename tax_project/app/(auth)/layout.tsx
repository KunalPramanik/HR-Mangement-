export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 w-full max-w-md p-4">
                {children}
            </div>
        </div>
    )
}
