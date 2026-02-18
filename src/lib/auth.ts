import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                emailOrEmployeeId: { label: 'Email or Employee ID', type: 'text' },
                password: { label: 'Password', type: 'password' },
                token: { label: 'Token', type: 'text' },
                type: { label: 'Type', type: 'text' }
            },
            async authorize(credentials) {
                await dbConnect();

                if (credentials?.token && credentials?.type === 'webauthn') {
                    const user = await User.findOne({
                        webauthnLoginToken: credentials.token,
                        webauthnLoginExpires: { $gt: new Date() }
                    });

                    if (!user) throw new Error('Invalid or expired biometric session.');

                    user.webauthnLoginToken = undefined;
                    user.webauthnLoginExpires = undefined;
                    await user.save();

                    return {
                        id: user._id.toString(),
                        organizationId: user.organizationId?.toString(),
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        role: user.role,
                        roleId: user.roleId?.toString(),
                        employeeId: user.employeeId,
                        department: user.department,
                        position: user.position || 'Employee', // Reverted to position
                        profilePicture: user.profilePicture,
                    };
                }

                if (!credentials?.emailOrEmployeeId || !credentials?.password) {
                    throw new Error('Please enter your credentials');
                }

                const user = await User.findOne({
                    $or: [
                        { email: credentials.emailOrEmployeeId.toLowerCase() },
                        { employeeId: credentials.emailOrEmployeeId },
                    ],
                }).select('+password');

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                if (!user.isActive) {
                    throw new Error('Account is inactive. Please contact HR.');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user._id.toString(),
                    organizationId: user.organizationId?.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    roleId: user.roleId?.toString(),
                    employeeId: user.employeeId,
                    department: user.department,
                    position: user.position || 'Employee',
                    profilePicture: user.profilePicture,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.organizationId = user.organizationId;
                token.role = user.role;
                token.roleId = user.roleId;
                token.employeeId = user.employeeId;
                token.department = user.department;
                token.position = user.position;
                token.profilePicture = user.profilePicture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.organizationId = token.organizationId as string;
                session.user.roleId = token.roleId as string;
                session.user.role = token.role as string;
                session.user.employeeId = token.employeeId as string;
                session.user.department = token.department as string;
                session.user.position = token.position as string;
                session.user.profilePicture = token.profilePicture as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-123',
};
