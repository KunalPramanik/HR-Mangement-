import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Link from "next/link"

export default function ForgotPasswordPage() {
    return (
        <Card className="glass border-white/40 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>
                    Enter your email to receive reset instructions
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 shadow-lg">
                    Send Reset Link
                </Button>
                <div className="mt-4 text-center text-sm">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
