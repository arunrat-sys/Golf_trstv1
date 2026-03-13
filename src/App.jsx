import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, User, Clock,
  Monitor, X, Shield, UserCircle, CalendarDays, GraduationCap,
  Phone, MessageCircle, Mail, QrCode, BarChart3, Download,
  CheckCircle2, XCircle, Tag, Users, CreditCard, Award, ShoppingCart
} from 'lucide-react';

const MACHINES = ['Bay 1 (Trackman)', 'Bay 2 (Foresight)', 'Bay 3', 'Bay 4'];
const START_HOUR = 9;
const END_HOUR = 22;
const DAYS_OF_WEEK = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const BASE_PRICE = 1000;
const COACH_PRICE = 1500;

// ข้อมูลแพ็กเกจ (คอร์ส)
const PACKAGES = [
  { id: 'pkg_1', name: 'รายครั้ง (1 ชั่วโมง)', hours: 1, price: 1000, color: 'bg-gray-100', highlight: false },
  { id: 'pkg_10', name: 'แพ็กเกจ 10 ชั่วโมง', hours: 10, price: 9000, color: 'bg-blue-50', highlight: true, save: 'ประหยัด 1,000 บาท' },
  { id: 'pkg_20', name: 'แพ็กเกจ 20 ชั่วโมง', hours: 20, price: 17000, color: 'bg-indigo-50', highlight: true, save: 'ประหยัด 3,000 บาท' },
];

export default function App() {
  const timeSlots = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00 - ${(i + 1).toString().padStart(2, '0')}:00`);
  }

  const getTodayString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  // ---------------- STATE MANAGEMENT ----------------
  const [role, setRole] = useState('admin');
  const [viewMode, setViewMode] = useState('daily');
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [bookings, setBookings] = useState([
    { id: 1, date: getTodayString(), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', email: 'somchai@test.com', lineId: 'somchai123', withCoach: true, status: 'checked-in', price: 2500, discount: 0, usedQuota: false },
    { id: 2, date: getTodayString(), machine: 'Bay 2 (Foresight)', time: '13:00 - 14:00', customerName: 'คุณสมศรี', phone: '0898765432', email: '', lineId: '', withCoach: false, status: 'booked', price: 1000, discount: 0, usedQuota: false },
  ]);

  const [members, setMembers] = useState([
    { phone: '0812345678', name: 'คุณสมชาย', lineId: 'somchai123', email: 'somchai@test.com', remainingHours: 8, totalBought: 10 },
    { phone: '0887776666', name: 'คุณจอห์น', lineId: 'john_doe', email: 'john@mail.com', remainingHours: 15, totalBought: 20 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [pendingBooking, setPendingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pendingPackage, setPendingPackage] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [email, setEmail] = useState('');
  const [withCoach, setWithCoach] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useMemberQuota, setUseMemberQuota] = useState(false);
  const [foundMember, setFoundMember] = useState(null);

  const [pkgPhone, setPkgPhone] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgEmail, setPkgEmail] = useState('');
  const [pkgLineId, setPkgLineId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]);

  // ---------------- LOGIC & HANDLERS ----------------

  const changeDate = (days) => {
    const dateObj = new Date(currentDate);
    dateObj.setDate(dateObj.getDate() + days);
    setCurrentDate(dateObj.toISOString().split('T')[0]);
  };

  const changeMonth = (months) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCalendarMonth(newMonth);
  };

  const getBooking = (machine, time) => {
    return bookings.find(b => b.date === currentDate && b.machine === machine && b.time === time);
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    const member = members.find(m => m.phone === val);
    if (member) {
      setFoundMember(member);
      setCustomerName(member.name);
      setLineId(member.lineId || '');
      setEmail(member.email || '');
      if (member.remainingHours > 0) {
        setUseMemberQuota(true);
      }
    } else {
      setFoundMember(null);
      setUseMemberQuota(false);
    }
  };

  const handlePkgPhoneChange = (val) => {
    setPkgPhone(val);
    const member = members.find(m => m.phone === val);
    if (member) {
      setPkgName(member.name);
      setPkgEmail(member.email || '');
      setPkgLineId(member.lineId || '');
    }
  };

  const applyPromoCode = () => {
    if (useMemberQuota) {
      alert('ไม่สามารถใช้โค้ดส่วนลดร่วมกับการหักชั่วโมงสมาชิกได้');
      return;
    }
    if (promoCode.toUpperCase() === 'GOLF10') {
      const subtotal = BASE_PRICE + (withCoach ? COACH_PRICE : 0);
      setDiscountAmount(subtotal * 0.1);
      alert('ใช้โค้ดส่วนลดสำเร็จ! ลด 10%');
    } else if (promoCode.toUpperCase() === 'SALE500') {
      setDiscountAmount(500);
      alert('ใช้โค้ดส่วนลดสำเร็จ! ลด 500 บาท');
    } else {
      setDiscountAmount(0);
      alert('โค้ดส่วนลดไม่ถูกต้อง');
    }
  };

  const openBookingModal = (machine, time) => {
    setSelectedSlot({ machine, time });
    setSelectedTime(time);
    setCustomerName(role === 'customer' ? 'Walk-in Customer' : '');
    setPhone('');
    setLineId('');
    setEmail('');
    setWithCoach(false);
    setPromoCode('');
    setDiscountAmount(0);
    setUseMemberQuota(false);
    setFoundMember(null);
    setIsModalOpen(true);
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์ติดต่อ');
      return;
    }

    let subtotal = 0;
    if (useMemberQuota) {
      subtotal = withCoach ? COACH_PRICE : 0;
    } else {
      subtotal = BASE_PRICE + (withCoach ? COACH_PRICE : 0);
    }

    const finalPrice = Math.max(0, subtotal - discountAmount);

    const newBooking = {
      id: Date.now(),
      date: currentDate,
      machine: selectedSlot.machine,
      time: selectedTime,
      customerName: customerName.trim(),
      phone: phone.trim(),
      lineId: lineId.trim(),
      email: email.trim(),
      withCoach: withCoach,
      status: 'booked',
      price: finalPrice,
      discount: discountAmount,
      promoCode: promoCode || null,
      usedQuota: useMemberQuota
    };

    if (role === 'customer' && finalPrice > 0) {
      setPendingBooking(newBooking);
      setIsModalOpen(false);
      setIsPaymentModalOpen({ type: 'booking', data: newBooking });
    } else {
      saveBooking(newBooking);
      setIsModalOpen(false);
      if (role === 'customer' && finalPrice === 0) {
        alert('ใช้สิทธิ์สมาชิกเรียบร้อยแล้ว การจองสำเร็จ!');
      }
    }
  };

  const saveBooking = (bookingData) => {
    setBookings([...bookings, bookingData]);

    if (bookingData.usedQuota) {
      setMembers(members.map(m =>
        m.phone === bookingData.phone
          ? { ...m, remainingHours: Math.max(0, m.remainingHours - 1) }
          : m
      ));
    }

    if (bookingData.email) {
      alert(`ส่งคำเชิญลงปฏิทินนัดหมายไปยัง ${bookingData.email} เรียบร้อยแล้ว`);
    }
  };

  // ---------------- PACKAGE PURCHASE LOGIC ----------------
  const openPackageModal = (pkg) => {
    setSelectedPackage(pkg);
    setPkgPhone('');
    setPkgName('');
    setPkgEmail('');
    setPkgLineId('');
    setIsPackageModalOpen(true);
  };

  const handleBuyPackage = (e) => {
    e.preventDefault();
    if (!pkgPhone.trim() || !pkgName.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    const pkgData = {
      type: 'package',
      package: selectedPackage,
      phone: pkgPhone.trim(),
      name: pkgName.trim(),
      email: pkgEmail.trim(),
      lineId: pkgLineId.trim(),
      price: selectedPackage.price
    };

    if (role === 'customer') {
      setIsPackageModalOpen(false);
      setIsPaymentModalOpen({ type: 'package', data: pkgData });
    } else {
      savePackagePurchase(pkgData);
      setIsPackageModalOpen(false);
    }
  };

  const savePackagePurchase = (data) => {
    const existingMember = members.find(m => m.phone === data.phone);
    if (existingMember) {
      setMembers(members.map(m =>
        m.phone === data.phone
          ? { ...m, name: data.name, email: data.email || m.email, lineId: data.lineId || m.lineId, remainingHours: m.remainingHours + data.package.hours, totalBought: m.totalBought + data.package.hours }
          : m
      ));
    } else {
      setMembers([...members, {
        phone: data.phone,
        name: data.name,
        email: data.email,
        lineId: data.lineId,
        remainingHours: data.package.hours,
        totalBought: data.package.hours
      }]);
    }
    alert(`สั่งซื้อ ${data.package.name} สำเร็จ! เพิ่มชั่วโมงเข้าสู่ระบบแล้ว`);
  };

  // ---------------- SHARED PAYMENT CONFIRMATION ----------------
  const handlePaymentConfirm = () => {
    if (isPaymentModalOpen.type === 'booking') {
      saveBooking(isPaymentModalOpen.data);
    } else if (isPaymentModalOpen.type === 'package') {
      savePackagePurchase(isPaymentModalOpen.data);
    }
    setIsPaymentModalOpen(false);
  };

  // ---------------- ADMIN ACTIONS ----------------
  const openManageModal = (booking) => {
    if (role === 'customer') {
      alert('ลูกค้าไม่สามารถแก้ไขการจองได้ กรุณาติดต่อหน้าร้าน');
      return;
    }
    setSelectedBooking(booking);
    setIsManageModalOpen(true);
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    setIsManageModalOpen(false);
  };

  const handleCancelBooking = (booking) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      if (booking.usedQuota && booking.status !== 'checked-in') {
        setMembers(members.map(m =>
          m.phone === booking.phone ? { ...m, remainingHours: m.remainingHours + 1 } : m
        ));
      }
      setBookings(bookings.filter((b) => b.id !== booking.id));
      setIsManageModalOpen(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['รหัส', 'วันที่', 'เวลา', 'เครื่อง', 'ชื่อลูกค้า', 'เบอร์โทร', 'โค้ช', 'สิทธิ์สมาชิก', 'สถานะ', 'ส่วนลด', 'ยอดสุทธิ'];
    const rows = bookings.map(b => [
      b.id, b.date, b.time, b.machine, b.customerName, b.phone,
      b.withCoach ? 'มี' : 'ไม่มี', b.usedQuota ? 'หักชั่วโมง' : 'จ่ายปกติ', b.status, b.discount, b.price
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `golf_bookings_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------- VIEW HELPERS ----------------
  const formatDateDisplay = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatMonthDisplay = (dateObj) => dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });

  const dashboardStats = useMemo(() => {
    const today = getTodayString();
    const todayBookings = bookings.filter(b => b.date === today);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyBookings = bookings.filter(b => b.date.startsWith(thisMonth));

    const getStats = (data) => ({
      total: data.length,
      revenue: data.filter(b => b.status !== 'no-show').reduce((sum, b) => sum + b.price, 0),
      checkedIn: data.filter(b => b.status === 'checked-in').length,
      noShow: data.filter(b => b.status === 'no-show').length,
    });

    return { today: getStats(todayBookings), month: getStats(monthlyBookings) };
  }, [bookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 border-green-300 text-green-800';
      case 'no-show': return 'bg-gray-200 border-gray-300 text-gray-500 opacity-70';
      default: return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100';
    }
  };

  const { year, month, blanks, days } = (() => {
    const y = calendarMonth.getFullYear(), m = calendarMonth.getMonth();
    return {
      year: y, month: m,
      blanks: Array.from({ length: new Date(y, m, 1).getDay() }, (_, i) => i),
      days: Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)
    };
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header - Role Selector */}
        <div className="flex justify-end mb-2">
          <div className="bg-white rounded-full shadow-sm border border-gray-200 p-1 flex items-center">
            <button onClick={() => setRole('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${role === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Shield size={16} /> แอดมิน
            </button>
            <button onClick={() => { setRole('customer'); if(viewMode==='dashboard') setViewMode('daily'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${role === 'customer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              <UserCircle size={16} /> ลูกค้า Walk-in
            </button>
          </div>
        </div>

        {/* Main Header & View Toggles */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg text-white"><Monitor size={24} /></div>
              Golf Simulator Booking
            </h1>
            <p className="text-gray-500 mt-1">
              สถานะ: {role === 'admin' ? <span className="text-indigo-600 font-medium">สิทธิ์การจัดการแบบแอดมิน</span> : <span className="text-blue-600 font-medium">สิทธิ์ลูกค้าทั่วไป</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('daily')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Clock size={18} /> รายวัน
            </button>
            <button onClick={() => setViewMode('monthly')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <CalendarDays size={18} /> ปฏิทิน
            </button>
            <button onClick={() => setViewMode('members')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'members' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Users size={18} /> สมาชิก/คอร์ส
            </button>
            {role === 'admin' && (
              <button onClick={() => setViewMode('dashboard')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <BarChart3 size={18} /> แดชบอร์ด
              </button>
            )}
          </div>
        </div>

        {/* ----------------- DAILY VIEW ----------------- */}
        {viewMode === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center gap-1 font-medium"><ChevronLeft size={20} /> <span className="hidden md:inline">วันก่อนหน้า</span></button>
              <div className="flex items-center gap-2 px-4 text-gray-800 font-bold text-lg"><Calendar size={20} className="text-green-600" /> {formatDateDisplay(currentDate)}</div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center gap-1 font-medium"><span className="hidden md:inline">วันถัดไป</span> <ChevronRight size={20} /></button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 font-semibold text-gray-600 w-32 border-r border-gray-200 text-center sticky left-0 bg-gray-50 z-10"><Clock size={18} className="inline mr-1"/> เวลา</th>
                      {MACHINES.map((machine) => (
                        <th key={machine} className="p-4 font-bold text-gray-800 text-center text-lg"><span className="text-green-700">{machine}</span></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-gray-600 border-r border-gray-200 text-center sticky left-0 bg-white z-10">{time}</td>
                        {MACHINES.map((machine) => {
                          const booking = getBooking(machine, time);
                          return (
                            <td key={`${machine}-${time}`} className="p-2 md:p-4 text-center">
                              {booking ? (
                                <div onClick={() => openManageModal(booking)} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group relative min-h-[70px] cursor-pointer ${role === 'admin' ? getStatusColor(booking.status) : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-80'}`}>
                                  {role === 'admin' ? (
                                    <>
                                      <span className="font-semibold text-sm md:text-base flex items-center gap-1">
                                        {booking.status === 'checked-in' && <CheckCircle2 size={16} className="text-green-600"/>}
                                        {booking.status === 'no-show' && <XCircle size={16} className="text-gray-500"/>}
                                        {booking.customerName}
                                      </span>
                                      <span className="text-xs mt-0.5 opacity-80">{booking.phone}</span>
                                      <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
                                        <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded-md font-medium">
                                          {booking.status === 'booked' ? 'รอโชว์ตัว' : booking.status === 'checked-in' ? 'เช็คอินแล้ว' : 'ไม่มา'}
                                        </span>
                                        {booking.usedQuota && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1"><Award size={10}/> Member</span>}
                                        {booking.withCoach && <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium"><GraduationCap size={12} /> โค้ช</span>}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-gray-600 font-semibold text-sm">ถูกจองแล้ว</span>
                                      {booking.withCoach && <span className="bg-amber-50 text-amber-600 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1"><GraduationCap size={12} /> มีโค้ช</span>}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div onClick={() => openBookingModal(machine, time)} className="bg-green-50 border border-green-200 border-dashed p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-green-100 hover:border-green-400 transition-all text-green-600 hover:text-green-700 group h-full min-h-[70px]">
                                  <span className="text-sm font-medium group-hover:hidden">ว่าง</span>
                                  <span className="text-sm font-bold hidden group-hover:block">+ จอง</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MEMBERS & PACKAGES VIEW ----------------- */}
        {viewMode === 'members' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6 flex items-center gap-2">
                <ShoppingCart size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">เลือกซื้อคอร์ส / แพ็กเกจ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg) => (
                  <div key={pkg.id} className={`rounded-2xl p-6 border-2 flex flex-col h-full ${pkg.highlight ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                    <div className="flex-1">
                      {pkg.highlight && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">ยอดนิยม</span>}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-3xl font-bold text-gray-900">฿{pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2 mb-6 text-gray-600 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> ได้รับเครดิต {pkg.hours} ชั่วโมง</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> ใช้จองเครื่องใดก็ได้</li>
                        {pkg.save && <li className="flex items-center gap-2"><Tag size={16} className="text-amber-500"/> {pkg.save}</li>}
                      </ul>
                    </div>
                    <button onClick={() => openPackageModal(pkg)} className={`w-full py-3 rounded-xl font-bold transition-all ${pkg.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}>
                      เลือกซื้อแพ็กเกจนี้
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {role === 'admin' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-gray-500"/> รายชื่อสมาชิกในระบบ</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200 text-sm text-gray-600">
                        <th className="p-4 font-semibold">ชื่อลูกค้า</th>
                        <th className="p-4 font-semibold">เบอร์ติดต่อ</th>
                        <th className="p-4 font-semibold">Line / Email</th>
                        <th className="p-4 font-semibold text-center">ชั่วโมงคงเหลือ</th>
                        <th className="p-4 font-semibold text-center">ซื้อสะสม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800">{member.name}</td>
                          <td className="p-4 text-gray-600">{member.phone}</td>
                          <td className="p-4 text-gray-500 text-sm">
                            {member.lineId && <div className="flex items-center gap-1"><MessageCircle size={14}/> {member.lineId}</div>}
                            {member.email && <div className="flex items-center gap-1"><Mail size={14}/> {member.email}</div>}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${member.remainingHours > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {member.remainingHours} ชม.
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-500">{member.totalBought} ชม.</td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลสมาชิก</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">ภาพรวมระบบและรายงาน</h2>
              <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"><Download size={18} /> Export CSV</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-blue-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">การจองวันนี้</h3>
                <div className="text-3xl font-bold text-gray-800">{dashboardStats.today.total} <span className="text-lg font-normal text-gray-500">รายการ</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-green-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">มาแสดงตัว (เช็คอิน)</h3>
                <div className="text-3xl font-bold text-green-600">{dashboardStats.today.checkedIn} <span className="text-lg font-normal text-gray-500">คน</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-gray-400">
                <h3 className="text-gray-500 text-sm font-medium mb-1">ไม่มา (No-show)</h3>
                <div className="text-3xl font-bold text-gray-500">{dashboardStats.today.noShow} <span className="text-lg font-normal text-gray-500">คน</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-indigo-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">ยอดรับเงินคาดการณ์ (วันนี้)</h3>
                <div className="text-3xl font-bold text-indigo-600">฿{dashboardStats.today.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly View */}
        {viewMode === 'monthly' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={24} /></button>
              <h2 className="text-2xl font-bold text-gray-800">{formatMonthDisplay(calendarMonth)}</h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={24} /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {DAYS_OF_WEEK.map(day => <div key={day} className="text-center font-bold text-gray-500 pb-2">{day}</div>)}
              {blanks.map(b => <div key={`b-${b}`} className="aspect-square rounded-xl bg-gray-50/50"></div>)}
              {days.map(day => {
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const bookingCount = bookings.filter(b => b.date === dateStr).length;
                return (
                  <button key={day} onClick={() => { setCurrentDate(dateStr); setViewMode('daily'); }} className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all hover:border-green-400 ${dateStr === currentDate ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-100'} ${dateStr === getTodayString() ? 'bg-green-50' : 'bg-white'}`}>
                    <span className={`text-lg md:text-xl font-medium ${dateStr === getTodayString() ? 'text-green-700 font-bold' : 'text-gray-700'}`}>{day}</span>
                    {bookingCount > 0 && <span className="mt-1 bg-indigo-100 text-indigo-700 text-[10px] md:text-xs px-2 py-0.5 rounded-full">{bookingCount} รายการ</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Modal จัดการการจอง (แอดมิน) */}
      {isManageModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">จัดการการจอง</h2>
              <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 text-sm border">
              <p><strong>ชื่อลูกค้า:</strong> {selectedBooking.customerName}</p>
              <p><strong>เบอร์โทร:</strong> {selectedBooking.phone}</p>
              <p><strong>เวลา:</strong> {selectedBooking.time}</p>
              <p><strong>เครื่อง:</strong> {selectedBooking.machine}</p>
              <p><strong>วิธีชำระเงิน:</strong> {selectedBooking.usedQuota ? <span className="text-blue-600 font-bold">หักชั่วโมงสมาชิก</span> : 'จ่ายเงินปกติ'}</p>
              <p className="flex justify-between items-center border-t pt-2 mt-2">
                <strong>ยอดสุทธิ (ลูกค้าชำระ):</strong> <span className="text-lg font-bold text-green-600">฿{selectedBooking.price.toLocaleString()}</span>
              </p>
            </div>

            <div className="space-y-3">
              {selectedBooking.status === 'booked' && (
                <button onClick={() => updateBookingStatus(selectedBooking.id, 'checked-in')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} /> ยืนยันลูกค้ามาถึง (Check-in)
                </button>
              )}
              {selectedBooking.status === 'booked' && (
                <button onClick={() => updateBookingStatus(selectedBooking.id, 'no-show')} className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2">
                  <XCircle size={20} /> ลูกค้าไม่มาแสดงตัว (No-show)
                </button>
              )}
              <button onClick={() => handleCancelBooking(selectedBooking)} className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center justify-center gap-2 mt-4">
                ลบข้อมูลการจองนี้ (คืนสิทธิ์)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal สร้างการจองใหม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{role === 'admin' ? 'เพิ่มการจอง (แอดมิน)' : 'จองเวลาเล่นกอล์ฟ'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-green-50 p-3 rounded-xl mb-4 space-y-2 border border-green-100 text-sm">
              <div className="flex items-center gap-2 text-green-800"><Calendar size={16}/> <strong>วันที่:</strong> {formatDateDisplay(currentDate)}</div>
              <div className="flex items-center gap-2 text-green-800"><Monitor size={16}/> <strong>เครื่อง:</strong> {selectedSlot?.machine}</div>
              <div className="flex items-center gap-2 text-green-800"><Clock size={16}/>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm outline-none font-medium">
                  {timeSlots.map(t => <option key={t} value={t} disabled={getBooking(selectedSlot?.machine, t) && t !== selectedSlot?.time}>{t}</option>)}
                </select>
              </div>
            </div>

            <form onSubmit={handleBook}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><Phone size={16}/> เบอร์ติดต่อ (เช็คสถานะสมาชิกอัตโนมัติ)</label>
                  <input type="tel" className="w-full px-4 py-2.5 rounded-xl border focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="08X-XXX-XXXX" required autoFocus />
                </div>

                {foundMember && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-800 font-bold flex items-center gap-1"><Award size={16}/> ข้อมูลสมาชิก</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${foundMember.remainingHours > 0 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>เหลือ {foundMember.remainingHours} ชม.</span>
                    </div>
                    {foundMember.remainingHours > 0 ? (
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-900 bg-white p-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={useMemberQuota} onChange={(e) => setUseMemberQuota(e.target.checked)} />
                        ใช้สิทธิ์สมาชิกหักชั่วโมง (ฟรีค่าเครื่อง)
                      </label>
                    ) : (
                      <p className="text-red-500 text-xs mt-1">ชั่วโมงแพ็กเกจหมดแล้ว กรุณาซื้อเพิ่มในเมนูสมาชิก</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><User size={16}/> ชื่อลูกค้า</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border focus:border-green-500 outline-none bg-gray-50" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><MessageCircle size={16}/> Line ID</label>
                    <input type="text" className="w-full px-4 py-2 rounded-xl border focus:border-green-500 outline-none bg-gray-50" value={lineId} onChange={(e) => setLineId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><Mail size={16}/> อีเมล</label>
                    <input type="email" className="w-full px-4 py-2 rounded-xl border focus:border-green-500 outline-none bg-gray-50" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {!useMemberQuota && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><Tag size={16}/> โค้ดส่วนลด</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="GOLF10" className="flex-1 px-4 py-2 rounded-xl border outline-none uppercase" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                      <button type="button" onClick={applyPromoCode} className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700">ใช้โค้ด</button>
                    </div>
                    {discountAmount > 0 && <p className="text-green-600 text-xs mt-1 font-medium">ส่วนลด: ฿{discountAmount}</p>}
                  </div>
                )}
              </div>

              <div className="mb-6 flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <input id="withCoach" type="checkbox" className="w-5 h-5 accent-green-600 cursor-pointer" checked={withCoach} onChange={(e) => setWithCoach(e.target.checked)} />
                <label htmlFor="withCoach" className="text-gray-700 text-sm font-bold flex items-center gap-2 cursor-pointer select-none">
                  <GraduationCap size={18} className="text-amber-600" /> รับโค้ชสอน (+฿1,500)
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl text-gray-800">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm">
                  {role === 'admin' ? 'ยืนยันการจอง' : (useMemberQuota && !withCoach ? 'ยืนยันใช้สิทธิ์' : 'ไปชำระเงิน')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal ซื้อแพ็กเกจ/คอร์ส */}
      {isPackageModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={24}/> ซื้อคอร์สเรียน/เล่น</h2>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-center">
              <h3 className="text-blue-900 font-bold text-lg">{selectedPackage.name}</h3>
              <p className="text-blue-700 font-medium mt-1">รับโควต้า: {selectedPackage.hours} ชั่วโมง</p>
              <div className="text-2xl font-bold text-blue-900 mt-2">฿{selectedPackage.price.toLocaleString()}</div>
            </div>

            <form onSubmit={handleBuyPackage} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><Phone size={16}/> เบอร์โทรศัพท์ (ใช้เป็นรหัสอ้างอิง)</label>
                <input type="tel" autoFocus required className="w-full px-4 py-2.5 rounded-xl border focus:border-blue-500 outline-none" value={pkgPhone} onChange={(e) => handlePkgPhoneChange(e.target.value)} placeholder="08X-XXX-XXXX" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1 flex items-center gap-2"><User size={16}/> ชื่อ-นามสกุล</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border focus:border-blue-500 outline-none bg-gray-50" value={pkgName} onChange={(e) => setPkgName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1"><MessageCircle size={14} className="inline"/> Line ID</label>
                  <input type="text" className="w-full px-4 py-2 rounded-xl border focus:border-blue-500 outline-none" value={pkgLineId} onChange={(e) => setPkgLineId(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1"><Mail size={14} className="inline"/> อีเมล</label>
                  <input type="email" className="w-full px-4 py-2 rounded-xl border focus:border-blue-500 outline-none" value={pkgEmail} onChange={(e) => setPkgEmail(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsPackageModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl text-gray-800">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm">
                  {role === 'admin' ? 'เพิ่มเข้าระบบ' : 'ไปชำระเงิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Payment Modal */}
      {isPaymentModalOpen && isPaymentModalOpen.data && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <QrCode size={64} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">สแกนชำระเงิน</h2>

            <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 mb-6 border">
              {isPaymentModalOpen.type === 'package' ? (
                <>
                  <div className="flex justify-between text-sm"><span>แพ็กเกจ:</span><span className="font-semibold">{isPaymentModalOpen.data.package.name}</span></div>
                  <div className="flex justify-between text-sm"><span>ผู้ซื้อ:</span><span className="font-semibold">{isPaymentModalOpen.data.name}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm"><span>เครื่อง:</span><span className="font-semibold">{isPaymentModalOpen.data.machine}</span></div>
                  {isPaymentModalOpen.data.usedQuota ? (
                    <div className="flex justify-between text-sm text-blue-600"><span>สิทธิ์สมาชิก:</span><span className="font-semibold">หัก 1 ชั่วโมง</span></div>
                  ) : (
                    <div className="flex justify-between text-sm"><span>ค่าเครื่อง:</span><span className="font-semibold">฿{BASE_PRICE.toLocaleString()}</span></div>
                  )}
                  {isPaymentModalOpen.data.withCoach && <div className="flex justify-between text-sm"><span>ค่าโค้ช:</span><span className="font-semibold">฿{COACH_PRICE.toLocaleString()}</span></div>}
                  {isPaymentModalOpen.data.discount > 0 && <div className="flex justify-between text-sm text-red-500"><span>ส่วนลด:</span><span className="font-semibold">-฿{isPaymentModalOpen.data.discount.toLocaleString()}</span></div>}
                </>
              )}
              <div className="pt-2 border-t flex justify-between mt-2">
                <span className="font-bold text-gray-800">ยอดรวมสุทธิ:</span>
                <span className="font-bold text-green-600 text-xl">฿{isPaymentModalOpen.data.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl">ยกเลิก</button>
              <button onClick={handlePaymentConfirm} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm">แจ้งชำระเงินแล้ว</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
