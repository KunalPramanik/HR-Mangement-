"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function HousePropertyInputPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">House Property Income</h1>
                <p className="text-slate-500">Details about your self-occupied or rented property.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Income and Interest on Housing Loan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rent">Gross Rent Received (if rented)</Label>
                            <Input id="rent" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax">Property Tax Paid</Label>
                            <Input id="tax" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interest">Interest on Housing Loan (Self Occupied)</Label>
                            <Input id="interest" placeholder="Max ₹ 2,00,000" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interest_let">Interest on Housing Loan (Let Out)</Label>
                            <Input id="interest_let" placeholder="₹ 0" type="number" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button>Save & Continue</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
