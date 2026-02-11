"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function DeductionsInputPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Deductions</h1>
                <p className="text-slate-500">Investments aimed at tax saving (Section 80C, 80D, etc.)</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Section 80C</CardTitle>
                    <CardDescription>Max limit ₹ 1,50,000</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lic">Life Insurance Premium</Label>
                            <Input id="lic" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ppf">PPF / EPF Contribution</Label>
                            <Input id="ppf" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="elss">ELSS Mutual Funds</Label>
                            <Input id="elss" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tuition">Tuition Fees (Children)</Label>
                            <Input id="tuition" placeholder="₹ 0" type="number" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Other Deductions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="80d">Medical Insurance (80D)</Label>
                            <Input id="80d" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nps">NPS Contribution (80CCD(1B))</Label>
                            <Input id="nps" placeholder="Max ₹ 50,000" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="80e">Education Loan Interest (80E)</Label>
                            <Input id="80e" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tta">Savings Interest (80TTA)</Label>
                            <Input id="tta" placeholder="Max ₹ 10,000" type="number" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button>Calculate Tax</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
