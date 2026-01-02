// Native fetch (Node 18+)
const BASE_URL = 'http://localhost:3000';

async function resetSystem() {
    console.log('⚠️  WARNING: INITIATING FULL SYSTEM WIPE...');
    console.log('   Target: ' + BASE_URL);

    try {
        const res = await fetch(`${BASE_URL}/api/admin/system-reset`, {
            method: 'DELETE'
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ SYSTEM RESET SUCCESSFUL');
            console.log('   Details:', JSON.stringify(data.details, null, 2));
        } else {
            console.log(`❌ RESET FAILED (Status: ${res.status})`);
            const text = await res.text();
            console.log('   Response:', text);
        }
    } catch (e) {
        console.error('❌ Network Error:', e.message);
    }
}

resetSystem();
