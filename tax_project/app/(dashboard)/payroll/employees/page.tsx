"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/Input"

export default function EmployeesListPage() {
    const [employees, setEmployees] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Check if setup is done (simplified check via employees api for now or just fetch)
                const res = await fetch("/api/employees");
                const data = await res.json();
                if (res.ok) {
                    setEmployees(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchEmployees();
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Employee Master</h1>
                    <p className="text-slate-500">Manage all employee records and active states.</p>
                </div>
                <Button asChild>
                    <Link href="/payroll/employees/add">
                        <Plus className="w-4 h-4 mr-2" /> Add Employee
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Active Employees ({employees.length})</CardTitle>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input placeholder="Search by Name or PAN..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading master data...</div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-slate-500 mb-4">No employees found in the master.</p>
                            <Button variant="outline" asChild>
                                <Link href="/payroll/employees/add">Add First Employee</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">PAN</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">DOJ</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {emp.employeeId}
                                            </td>
                                            <td className="px-4 py-3">{emp.fullName}</td>
                                            <td className="px-4 py-3 font-mono text-slate-600">{emp.pan}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{emp.employmentType}</Badge>
                                            </td>
                                            <td className="px-4 py-3">{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                    {emp.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
