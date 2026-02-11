import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Link from "next/link"

export default function LoginPage() {
    return (
        <Card className="glass border-white/40 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">TaxStitch</CardTitle>
                <CardDescription>
                    Enter your email to sign in to your dashboard
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                <div className="flex items-center justify-end">
                    <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 shadow-lg">
                    Sign In
                </Button>
                <div className="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
