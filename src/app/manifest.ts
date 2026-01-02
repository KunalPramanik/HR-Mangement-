import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Mindstar HR Portal',
        short_name: 'Mindstar HR',
        description: 'Employee management portal for Mindstar Technology',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#135bec',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
