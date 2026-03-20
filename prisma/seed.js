import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.attachment.deleteMany();
  await prisma.lessonNote.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.bay.deleteMany();
  await prisma.package.deleteMany();
  await prisma.promoCode.deleteMany();
  console.log('Cleared existing data');

  // Users
  await prisma.user.createMany({ data: [
    { name: 'Admin', phone: '0999999999', password: '1234', role: 'admin' },
    { name: 'โค้ชเอ', phone: '0811111111', password: '1234', role: 'coach', coachName: 'โค้ชเอ' },
    { name: 'โค้ชบี', phone: '0822222222', password: '1234', role: 'coach', coachName: 'โค้ชบี' },
    { name: 'โค้ชซี', phone: '0833333333', password: '1234', role: 'coach', coachName: 'โค้ชซี' },
    { name: 'คุณสมชาย', phone: '0812345678', password: '1234', role: 'customer' },
    { name: 'คุณสมศรี', phone: '0898765432', password: '1234', role: 'customer' },
    { name: 'คุณจอห์น', phone: '0887776666', password: '1234', role: 'customer' },
    { name: 'คุณวิภา', phone: '0861112233', password: '1234', role: 'customer' },
    { name: 'คุณธนา', phone: '0892223344', password: '1234', role: 'customer' },
    { name: 'คุณนภา', phone: '0843334455', password: '1234', role: 'customer' },
    { name: 'คุณพิชัย', phone: '0854445566', password: '1234', role: 'customer' },
    { name: 'คุณอรุณ', phone: '0865556677', password: '1234', role: 'customer' },
    { name: 'Mr. Tanaka', phone: '0876667788', password: '1234', role: 'customer' },
    { name: 'Ms. Sarah', phone: '0887778899', password: '1234', role: 'customer' },
  ]});
  console.log('Created 14 users');

  // Coaches
  await prisma.coach.createMany({ data: [
    { name: 'โค้ชเอ', price: 2000, education: 'PGA Teaching Professional', expertise: 'Short Game, Putting', bio: 'ประสบการณ์สอน 10 ปี' },
    { name: 'โค้ชบี', price: 1500, education: 'TPI Certified', expertise: 'Driver, Long Iron', bio: 'อดีตนักกอล์ฟทีมชาติ' },
    { name: 'โค้ชซี', price: 1000, education: 'Golf Academy Thailand', expertise: 'เริ่มต้นเรียนกอล์ฟ', bio: 'เชี่ยวชาญสอนผู้เริ่มต้น' },
  ]});
  console.log('Created 3 coaches');

  // Bays
  await prisma.bay.createMany({ data: [
    { name: 'Bay 1 (Trackman)', type: 'trackman', price: 1500 },
    { name: 'Bay 2 (Foresight)', type: 'foresight', price: 1000 },
    { name: 'Bay 3', price: 1000 },
    { name: 'Bay 4', price: 1000 },
  ]});
  console.log('Created 4 bays');

  // Packages
  await prisma.package.createMany({ data: [
    { name: 'คอร์ส Trackman 1 ชม.', hours: 1, price: 3500, machineType: 'trackman', desc: 'รวมค่าโค้ชแล้ว' },
    { name: 'คอร์ส Trackman 10 ชม.', hours: 10, price: 30000, machineType: 'trackman', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
    { name: 'คอร์ส Foresight 1 ชม.', hours: 1, price: 3000, machineType: 'foresight', desc: 'รวมค่าโค้ชแล้ว' },
    { name: 'คอร์ส Foresight 10 ชม.', hours: 10, price: 25000, machineType: 'foresight', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
  ]});
  console.log('Created 4 packages');

  // Members
  await prisma.member.createMany({ data: [
    { phone: '0812345678', name: 'คุณสมชาย', lineId: 'somchai123', email: 'somchai@test.com', trackmanHours: 5, trackmanBought: 10, trackmanCoach: 'โค้ชเอ', foresightHours: 10, foresightBought: 10, foresightCoach: 'โค้ชบี' },
    { phone: '0898765432', name: 'คุณสมศรี', email: 'somsri@mail.com', foresightHours: 7, foresightBought: 10, foresightCoach: 'โค้ชบี' },
    { phone: '0887776666', name: 'คุณจอห์น', email: 'john@mail.com', trackmanHours: 8, trackmanBought: 20, trackmanCoach: 'โค้ชเอ', foresightHours: 15, foresightBought: 20, foresightCoach: 'โค้ชบี' },
    { phone: '0861112233', name: 'คุณวิภา', email: 'wipa@mail.com', trackmanHours: 6, trackmanBought: 10, trackmanCoach: 'โค้ชเอ' },
    { phone: '0892223344', name: 'คุณธนา', email: 'thana@mail.com', trackmanHours: 3, trackmanBought: 10, trackmanCoach: 'โค้ชเอ' },
    { phone: '0843334455', name: 'คุณนภา', email: 'napa@mail.com', trackmanHours: 4, trackmanBought: 10, trackmanCoach: 'โค้ชเอ', foresightHours: 5, foresightBought: 10, foresightCoach: 'โค้ชบี' },
    { phone: '0854445566', name: 'คุณพิชัย', email: 'pichai@mail.com', trackmanHours: 9, trackmanBought: 10, trackmanCoach: 'โค้ชเอ' },
    { phone: '0865556677', name: 'คุณอรุณ', email: 'arun@mail.com', foresightHours: 8, foresightBought: 10, foresightCoach: 'โค้ชซี' },
    { phone: '0876667788', name: 'Mr. Tanaka', email: 'tanaka@jp.com' },
    { phone: '0887778899', name: 'Ms. Sarah', email: 'sarah@email.com', foresightHours: 5, foresightBought: 10, foresightCoach: 'โค้ชบี' },
  ]});
  console.log('Created 10 members');

  // Helper
  const daysAgo = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const today = daysAgo(0);

  // Bookings
  await prisma.booking.createMany({ data: [
    { date: today, machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3000, usedQuota: true },
    { date: today, machine: 'Bay 2 (Foresight)', time: '13:00 - 14:00', customerName: 'คุณสมศรี', phone: '0898765432', withCoach: true, coachName: 'โค้ชบี', status: 'booked', price: 2500 },
    { date: today, machine: 'Bay 1 (Trackman)', time: '14:00 - 15:00', customerName: 'คุณวิภา', phone: '0861112233', withCoach: true, coachName: 'โค้ชเอ', status: 'booked', price: 3500, usedQuota: true },
    { date: daysAgo(1), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3000, usedQuota: true },
    { date: daysAgo(1), machine: 'Bay 2 (Foresight)', time: '11:00 - 12:00', customerName: 'คุณจอห์น', phone: '0887776666', withCoach: true, coachName: 'โค้ชบี', status: 'checked-in', price: 2500 },
    { date: daysAgo(3), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณนภา', phone: '0843334455', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3500 },
    { date: daysAgo(5), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณวิภา', phone: '0861112233', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3500 },
    { date: daysAgo(5), machine: 'Bay 2 (Foresight)', time: '14:00 - 15:00', customerName: 'คุณจอห์น', phone: '0887776666', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3500 },
    { date: daysAgo(7), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3000 },
    { date: daysAgo(10), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3000 },
  ]});
  console.log('Created 10 bookings');

  // Lesson Notes
  const allBookings = await prisma.booking.findMany({ orderBy: { id: 'asc' } });
  const bk = (idx) => String(allBookings[idx]?.id || 0);

  await prisma.lessonNote.createMany({ data: [
    { bookingId: bk(9), coachName: 'โค้ชเอ', customerPhone: '0812345678', customerName: 'คุณสมชาย', date: daysAgo(10), lessonNumber: 1, topic: 'Grip & Stance พื้นฐาน', homework: 'ฝึกจับกริป 15 นาที/วัน', notes: 'เริ่มต้นจากพื้นฐาน กริปแน่นเกินไป แนะนำให้ผ่อนแรงมือ' },
    { bookingId: bk(8), coachName: 'โค้ชเอ', customerPhone: '0812345678', customerName: 'คุณสมชาย', date: daysAgo(7), lessonNumber: 2, topic: 'Half Swing - Iron 7', homework: 'ฝึก Half Swing 20 สวิง/วัน', notes: 'กริปดีขึ้น เริ่ม takeaway ยังมีปัญหา hip rotation' },
    { bookingId: bk(3), coachName: 'โค้ชเอ', customerPhone: '0812345678', customerName: 'คุณสมชาย', date: daysAgo(1), lessonNumber: 3, topic: 'Full Swing & Distance Control', homework: 'ตี Iron 7, 8, 9 อย่างละ 20 ลูก/วัน', notes: 'Iron 7 = 140 หลา, Iron 8 = 130 หลา ครั้งหน้าสอน Short Game' },
    { bookingId: bk(6), coachName: 'โค้ชเอ', customerPhone: '0861112233', customerName: 'คุณวิภา', date: daysAgo(5), lessonNumber: 1, topic: 'เริ่มต้น - Grip & Posture', homework: 'ฝึกจับกริป 10 นาที/วัน', notes: 'เพิ่งเริ่มเล่น สอนตั้งแต่พื้นฐาน ท่าทางดี' },
    { bookingId: bk(5), coachName: 'โค้ชเอ', customerPhone: '0843334455', customerName: 'คุณนภา', date: daysAgo(3), lessonNumber: 1, topic: 'Putting - อ่านกรีน', homework: 'ฝึก putting 3-6 ฟุต 20 ลูก/วัน', notes: 'สอน aim + green reading แนะนำ cross-hand grip' },
    { bookingId: bk(7), coachName: 'โค้ชเอ', customerPhone: '0887776666', customerName: 'คุณจอห์น', date: daysAgo(5), lessonNumber: 1, topic: 'Wedge Play - Pitch Shot', homework: 'ฝึก pitch ด้วย SW ระยะ 50 หลา', notes: 'สอน clock system (9, 10, 11 นาฬิกา) ลูกค้าตีได้แม่น' },
    { bookingId: bk(4), coachName: 'โค้ชบี', customerPhone: '0887776666', customerName: 'คุณจอห์น', date: daysAgo(1), lessonNumber: 1, topic: 'Driver - Smash Factor', homework: 'ฝึก driver เน้น center hit 20 ลูก/วัน', notes: 'Smash factor 1.42 → 1.47 ระยะเพิ่ม 15 หลา' },
  ]});
  console.log('Created 7 lesson notes');

  // Verify
  const counts = {
    users: await prisma.user.count(),
    coaches: await prisma.coach.count(),
    bays: await prisma.bay.count(),
    bookings: await prisma.booking.count(),
    members: await prisma.member.count(),
    lessonNotes: await prisma.lessonNote.count(),
    packages: await prisma.package.count(),
  };
  console.log('\n✅ Database seeded!');
  console.table(counts);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); pool.end(); });
