
// logic-verify.js - Unit Test for Geo-Fencing Logic

// 1. Mock Data
const OFFICE_LOC = { latitude: 12.9716, longitude: 77.5946, radiusMeters: 100 }; // Bangalore
const USER_INSIDE = { latitude: 12.9716, longitude: 77.5946 }; // Exact match
const USER_NEAR = { latitude: 12.9719, longitude: 77.5949 }; // Very close
const USER_FAR = { latitude: 13.0000, longitude: 77.0000 }; // Far away

// 2. The Algorithm (Coupled from src/app/api/attendance/route.ts)
function isWithinRange(userLoc, officeLoc) {
    if (!officeLoc || !userLoc) return false;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(officeLoc.latitude);
    const φ2 = toRad(userLoc.latitude);
    const Δφ = toRad(userLoc.latitude - officeLoc.latitude);
    const Δλ = toRad(userLoc.longitude - officeLoc.longitude);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log(`   Distance calculated: ${distance.toFixed(2)} meters`);
    return distance <= officeLoc.radiusMeters;
}

// 3. Run Tests
console.log('🧪 TESTING GEO-FENCING LOGIC...\n');

console.log('Test 1: Exact Location (Expected: Pass)');
const t1 = isWithinRange(USER_INSIDE, OFFICE_LOC);
console.log(t1 ? '✅ PASS' : '❌ FAIL');

console.log('\nTest 2: Near Location (Expected: Pass)');
const t2 = isWithinRange(USER_NEAR, OFFICE_LOC);
console.log(t2 ? '✅ PASS' : '❌ FAIL');

console.log('\nTest 3: Far Location (Expected: Fail)');
const t3 = isWithinRange(USER_FAR, OFFICE_LOC);
console.log(!t3 ? '✅ PASS' : '❌ FAIL');
