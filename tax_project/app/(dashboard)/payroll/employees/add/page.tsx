"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddEmployeePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        pan: "",
        dateOfJoining: "",
        employmentType: "PERMANENT",
        payStructure: {
            type: "CTC_SLAB",
            value: ""
        },
        bankDetails: {
            accountNumber: "",
            ifscCode: "",
            bankName: ""
        },
        officeDetails: {
            department: "",
            designation: ""
        }
    })

    const handleChange = (section: string, field: string, value: string) => {
        if (section === "root") {
            setFormData(prev => ({ ...prev, [field]: value }))
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [field]: value
                }
            }))
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    // Ensure date is properly formatted if needed, though input type=date sends yyyy-mm-dd which is good
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert(`Employee Added Successfully! ID: ${data.data.employeeId}`);
            router.push("/payroll/employees");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/payroll/employees"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
                </Button>
                <h1 className="text-2xl font-bold">Add New Employee</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Master</CardTitle>
                    <CardDescription>
                        <strong>System Rule:</strong> PAN is mandatory for tax processing. Invalid PAN will block payroll.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Personal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="As per Aadhaar/PAN"
                                value={formData.fullName}
                                onChange={(e) => handleChange("root", "fullName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pan">PAN Number (Permanent Account Number)</Label>
                            <Input
                                id="pan"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                className="uppercase font-mono"
                                value={formData.pan}
                                onChange={(e) => handleChange("root", "pan", e.target.value.toUpperCase())}
                            />
                            <p className="text-xs text-slate-500">Format: 5 Letters, 4 Digits, 1 Letter</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doj">Date of Joining</Label>
                            <Input
                                id="doj"
                                type="date"
                                value={formData.dateOfJoining}
                                onChange={(e) => handleChange("root", "dateOfJoining", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Employment Type</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.employmentType}
                                onChange={(e) => handleChange("root", "employmentType", e.target.value)}
                            >
                                <option value="PERMANENT">Permanent</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERN">Intern</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-md font-semibold mb-3">Office & Pay Structure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dept">Department</Label>
                                <Input
                                    id="dept"
                                    value={formData.officeDetails.department}
                                    onChange={(e) => handleChange("officeDetails", "department", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payVal">Basic Pay / CTC</Label>
                                <Input
                                    id="payVal"
                                    type="number"
                                    placeholder="Amount"
                                    value={formData.payStructure.value}
                                    onChange={(e) => handleChange("payStructure", "value", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-md font-semibold mb-3">Bank Details (For Output Files)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="acNo">Account Number</Label>
                                <Input
                                    id="acNo"
                                    // Actually user role says "Single Authorized Operator", so visible is fine.
                                    type="text"
                                    value={formData.bankDetails.accountNumber}
                                    onChange={(e) => handleChange("bankDetails", "accountNumber", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc">IFSC Code</Label>
                                <Input
                                    id="ifsc"
                                    className="uppercase"
                                    maxLength={11}
                                    value={formData.bankDetails.ifscCode}
                                    onChange={(e) => handleChange("bankDetails", "ifscCode", e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                            {isLoading ? "Validating & Saving..." : "Create Employee Record"}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
