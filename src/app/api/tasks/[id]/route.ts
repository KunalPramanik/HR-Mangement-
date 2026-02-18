import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const task = await Task.findById(id);

        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // Verify Access (Only Owner or Asignee can edit)
        if (task.assignedTo.toString() !== session.user.id && task.assignedBy.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await req.json();

        // Prevent modification of critical fields if not Admin/Owner
        // E.g. DueDate change might require approval? For now allow update.

        const updatedTask = await Task.findByIdAndUpdate(id, data, { new: true });

        // Log Audit
        await logAudit({
            actionType: 'UPDATE',
            module: 'Task',
            performedBy: session.user.id,
            targetDocumentId: task._id.toString(),
            description: `Updated task "${task.title}"`,
            tenantId: session.user.organizationId,
            diff: [{ field: 'status', oldValue: task.status, newValue: data.status }], // Example simplified diff
            req
        });

        return NextResponse.json(updatedTask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const task = await Task.findById(id);

        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // Only Creator or Admin can delete
        if (task.assignedBy.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Task.findByIdAndDelete(id);

        // Log Audit
        await logAudit({
            actionType: 'DELETE',
            module: 'Task',
            performedBy: session.user.id,
            targetDocumentId: task._id.toString(),
            description: `Deleted task "${task.title}"`,
            tenantId: session.user.organizationId,
            req
        });

        return NextResponse.json({ message: 'Task deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
