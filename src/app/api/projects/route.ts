import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.name || !data.startDate || !data.endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const project = await Project.create({
            ...data,
            managerId: session.user.id, // Current user is the manager creating it
            teamMembers: data.teamMembers || [] // IDs of employees
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch projects where user is manager OR a team member
        // For simplicity in demo, fetching all or filtering based on query could optionally be done.
        // But rule is: Manager sees "My Projects" (managed), Employee sees "My Projects" (member of).

        let query = {};
        if (session.user.role === 'manager' || session.user.role === 'hr') {
            // Managers see projects they manage. HR see all? Or just simple for now.
            // Let's allow fetching different views via query param if needed, but default:
            query = { $or: [{ managerId: session.user.id }, { teamMembers: session.user.id }] };
        } else {
            query = { teamMembers: session.user.id };
        }

        const projects = await Project.find(query)
            .populate('managerId', 'firstName lastName')
            .populate('teamMembers', 'firstName lastName profilePicture role')
            .sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
