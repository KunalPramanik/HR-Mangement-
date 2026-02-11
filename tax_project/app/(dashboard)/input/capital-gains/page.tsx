"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function CapitalGainsInputPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Capital Gains & Other Sources</h1>
                <p className="text-slate-500">Income from investments, savings, etc.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Capital Gains</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stcg">Short Term Capital Gains (STCG)</Label>
                            <Input id="stcg" placeholder="₹ 0" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ltcg">Long Term Capital Gains (LTCG)</Label>
                            <Input id="ltcg" placeholder="₹ 0" type="number" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Income from Other Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="savings">Interest from Savings Account</Label>
                        <Input id="savings" placeholder="₹ 0" type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fd">Interest from Fixed Deposits</Label>
                        <Input id="fd" placeholder="₹ 0" type="number" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="other">Any Other Income</Label>
                        <Input id="other" placeholder="₹ 0" type="number" />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button>Save & Continue</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
