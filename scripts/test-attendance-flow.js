const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mock Schema
const AttendanceSchema = new Schema({
    userId: mongoose.Types.ObjectId,
    date: Date,
    clockIn: Date,
    clockOut: Date,
    workflowStatus: String
}, { timestamps: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

require('dotenv').config({ path: '.env.local' });

async function testAttendanceFlow() {
    console.log('🧪 TESTING ATTENDANCE DATE LOGIC...');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        const userId = new mongoose.Types.ObjectId(); // Mock User ID

        // 1. Simulate Clock In
        const now = new Date();
        console.log(`\n🕒 Current Server Time (new Date()): ${now.toString()}`);
        console.log(`   ISO String: ${now.toISOString()}`);

        const attendance = await Attendance.create({
            userId: userId,
            date: now,
            clockIn: now,
            workflowStatus: 'IN_PROGRESS'
        });
        console.log('✅ Created Mock Attendance Record');
        console.log(`   Stored Date: ${attendance.date.toISOString()}`);

        // 2. Simulate Query (GET Logic)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(`\n🔍 Querying for records >= ${today.toString()}`);
        console.log(`   (ISO: ${today.toISOString()})`);

        const found = await Attendance.findOne({
            userId: userId,
            date: { $gte: today }
        });

        if (found) {
            console.log('\n✅ SUCCESS: Record found!');
            console.log(`   Status: ${found.workflowStatus}`);
        } else {
            console.log('\n❌ FAILURE: Record NOT found by query.');
            console.log('   Reason: The "date" stored is earlier than the "today" query boundary.');
            console.log('   Possible Timezone Issue.');
        }

        // Cleanup
        await Attendance.findByIdAndDelete(attendance._id);
        console.log('\n🧹 Cleanup Complete');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testAttendanceFlow();
