import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const project = await Project.findById(params.id)
            .populate('managerId', 'firstName lastName')
            .populate('teamMembers', 'firstName lastName profilePicture role')
            .populate('tasks.assignedTo', 'firstName lastName');

        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        return NextResponse.json(project);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();

        // Validation: Verify user is manager or admin, or allowing updates. 
        // For tasks, employees might need to update "status" of their task.
        // Simplified Logic: Allow update if Manager, or if updating 'tasks' and member of team.

        const project = await Project.findByIdAndUpdate(params.id, data, { new: true })
            .populate('managerId', 'firstName lastName')
            .populate('teamMembers', 'firstName lastName profilePicture role')
            .populate('tasks.assignedTo', 'firstName lastName');

        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        return NextResponse.json(project);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only Manager (who owns it) or Admin
        // Retrieve project first to check owner
        const existing = await Project.findById(params.id);
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (session?.user.id !== existing.managerId.toString() && session?.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Project.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Project deleted' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
