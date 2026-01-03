import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Check role-based access
        const allowedHrRoles = ['hr', 'admin', 'director', 'cxo', 'vp'];
        if (path.startsWith('/hr') && !allowedHrRoles.includes(token?.role as string)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        if (path.startsWith('/manager') && token?.role !== 'manager' && token?.role !== 'hr') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        // Check admin access (Directors/CXO also need access to some admin pages)
        const allowedAdminRoles = ['admin', 'director', 'cxo', 'vp', 'hr'];
        if (path.startsWith('/admin') && !allowedAdminRoles.includes(token?.role as string)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        },
        secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-123',
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/employee/:path*',
        '/hr/:path*',
        '/admin/:path*',
        '/manager/:path*',
        '/profile/:path*',
        '/attendance/:path*',
        '/leave/:path*',
        '/payslips/:path*',
        '/benefits/:path*',
        '/onboarding/:path*',
        '/projects/:path*',
        '/goals/:path*',
        '/training/:path*',
        '/settings/:path*',
        '/announcements/:path*',
        '/messages/:path*',
        '/notifications/:path*',
        '/support/:path*',
        '/policies/:path*',
        '/directory/:path*',
    ],
};
