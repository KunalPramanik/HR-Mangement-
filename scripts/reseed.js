// wrapper to just hit seed and print result for report generation
const BASE_URL = 'http://localhost:3000';

async function seedAndReport() {
    console.log('🌱 SEEDING DATABASE...');
    try {
        const res = await fetch(`${BASE_URL}/api/seed`);
        const data = await res.json();

        if (res.ok) {
            console.log('✅ SEED COMPLETE');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error('❌ SEED FAILED', data);
        }
    } catch (e) {
        console.error('❌ Network Error', e);
    }
}

seedAndReport();
