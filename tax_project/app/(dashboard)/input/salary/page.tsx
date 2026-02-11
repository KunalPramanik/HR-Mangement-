"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function SalaryInputPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Salary Breakdown</h1>
                <p className="text-slate-500">Enter your salary components as per your payslip.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Annual Components</CardTitle>
                    <CardDescription>Please enter the annual figures.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="basic">Basic Salary</Label>
                            <Input id="basic" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hra">HRA (House Rent Allowance)</Label>
                            <Input id="hra" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="da">DA (Dearness Allowance)</Label>
                            <Input id="da" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lta">LTA (Leave Travel Allowance)</Label>
                            <Input id="lta" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="special">Special Allowance</Label>
                            <Input id="special" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bonus">Bonus / Incentives</Label>
                            <Input id="bonus" placeholder="₹ 0" type="number" />
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
