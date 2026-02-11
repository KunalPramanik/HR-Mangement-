"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import {
    Plus,
    Trash2,
    Save,
    Landmark,
    ShieldAlert
} from "lucide-react"

export default function ProfessionalTaxSlabsPage() {
    const [slabs, setSlabs] = useState([
        { id: 1, min: 0, max: 7500, amount: 0 },
        { id: 2, min: 7501, max: 10000, amount: 175 },
        { id: 3, min: 10001, max: 999999, amount: 200 }
    ])

    const [stateName, setStateName] = useState("Maharashtra")

    const addSlab = () => {
        const lastSlab = slabs[slabs.length - 1]
        setSlabs([...slabs, {
            id: Date.now(),
            min: lastSlab ? lastSlab.max + 1 : 0,
            max: (lastSlab ? lastSlab.max + 1 : 0) + 5000,
            amount: 0
        }])
    }

    const removeSlab = (id: number) => {
        setSlabs(slabs.filter(s => s.id !== id))
    }

    const updateSlab = (id: number, field: string, value: number) => {
        setSlabs(slabs.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Professional Tax (PT) Config</h1>
                    <p className="text-slate-500">State-wise monthly deduction slabs</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Save className="w-4 h-4" /> Save Configuration
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Monthly Deduction Slabs</CardTitle>
                                <CardDescription>Define income ranges and corresponding PT amounts.</CardDescription>
                            </div>
                            <Button size="sm" onClick={addSlab} className="gap-2">
                                <Plus className="w-4 h-4" /> Add Slab
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 px-2 text-xs font-bold text-slate-500 uppercase">
                                <span>Min Salary (₹)</span>
                                <span>Max Salary (₹)</span>
                                <span>Tax Amount (₹)</span>
                                <span className="text-right">Action</span>
                            </div>
                            {slabs.map((slab) => (
                                <div key={slab.id} className="grid grid-cols-4 gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-100 group">
                                    <Input
                                        type="number"
                                        value={slab.min}
                                        onChange={(e) => updateSlab(slab.id, 'min', parseInt(e.target.value))}
                                        className="h-9 bg-white"
                                    />
                                    <Input
                                        type="number"
                                        value={slab.max}
                                        onChange={(e) => updateSlab(slab.id, 'max', parseInt(e.target.value))}
                                        className="h-9 bg-white"
                                    />
                                    <Input
                                        type="number"
                                        value={slab.amount}
                                        onChange={(e) => updateSlab(slab.id, 'amount', parseInt(e.target.value))}
                                        className="h-9 bg-white"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSlab(slab.id)}
                                            className="text-slate-400 hover:text-red-600 h-9 w-9"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>State Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Effective State</Label>
                                <Input value={stateName} onChange={(e) => setStateName(e.target.value)} />
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex gap-2 text-blue-700 mb-1">
                                    <Landmark className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">System Note</span>
                                </div>
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    Professional tax is a state-level tax. Ensure these slabs match the latest {stateName} Gazette notification.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50 border-amber-200">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-amber-800">
                                <ShieldAlert className="w-5 h-5" />
                                <CardTitle className="text-sm">Audit Compliance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-amber-700">
                                Any change to PT slabs will trigger a system-wide recalculation for the current DRAFT payroll. This action will be logged in the permanent audit trail.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
