import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, id: userId, role } = session.user;

        // RBAC:
        // Employees: See tasks assigned TO them
        // Managers: See tasks assigned TO them OR tasks they assigned BY them
        // Admins: See ALL tasks in tenant? Or scoped? 
        // Let's stick to "My Tasks" view for dashboard + tasks page mostly.

        const query: any = { tenantId: organizationId };

        if (role === 'admin' || role === 'hr') {
            // Admin can see all, or filter? Usually dashboard shows 'My Tasks'. 
            // Let's allow query params to filter.
            const url = new URL(req.url);
            const viewAll = url.searchParams.get('view') === 'all';
            if (!viewAll) {
                query.$or = [{ assignedTo: userId }, { assignedBy: userId }];
            }
        } else {
            query.$or = [{ assignedTo: userId }, { assignedBy: userId }];
        }

        const tasks = await Task.find(query).sort({ dueDate: 1 }).populate('assignedTo', 'firstName lastName').populate('assignedBy', 'firstName lastName');

        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Validation
        if (!data.title || !data.dueDate) {
            return NextResponse.json({ error: 'Title and Due Date are required' }, { status: 400 });
        }

        const task = new Task({
            tenantId: session.user.organizationId,
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo || session.user.id, // Default to self if not specified
            assignedBy: session.user.id,
            dueDate: new Date(data.dueDate),
            priority: data.priority || 'Medium',
            type: data.type || 'Other',
            status: 'Pending'
        });

        await task.save();

        // Log Audit
        await logAudit({
            actionType: 'CREATE',
            module: 'Task',
            performedBy: session.user.id,
            targetDocumentId: task._id.toString(),
            description: `Created task "${task.title}"`,
            tenantId: session.user.organizationId,
            req
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
