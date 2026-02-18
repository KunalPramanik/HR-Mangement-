import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            organizationId: string;
            role: string;
            roleId?: string;
            employeeId: string;
            department: string;
            position: string; // Designation
            profilePicture?: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        organizationId: string;
        role: string;
        roleId?: string;
        employeeId: string;
        department: string;
        position: string;
        profilePicture?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        organizationId: string;
        role: string;
        roleId?: string;
        employeeId: string;
        department: string;
        position: string;
        profilePicture?: string;
    }
}
