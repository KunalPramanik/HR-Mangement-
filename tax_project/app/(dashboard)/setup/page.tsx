"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, Landmark, Briefcase } from "lucide-react"

export default function SetupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [orgType, setOrgType] = useState<string>("")
    const [stateConfig, setStateConfig] = useState({
        stateName: "",
        stateCode: "",
        treasuryFormat: "DEFAULT"
    })

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/setup/organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orgType,
                    stateConfig: orgType === 'STATE_GOVT' ? stateConfig : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert("System Initialized Successfully!");
            router.push("/dashboard");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card className="border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">System Initialization</CardTitle>
                    <CardDescription>
                        Select the Organization Type. This is a <strong>ROOT SWITCH</strong> and cannot be changed once payroll is generated.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Org Type Selection */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Organization Type (LOCKED)</Label>
                        <RadioGroup
                            onValueChange={setOrgType}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <Label
                                htmlFor="central"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-slate-50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-blue-600 ${orgType === 'CENTRAL_GOVT' ? 'border-blue-600 bg-blue-50' : ''} cursor-pointer`}
                            >
                                <RadioGroupItem value="CENTRAL_GOVT" id="central" className="sr-only" />
                                <Landmark className="mb-3 h-6 w-6" />
                                <span className="font-medium">Central Govt</span>
                            </Label>

                            <Label
                                htmlFor="state"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-slate-50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${orgType === 'STATE_GOVT' ? 'border-blue-600 bg-blue-50' : ''} cursor-pointer`}
                            >
                                <RadioGroupItem value="STATE_GOVT" id="state" className="sr-only" />
                                <Building2 className="mb-3 h-6 w-6" />
                                <span className="font-medium">State Govt</span>
                            </Label>

                            <Label
                                htmlFor="private"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-slate-50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${orgType === 'PRIVATE' ? 'border-blue-600 bg-blue-50' : ''} cursor-pointer`}
                            >
                                <RadioGroupItem value="PRIVATE" id="private" className="sr-only" />
                                <Briefcase className="mb-3 h-6 w-6" />
                                <span className="font-medium">Private Org</span>
                            </Label>
                        </RadioGroup>
                    </div>

                    {/* Conditional State Config */}
                    {orgType === 'STATE_GOVT' && (
                        <div className="space-y-4 border p-4 rounded-lg bg-slate-50 animate-in fade-in zoom-in duration-300">
                            <h3 className="font-semibold text-slate-900">State Configuration (Mandatory)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stateName">State Name</Label>
                                    <Input
                                        id="stateName"
                                        placeholder="e.g. Maharashtra"
                                        value={stateConfig.stateName}
                                        onChange={(e) => setStateConfig({ ...stateConfig, stateName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stateCode">State Code</Label>
                                    <Input
                                        id="stateCode"
                                        placeholder="e.g. MH"
                                        value={stateConfig.stateCode}
                                        onChange={(e) => setStateConfig({ ...stateConfig, stateCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={!orgType || isLoading}
                    >
                        {isLoading ? "Initializing..." : "Initialize System"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
