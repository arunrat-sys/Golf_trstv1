import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, User, Clock,
  Monitor, X, Shield, UserCircle, CalendarDays, GraduationCap,
  Phone, MessageCircle, Mail, QrCode, BarChart3, Download,
  CheckCircle2, XCircle, Tag, Users, CreditCard, Award, ShoppingCart,
  FileText, Filter, TrendingUp, LogOut, LogIn, UserPlus, Eye, EyeOff, Lock
} from 'lucide-react';

const MACHINES = ['Bay 1 (Trackman)', 'Bay 2 (Foresight)', 'Bay 3', 'Bay 4'];
const START_HOUR = 9;
const END_HOUR = 22;
const DAYS_OF_WEEK = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const COACHES_DATA = [
  { name: 'โค้ชเอ', price: 2000 },
  { name: 'โค้ชบี', price: 1500 },
  { name: 'โค้ชซี', price: 1000 },
];

const COACHES = COACHES_DATA.map(c => c.name);

const getCoachPrice = (coachName) => {
  const coach = COACHES_DATA.find(c => c.name === coachName);
  return coach ? coach.price : 1500;
};

const TRACKMAN_PRICE = 1500;
const FORESIGHT_PRICE = 1000;

const PACKAGES = [
  // Trackman course packages (coach included)
  { id: 'pkg_tm_1', name: 'คอร์ส Trackman 1 ชม.', hours: 1, price: 3500, machineType: 'trackman', highlight: false, desc: 'รวมค่าโค้ชแล้ว' },
  { id: 'pkg_tm_10', name: 'คอร์ส Trackman 10 ชม.', hours: 10, price: 30000, machineType: 'trackman', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
  { id: 'pkg_tm_20', name: 'คอร์ส Trackman 20 ชม.', hours: 20, price: 55000, machineType: 'trackman', highlight: true, save: 'ประหยัด 15,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
  // Foresight course packages (coach included)
  { id: 'pkg_fs_1', name: 'คอร์ส Foresight 1 ชม.', hours: 1, price: 3000, machineType: 'foresight', highlight: false, desc: 'รวมค่าโค้ชแล้ว' },
  { id: 'pkg_fs_10', name: 'คอร์ส Foresight 10 ชม.', hours: 10, price: 25000, machineType: 'foresight', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
  { id: 'pkg_fs_20', name: 'คอร์ส Foresight 20 ชม.', hours: 20, price: 45000, machineType: 'foresight', highlight: true, save: 'ประหยัด 15,000 บาท', desc: 'รวมค่าโค้ชแล้ว' },
];

const getMachineType = (machineName) => {
  if (machineName.toLowerCase().includes('trackman')) return 'trackman';
  if (machineName.toLowerCase().includes('foresight')) return 'foresight';
  return null;
};

const getBasePrice = (machineName) => {
  const type = getMachineType(machineName);
  if (type === 'trackman') return TRACKMAN_PRICE;
  return FORESIGHT_PRICE; // foresight and generic bays default to foresight price
};

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

  // ---------------- AUTH STATE ----------------
  const [appUsers, setAppUsers] = useState([
    { id: 1, name: 'Admin', phone: '0999999999', password: '1234', role: 'admin', coachName: '' },
    { id: 2, name: 'โค้ชเอ', phone: '0811111111', password: '1234', role: 'coach', coachName: 'โค้ชเอ' },
    { id: 3, name: 'โค้ชบี', phone: '0822222222', password: '1234', role: 'coach', coachName: 'โค้ชบี' },
    { id: 4, name: 'โค้ชซี', phone: '0833333333', password: '1234', role: 'coach', coachName: 'โค้ชซี' },
    { id: 5, name: 'คุณสมชาย', phone: '0812345678', password: '1234', role: 'customer', coachName: '' },
  ]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('customer');
  const [authCoachName, setAuthCoachName] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const role = currentUser?.role || 'customer';
  const selectedRoleCoach = currentUser?.coachName || COACHES[0];

  // ---------------- STATE MANAGEMENT ----------------
  const [viewMode, setViewMode] = useState('daily');
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [bookings, setBookings] = useState([
    { id: 1, date: getTodayString(), machine: 'Bay 1 (Trackman)', time: '10:00 - 11:00', customerName: 'คุณสมชาย', phone: '0812345678', email: 'somchai@test.com', lineId: 'somchai123', withCoach: true, coachName: 'โค้ชเอ', status: 'checked-in', price: 3000, discount: 0, usedQuota: false },
    { id: 2, date: getTodayString(), machine: 'Bay 2 (Foresight)', time: '13:00 - 14:00', customerName: 'คุณสมศรี', phone: '0898765432', email: '', lineId: '', withCoach: false, coachName: '', status: 'booked', price: 1000, discount: 0, usedQuota: false },
  ]);

  const [members, setMembers] = useState([
    { phone: '0812345678', name: 'คุณสมชาย', lineId: 'somchai123', email: 'somchai@test.com', trackmanHours: 5, trackmanBought: 10, trackmanCoach: 'โค้ชเอ', foresightHours: 10, foresightBought: 10, foresightCoach: 'โค้ชบี' },
    { phone: '0887776666', name: 'คุณจอห์น', lineId: 'john_doe', email: 'john@mail.com', trackmanHours: 8, trackmanBought: 20, trackmanCoach: 'โค้ชบี', foresightHours: 15, foresightBought: 20, foresightCoach: 'โค้ชซี' },
  ]);

  // Report date range
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  });

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
  const [selectedCoach, setSelectedCoach] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useMemberQuota, setUseMemberQuota] = useState(false);
  const [foundMember, setFoundMember] = useState(null);

  const [manageCoach, setManageCoach] = useState('');

  const [pkgPhone, setPkgPhone] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgEmail, setPkgEmail] = useState('');
  const [pkgLineId, setPkgLineId] = useState('');
  const [pkgCoach, setPkgCoach] = useState('');
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

  // No-show bookings release the slot (not returned by getBooking)
  const getBooking = (machine, time) => {
    return bookings.find(b => b.date === currentDate && b.machine === machine && b.time === time && b.status !== 'no-show');
  };

  // Check if coach is already booked at a specific date+time
  const isCoachBusy = (coachName, date, time, excludeBookingId = null) => {
    return bookings.some(b =>
      b.withCoach && b.coachName === coachName && b.date === date && b.time === time &&
      b.status !== 'no-show' && b.id !== excludeBookingId
    );
  };

  // Get list of available coaches for a given date+time
  const getAvailableCoaches = (date, time, excludeBookingId = null) => {
    return COACHES_DATA.map(c => ({
      ...c,
      busy: isCoachBusy(c.name, date, time, excludeBookingId),
    }));
  };

  // Helper: get member hours for a specific machine type
  const getMemberHoursForMachine = (member, machineName) => {
    const type = getMachineType(machineName);
    if (type === 'trackman') return member.trackmanHours;
    if (type === 'foresight') return member.foresightHours;
    return 0;
  };

  // Helper: get member's assigned coach for a machine type
  const getMemberCoachForMachine = (member, machineName) => {
    const type = getMachineType(machineName);
    if (type === 'trackman') return member.trackmanCoach || '';
    if (type === 'foresight') return member.foresightCoach || '';
    return '';
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    const member = members.find(m => m.phone === val);
    if (member) {
      setFoundMember(member);
      setCustomerName(member.name);
      setLineId(member.lineId || '');
      setEmail(member.email || '');
      // Auto-check quota if member has hours for this machine type
      if (selectedSlot) {
        const machineType = getMachineType(selectedSlot.machine);
        if (machineType && getMemberHoursForMachine(member, selectedSlot.machine) > 0) {
          setUseMemberQuota(true);
        } else {
          setUseMemberQuota(false);
        }
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
    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : FORESIGHT_PRICE;
    const coachP = withCoach && selectedCoach ? getCoachPrice(selectedCoach) : 0;
    if (promoCode.toUpperCase() === 'GOLF10') {
      const subtotal = basePrice + coachP;
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
    setSelectedCoach('');
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

    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : FORESIGHT_PRICE;

    // Validate member quota usage
    if (useMemberQuota && foundMember && selectedSlot) {
      const machineType = getMachineType(selectedSlot.machine);
      if (!machineType) {
        alert('Bay นี้ไม่สามารถใช้สิทธิ์สมาชิกได้ (ไม่มีประเภทเครื่อง)');
        setUseMemberQuota(false);
        return;
      }
      const availableHours = getMemberHoursForMachine(foundMember, selectedSlot.machine);
      if (availableHours <= 0) {
        alert(`ชั่วโมง ${machineType === 'trackman' ? 'Trackman' : 'Foresight'} หมดแล้ว กรุณาซื้อเพิ่มในเมนูสมาชิก`);
        setUseMemberQuota(false);
        return;
      }
    }

    // Determine coach based on booking type
    let bookingCoach = '';
    let coachPrice = 0;

    if (useMemberQuota && foundMember && selectedSlot) {
      // Course booking: coach included from package, no extra cost
      bookingCoach = getMemberCoachForMachine(foundMember, selectedSlot.machine);
      coachPrice = 0;
      // Validate coach time conflict
      if (bookingCoach && isCoachBusy(bookingCoach, currentDate, selectedTime)) {
        alert(`${bookingCoach} (โค้ชประจำคอร์ส) ไม่ว่างในเวลานี้ กรุณาเลือกเวลาอื่น`);
        return;
      }
    } else if (withCoach && selectedCoach) {
      // Bay booking with optional coach add-on
      bookingCoach = selectedCoach;
      coachPrice = getCoachPrice(selectedCoach);
      if (isCoachBusy(selectedCoach, currentDate, selectedTime)) {
        alert(`${selectedCoach} ไม่ว่างในเวลานี้ กรุณาเลือกโค้ชท่านอื่นหรือเปลี่ยนเวลา`);
        return;
      }
    }

    let subtotal = 0;
    if (useMemberQuota) {
      subtotal = 0; // course: everything included
    } else {
      subtotal = basePrice + coachPrice;
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
      withCoach: !!bookingCoach,
      coachName: bookingCoach,
      coachPrice: coachPrice,
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
      const machineType = getMachineType(bookingData.machine);
      setMembers(members.map(m => {
        if (m.phone === bookingData.phone) {
          if (machineType === 'trackman') {
            return { ...m, trackmanHours: Math.max(0, m.trackmanHours - 1) };
          } else if (machineType === 'foresight') {
            return { ...m, foresightHours: Math.max(0, m.foresightHours - 1) };
          }
        }
        return m;
      }));
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
    setPkgCoach('');
    setIsPackageModalOpen(true);
  };

  const handleBuyPackage = (e) => {
    e.preventDefault();
    if (!pkgPhone.trim() || !pkgName.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }
    if (!pkgCoach) {
      alert('กรุณาเลือกโค้ชผู้สอน');
      return;
    }

    const pkgData = {
      type: 'package',
      package: selectedPackage,
      phone: pkgPhone.trim(),
      name: pkgName.trim(),
      email: pkgEmail.trim(),
      lineId: pkgLineId.trim(),
      coachName: pkgCoach,
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
    const pkg = data.package;
    const machineType = pkg.machineType;
    const coachName = data.coachName || '';
    const existingMember = members.find(m => m.phone === data.phone);

    if (existingMember) {
      setMembers(members.map(m => {
        if (m.phone === data.phone) {
          const updated = { ...m, name: data.name, email: data.email || m.email, lineId: data.lineId || m.lineId };
          if (machineType === 'trackman') {
            updated.trackmanHours = m.trackmanHours + pkg.hours;
            updated.trackmanBought = m.trackmanBought + pkg.hours;
            updated.trackmanCoach = coachName;
          } else {
            updated.foresightHours = m.foresightHours + pkg.hours;
            updated.foresightBought = m.foresightBought + pkg.hours;
            updated.foresightCoach = coachName;
          }
          return updated;
        }
        return m;
      }));
    } else {
      const newMember = {
        phone: data.phone,
        name: data.name,
        email: data.email,
        lineId: data.lineId,
        trackmanHours: 0, trackmanBought: 0, trackmanCoach: '',
        foresightHours: 0, foresightBought: 0, foresightCoach: '',
      };
      if (machineType === 'trackman') {
        newMember.trackmanHours = pkg.hours;
        newMember.trackmanBought = pkg.hours;
        newMember.trackmanCoach = coachName;
      } else {
        newMember.foresightHours = pkg.hours;
        newMember.foresightBought = pkg.hours;
        newMember.foresightCoach = coachName;
      }
      setMembers([...members, newMember]);
    }
    alert(`สั่งซื้อ ${data.package.name} สำเร็จ! โค้ชผู้สอน: ${coachName} • เพิ่ม ${pkg.hours} ชม. ${machineType === 'trackman' ? 'Trackman' : 'Foresight'} เข้าสู่ระบบแล้ว`);
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
    setManageCoach(booking.coachName || '');
    setIsManageModalOpen(true);
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    setIsManageModalOpen(false);
  };

  const saveCoachAssignment = () => {
    if (!selectedBooking) return;
    // Check conflict
    if (manageCoach && isCoachBusy(manageCoach, selectedBooking.date, selectedBooking.time, selectedBooking.id)) {
      alert(`${manageCoach} ไม่ว่างในเวลานี้ (${selectedBooking.time}) กรุณาเลือกโค้ชท่านอื่น`);
      return;
    }
    setBookings(bookings.map(b =>
      b.id === selectedBooking.id ? { ...b, coachName: manageCoach, withCoach: manageCoach ? true : b.withCoach } : b
    ));
    setSelectedBooking({ ...selectedBooking, coachName: manageCoach, withCoach: manageCoach ? true : selectedBooking.withCoach });
    alert('บันทึกโค้ชสำเร็จ');
  };

  const handleCancelBooking = (booking) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      if (booking.usedQuota && booking.status !== 'checked-in') {
        const machineType = getMachineType(booking.machine);
        setMembers(members.map(m => {
          if (m.phone === booking.phone) {
            if (machineType === 'trackman') {
              return { ...m, trackmanHours: m.trackmanHours + 1 };
            } else if (machineType === 'foresight') {
              return { ...m, foresightHours: m.foresightHours + 1 };
            }
          }
          return m;
        }));
      }
      setBookings(bookings.filter((b) => b.id !== booking.id));
      setIsManageModalOpen(false);
    }
  };

  const exportToCSV = (data = bookings, filename = `golf_bookings_${getTodayString()}.csv`) => {
    const headers = ['รหัส', 'วันที่', 'เวลา', 'เครื่อง', 'ชื่อลูกค้า', 'เบอร์โทร', 'โค้ช', 'ชื่อโค้ช', 'สิทธิ์สมาชิก', 'สถานะ', 'ส่วนลด', 'ยอดสุทธิ'];
    const rows = data.map(b => [
      b.id, b.date, b.time, b.machine, b.customerName, b.phone,
      b.withCoach ? 'มี' : 'ไม่มี', b.coachName || '-', b.usedQuota ? 'หักชั่วโมง' : 'จ่ายปกติ', b.status, b.discount, b.price
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setReportMonth = (monthOffset) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    setReportStartDate(`${y}-${(m + 1).toString().padStart(2, '0')}-01`);
    setReportEndDate(`${y}-${(m + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`);
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

  const reportData = useMemo(() => {
    const filtered = bookings.filter(b => b.date >= reportStartDate && b.date <= reportEndDate);
    const activeBookings = filtered.filter(b => b.status !== 'no-show');

    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.price, 0);
    const totalBookings = filtered.length;
    const checkedIn = filtered.filter(b => b.status === 'checked-in').length;
    const noShow = filtered.filter(b => b.status === 'no-show').length;
    const withCoachCount = filtered.filter(b => b.withCoach).length;
    const memberQuotaUsed = filtered.filter(b => b.usedQuota).length;

    // Per-bay breakdown
    const byBay = MACHINES.map(machine => {
      const bayBookings = filtered.filter(b => b.machine === machine);
      const bayActive = bayBookings.filter(b => b.status !== 'no-show');
      return {
        machine,
        total: bayBookings.length,
        revenue: bayActive.reduce((sum, b) => sum + b.price, 0),
        checkedIn: bayBookings.filter(b => b.status === 'checked-in').length,
      };
    });

    // Per-day breakdown
    const byDay = {};
    filtered.forEach(b => {
      if (!byDay[b.date]) byDay[b.date] = { date: b.date, total: 0, revenue: 0, checkedIn: 0, noShow: 0 };
      byDay[b.date].total++;
      if (b.status !== 'no-show') byDay[b.date].revenue += b.price;
      if (b.status === 'checked-in') byDay[b.date].checkedIn++;
      if (b.status === 'no-show') byDay[b.date].noShow++;
    });
    const dailyBreakdown = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

    return { filtered, totalRevenue, totalBookings, checkedIn, noShow, withCoachCount, memberQuotaUsed, byBay, dailyBreakdown };
  }, [bookings, reportStartDate, reportEndDate]);

  // Coach calendar month state
  const [coachCalendarMonth, setCoachCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [coachSelectedDate, setCoachSelectedDate] = useState(null);

  const changeCoachMonth = (offset) => {
    const newMonth = new Date(coachCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCoachCalendarMonth(newMonth);
  };

  // Coach schedule: bookings for selected coach, grouped by date
  const coachSchedule = useMemo(() => {
    const myBookings = bookings.filter(b => b.withCoach && b.coachName === selectedRoleCoach && b.status !== 'no-show');
    const todayStr = getTodayString();
    const today = myBookings.filter(b => b.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
    const upcoming = myBookings.filter(b => b.date > todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const past = myBookings.filter(b => b.date < todayStr).sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));

    // Calendar month bookings
    const calY = coachCalendarMonth.getFullYear();
    const calM = coachCalendarMonth.getMonth();
    const calMonthStr = `${calY}-${(calM + 1).toString().padStart(2, '0')}`;
    const calMonthBookings = myBookings.filter(b => b.date.startsWith(calMonthStr));

    // Build date -> bookings map for calendar
    const calendarMap = {};
    calMonthBookings.forEach(b => {
      if (!calendarMap[b.date]) calendarMap[b.date] = [];
      calendarMap[b.date].push(b);
    });

    // Machine type breakdown
    const trackmanTotal = myBookings.filter(b => getMachineType(b.machine) === 'trackman').length;
    const foresightTotal = myBookings.filter(b => getMachineType(b.machine) === 'foresight' || getMachineType(b.machine) === null).length;
    const trackmanThisMonth = calMonthBookings.filter(b => getMachineType(b.machine) === 'trackman').length;
    const foresightThisMonth = calMonthBookings.filter(b => getMachineType(b.machine) === 'foresight' || getMachineType(b.machine) === null).length;

    // Calendar grid data
    const calBlanks = Array.from({ length: new Date(calY, calM, 1).getDay() }, (_, i) => i);
    const calDays = Array.from({ length: new Date(calY, calM + 1, 0).getDate() }, (_, i) => i + 1);

    return {
      today, upcoming, past,
      totalThisMonth: calMonthBookings.length, total: myBookings.length,
      calendarMap, calBlanks, calDays, calY, calM, calMonthStr,
      trackmanTotal, foresightTotal, trackmanThisMonth, foresightThisMonth
    };
  }, [bookings, selectedRoleCoach, coachCalendarMonth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'bg-emerald-50 ring-1 ring-emerald-200 text-emerald-800';
      case 'no-show': return 'bg-gray-50 ring-1 ring-gray-200 text-gray-400 opacity-60';
      default: return 'bg-amber-50 ring-1 ring-amber-200 text-amber-800 hover:bg-amber-100';
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

  // Compute current booking modal base price
  const currentBasePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : FORESIGHT_PRICE;
  const currentMachineType = selectedSlot ? getMachineType(selectedSlot.machine) : null;

  // Check if member can use quota on selected machine
  const canUseMemberQuota = foundMember && selectedSlot && currentMachineType && getMemberHoursForMachine(foundMember, selectedSlot.machine) > 0;

  const trackmanPackages = PACKAGES.filter(p => p.machineType === 'trackman');
  const foresightPackages = PACKAGES.filter(p => p.machineType === 'foresight');

  // ---------------- AUTH HANDLERS ----------------
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const user = appUsers.find(u => u.phone === authPhone.trim() && u.password === authPassword);
    if (!user) {
      setAuthError('เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
      return;
    }
    setCurrentUser(user);
    if (user.role === 'coach') setViewMode('coach-schedule');
    else if (user.role === 'admin') setViewMode('daily');
    else setViewMode('daily');
    setAuthPhone('');
    setAuthPassword('');
    setAuthError('');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authPhone.trim() || !authPassword.trim()) {
      setAuthError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (authPassword.length < 4) {
      setAuthError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (appUsers.some(u => u.phone === authPhone.trim())) {
      setAuthError('เบอร์โทรนี้ถูกใช้ลงทะเบียนแล้ว');
      return;
    }
    if (authRole === 'coach' && !authCoachName.trim()) {
      setAuthError('กรุณากรอกชื่อโค้ช');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: authName.trim(),
      phone: authPhone.trim(),
      password: authPassword,
      role: authRole,
      coachName: authRole === 'coach' ? authCoachName.trim() : '',
    };
    setAppUsers([...appUsers, newUser]);
    setCurrentUser(newUser);
    if (newUser.role === 'coach') setViewMode('coach-schedule');
    else setViewMode('daily');
    setAuthPhone('');
    setAuthPassword('');
    setAuthName('');
    setAuthCoachName('');
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
    setAuthError('');
    setShowPassword(false);
  };

  // ---------------- LOGIN / REGISTER PAGE ----------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#FF7A05] to-[#ff9a3c] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Monitor size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Golf Simulator</h1>
            <p className="text-gray-400 text-sm mt-1">ระบบจองสนามกอล์ฟจำลอง</p>
          </div>

          {/* Auth Card */}
          <div className="card p-6 md:p-8">
            {/* Tab Toggle */}
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LogIn size={16} /> เข้าสู่ระบบ
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus size={16} /> ลงทะเบียน
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Phone size={14} /> เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Lock size={14} /> รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="bg-red-50 ring-1 ring-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                    <XCircle size={16} /> {authError}
                  </div>
                )}

                <button type="submit" className="w-full py-3 btn-primary flex items-center justify-center gap-2 text-base">
                  <LogIn size={18} /> เข้าสู่ระบบ
                </button>

                {/* Demo accounts info */}
                <div className="bg-gray-50/80 ring-1 ring-gray-100 rounded-xl p-4 mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">บัญชีทดลองใช้ (รหัสผ่าน: 1234)</p>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><Shield size={11} className="text-gray-600" /> Admin</span><span className="font-mono text-gray-600">0999999999</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><GraduationCap size={11} className="text-purple-500" /> โค้ชเอ</span><span className="font-mono text-gray-600">0811111111</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><GraduationCap size={11} className="text-purple-500" /> โค้ชบี</span><span className="font-mono text-gray-600">0822222222</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><UserCircle size={11} className="text-[#FF7A05]" /> คุณสมชาย (ลูกค้า)</span><span className="font-mono text-gray-600">0812345678</span></div>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <User size={14} /> ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="กรอกชื่อ-นามสกุล"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Phone size={14} /> เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Lock size={14} /> รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="ตั้งรหัสผ่าน (อย่างน้อย 4 ตัว)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="text-gray-600 text-sm font-medium mb-2 block">ประเภทบัญชี</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthRole('customer')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all ${
                        authRole === 'customer'
                          ? 'ring-2 ring-[#FF7A05] bg-orange-50 text-[#FF7A05]'
                          : 'ring-1 ring-gray-200 bg-white text-gray-500 hover:ring-gray-300'
                      }`}
                    >
                      <UserCircle size={20} />
                      ลูกค้า
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('coach')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all ${
                        authRole === 'coach'
                          ? 'ring-2 ring-purple-500 bg-purple-50 text-purple-600'
                          : 'ring-1 ring-gray-200 bg-white text-gray-500 hover:ring-gray-300'
                      }`}
                    >
                      <GraduationCap size={20} />
                      โค้ช
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all ${
                        authRole === 'admin'
                          ? 'ring-2 ring-gray-900 bg-gray-50 text-gray-900'
                          : 'ring-1 ring-gray-200 bg-white text-gray-500 hover:ring-gray-300'
                      }`}
                    >
                      <Shield size={20} />
                      แอดมิน
                    </button>
                  </div>
                </div>

                {/* Coach Name (only for coach role) */}
                {authRole === 'coach' && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <GraduationCap size={14} /> ชื่อโค้ช (แสดงในระบบ)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={authCoachName}
                      onChange={(e) => setAuthCoachName(e.target.value)}
                      placeholder="เช่น โค้ชดี"
                      required
                    />
                  </div>
                )}

                {authError && (
                  <div className="bg-red-50 ring-1 ring-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                    <XCircle size={16} /> {authError}
                  </div>
                )}

                <button type="submit" className="w-full py-3 btn-primary flex items-center justify-center gap-2 text-base">
                  <UserPlus size={18} /> ลงทะเบียน
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN APP (LOGGED IN) ====================
  return (
    <div className="min-h-screen bg-[#f8f8fa] p-4 md:p-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Top Header - User Info & Logout */}
        <div className="flex justify-end mb-1">
          <div className="bg-white rounded-full shadow-sm ring-1 ring-gray-200 p-1 flex items-center gap-1">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              role === 'admin' ? 'bg-gray-900 text-white' :
              role === 'coach' ? 'bg-purple-600 text-white' :
              'bg-[#FF7A05] text-white'
            }`}>
              {role === 'admin' && <Shield size={15} />}
              {role === 'coach' && <GraduationCap size={15} />}
              {role === 'customer' && <UserCircle size={15} />}
              {currentUser.name}
              {role === 'coach' && <span className="text-white/70 text-xs">({selectedRoleCoach})</span>}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={15} /> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Main Header & View Toggles */}
        <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#FF7A05] to-[#ff9a3c] p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
              <Monitor size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
                Golf Simulator Booking
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {role === 'admin'
                  ? <span className="text-gray-600 font-medium">Admin — {currentUser.name}</span>
                  : role === 'coach'
                    ? <span className="text-purple-600 font-medium">Coach — {selectedRoleCoach}</span>
                    : <span className="text-[#FF7A05] font-medium">สวัสดี, {currentUser.name}</span>
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock size={16} /> รายวัน
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays size={16} /> ปฏิทิน
            </button>
            <button
              onClick={() => setViewMode('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'members'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} /> สมาชิก/คอร์ส
            </button>
            {role === 'coach' && (
              <button
                onClick={() => setViewMode('coach-schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'coach-schedule'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap size={16} /> ตารางสอน
              </button>
            )}
            {role === 'admin' && (
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'dashboard'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 size={16} /> แดชบอร์ด
              </button>
            )}
            {role === 'admin' && (
              <button
                onClick={() => setViewMode('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'reports'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} /> รายงาน
              </button>
            )}
          </div>
        </div>

        {/* ----------------- DAILY VIEW ----------------- */}
        {viewMode === 'daily' && (
          <div className="space-y-4">
            {/* Date Navigation */}
            <div className="flex items-center justify-between card px-5 py-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft size={20} /> <span className="hidden md:inline text-sm">วันก่อนหน้า</span>
              </button>
              <div className="flex items-center gap-2.5 text-gray-800 font-medium text-base">
                <Calendar size={18} className="text-[#FF7A05]" />
                {formatDateDisplay(currentDate)}
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 flex items-center gap-1 font-medium transition-colors"
              >
                <span className="hidden md:inline text-sm">วันถัดไป</span> <ChevronRight size={20} />
              </button>
            </div>

            {/* Booking Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3.5 font-medium text-gray-500 text-sm w-32 border-r border-gray-100 text-center sticky left-0 bg-white z-10">
                        <Clock size={14} className="inline mr-1.5 -mt-0.5"/> เวลา
                      </th>
                      {MACHINES.map((machine) => (
                        <th key={machine} className="px-4 py-3.5 font-medium text-gray-800 text-center text-sm">
                          {machine}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-b border-gray-50 table-row-hover">
                        <td className="px-4 py-3 font-medium text-gray-500 text-sm border-r border-gray-100 text-center sticky left-0 bg-white z-10">
                          {time}
                        </td>
                        {MACHINES.map((machine) => {
                          const booking = getBooking(machine, time);
                          return (
                            <td key={`${machine}-${time}`} className="p-2 text-center">
                              {booking ? (
                                <div
                                  onClick={() => openManageModal(booking)}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 group relative min-h-[66px] cursor-pointer ${
                                    role === 'admin'
                                      ? getStatusColor(booking.status)
                                      : 'bg-gray-50 ring-1 ring-gray-200 cursor-not-allowed opacity-70'
                                  }`}
                                >
                                  {role === 'admin' ? (
                                    <>
                                      <span className="font-medium text-sm flex items-center gap-1">
                                        {booking.status === 'checked-in' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                                        {booking.status === 'no-show' && <XCircle size={14} className="text-gray-400"/>}
                                        {booking.customerName}
                                      </span>
                                      <span className="text-[11px] text-gray-400">{booking.phone}</span>
                                      <div className="flex items-center gap-1 mt-0.5 flex-wrap justify-center">
                                        <span className={`badge text-[10px] ${
                                          booking.status === 'booked' ? 'badge-booked' :
                                          booking.status === 'checked-in' ? 'badge-checked-in' : 'badge-no-show'
                                        }`}>
                                          {booking.status === 'booked' ? 'รอโชว์ตัว' : booking.status === 'checked-in' ? 'เช็คอินแล้ว' : 'ไม่มา'}
                                        </span>
                                        {booking.usedQuota && <span className="badge badge-member text-[10px]"><Award size={10}/> Member</span>}
                                        {booking.withCoach && <span className="badge badge-coach text-[10px]"><GraduationCap size={10} /> {booking.coachName || 'โค้ช'}</span>}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-gray-500 font-medium text-sm">ถูกจองแล้ว</span>
                                      {booking.withCoach && <span className="badge badge-coach text-[10px]"><GraduationCap size={10} /> มีโค้ช</span>}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  onClick={() => openBookingModal(machine, time)}
                                  className="slot-available p-2.5 group"
                                >
                                  <span className="text-sm font-medium group-hover:hidden">ว่าง</span>
                                  <span className="text-sm font-medium hidden group-hover:block">+ จอง</span>
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
          <div className="space-y-5">
            {/* Trackman Package Cards */}
            <div className="card p-6">
              <div className="mb-6 flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-[#FF7A05]" />
                <h2 className="text-lg font-semibold text-gray-900">คอร์สเรียน Trackman</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium ring-1 ring-blue-200">Premium</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {trackmanPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-6 flex flex-col h-full transition-all duration-200 ${
                      pkg.highlight
                        ? 'ring-2 ring-[#FF7A05] bg-orange-50/30 shadow-lg shadow-orange-100'
                        : 'ring-1 ring-gray-200 bg-white hover:ring-gray-300'
                    }`}
                  >
                    <div className="flex-1">
                      {pkg.highlight && (
                        <span className="bg-[#FF7A05] text-white text-xs font-medium px-3 py-1 rounded-full mb-3 inline-block">
                          ยอดนิยม
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-3xl font-semibold text-gray-900">฿{pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 text-gray-500 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> คอร์สเรียน {pkg.hours} ชั่วโมง</li>
                        <li className="flex items-center gap-2"><GraduationCap size={15} className="text-purple-500"/> รวมค่าโค้ชสอนแล้ว</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> ใช้จองเครื่อง Trackman</li>
                        {pkg.save && <li className="flex items-center gap-2"><Tag size={15} className="text-emerald-500"/> {pkg.save}</li>}
                      </ul>
                    </div>
                    <button
                      onClick={() => openPackageModal(pkg)}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                        pkg.highlight
                          ? 'btn-primary'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      เลือกซื้อแพ็กเกจนี้
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Foresight Package Cards */}
            <div className="card p-6">
              <div className="mb-6 flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-[#FF7A05]" />
                <h2 className="text-lg font-semibold text-gray-900">คอร์สเรียน Foresight</h2>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium ring-1 ring-emerald-200">Standard</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {foresightPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-6 flex flex-col h-full transition-all duration-200 ${
                      pkg.highlight
                        ? 'ring-2 ring-[#FF7A05] bg-orange-50/30 shadow-lg shadow-orange-100'
                        : 'ring-1 ring-gray-200 bg-white hover:ring-gray-300'
                    }`}
                  >
                    <div className="flex-1">
                      {pkg.highlight && (
                        <span className="bg-[#FF7A05] text-white text-xs font-medium px-3 py-1 rounded-full mb-3 inline-block">
                          ยอดนิยม
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-3xl font-semibold text-gray-900">฿{pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 text-gray-500 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> คอร์สเรียน {pkg.hours} ชั่วโมง</li>
                        <li className="flex items-center gap-2"><GraduationCap size={15} className="text-purple-500"/> รวมค่าโค้ชสอนแล้ว</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> ใช้จองเครื่อง Foresight</li>
                        {pkg.save && <li className="flex items-center gap-2"><Tag size={15} className="text-emerald-500"/> {pkg.save}</li>}
                      </ul>
                    </div>
                    <button
                      onClick={() => openPackageModal(pkg)}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                        pkg.highlight
                          ? 'btn-primary'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      เลือกซื้อแพ็กเกจนี้
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Members Table */}
            {role === 'admin' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-gray-400"/> รายชื่อสมาชิกในระบบ
                </h2>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">ชื่อลูกค้า</th>
                        <th className="px-4 py-3 font-medium">เบอร์ติดต่อ</th>
                        <th className="px-4 py-3 font-medium">Line / Email</th>
                        <th className="px-4 py-3 font-medium text-center">Trackman (คงเหลือ/ซื้อ)</th>
                        <th className="px-4 py-3 font-medium text-center">Foresight (คงเหลือ/ซื้อ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, idx) => (
                        <tr key={idx} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3.5 font-medium text-gray-800">{member.name}</td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm">{member.phone}</td>
                          <td className="px-4 py-3.5 text-gray-400 text-sm">
                            {member.lineId && <div className="flex items-center gap-1.5"><MessageCircle size={13}/> {member.lineId}</div>}
                            {member.email && <div className="flex items-center gap-1.5 mt-0.5"><Mail size={13}/> {member.email}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`badge ${member.trackmanHours > 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                {member.trackmanHours} / {member.trackmanBought} ชม.
                              </span>
                              {member.trackmanCoach && <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5"><GraduationCap size={10}/> {member.trackmanCoach}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`badge ${member.foresightHours > 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                {member.foresightHours} / {member.foresightBought} ชม.
                              </span>
                              {member.foresightCoach && <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5"><GraduationCap size={10}/> {member.foresightCoach}</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">ยังไม่มีข้อมูลสมาชิก</td></tr>
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
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">ภาพรวมระบบและรายงาน</h2>
              <button
                onClick={exportToCSV}
                className="btn-ghost px-4 py-2 flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">การจองวันนี้</h3>
                </div>
                <div className="text-3xl font-semibold text-gray-900">{dashboardStats.today.total} <span className="text-base font-normal text-gray-400">รายการ</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">มาแสดงตัว (เช็คอิน)</h3>
                </div>
                <div className="text-3xl font-semibold text-emerald-600">{dashboardStats.today.checkedIn} <span className="text-base font-normal text-gray-400">คน</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <XCircle size={18} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">ไม่มา (No-show)</h3>
                </div>
                <div className="text-3xl font-semibold text-gray-500">{dashboardStats.today.noShow} <span className="text-base font-normal text-gray-400">คน</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#FF7A05]" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">ยอดรับเงินคาดการณ์ (วันนี้)</h3>
                </div>
                <div className="text-3xl font-semibold text-[#FF7A05]">฿{dashboardStats.today.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Coach Schedule View */}
        {viewMode === 'coach-schedule' && role === 'coach' && (
          <div className="space-y-5">
            {/* Coach Selector */}
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <GraduationCap size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">ตารางสอนของฉัน</h2>
                    <p className="text-sm text-gray-400">เลือกชื่อโค้ชเพื่อดูตารางสอน</p>
                  </div>
                </div>
                <select
                  value={selectedRoleCoach}
                  onChange={(e) => setSelectedRoleCoach(e.target.value)}
                  className="bg-white ring-1 ring-purple-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium focus:ring-2 focus:ring-purple-300 transition-all text-purple-700"
                >
                  {COACHES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">สอนวันนี้</div>
                <div className="text-2xl font-semibold text-purple-600">{coachSchedule.today.length} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">นัดที่จะถึง</div>
                <div className="text-2xl font-semibold text-blue-600">{coachSchedule.upcoming.length} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">เดือนนี้ทั้งหมด</div>
                <div className="text-2xl font-semibold text-gray-900">{coachSchedule.totalThisMonth} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">สอนไปแล้ว</div>
                <div className="text-2xl font-semibold text-emerald-600">{coachSchedule.past.length} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-500">Trackman</span>
                </div>
                <div className="text-2xl font-semibold text-blue-600">{coachSchedule.trackmanThisMonth} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
                <div className="text-[11px] text-gray-400 mt-0.5">รวมทั้งหมด {coachSchedule.trackmanTotal} คาบ</div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-500">Foresight</span>
                </div>
                <div className="text-2xl font-semibold text-emerald-600">{coachSchedule.foresightThisMonth} <span className="text-sm font-normal text-gray-400">คาบ</span></div>
                <div className="text-[11px] text-gray-400 mt-0.5">รวมทั้งหมด {coachSchedule.foresightTotal} คาบ</div>
              </div>
            </div>

            {/* Coach Calendar */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeCoachMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft size={22} className="text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {coachCalendarMonth.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
                </h2>
                <button onClick={() => changeCoachMonth(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronRight size={22} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-center font-medium text-gray-400 text-sm pb-2">{day}</div>
                ))}
                {coachSchedule.calBlanks.map(b => <div key={`cb-${b}`} className="min-h-[100px] md:min-h-[120px] rounded-xl"></div>)}
                {coachSchedule.calDays.map(day => {
                  const dateStr = `${coachSchedule.calY}-${(coachSchedule.calM + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const dayBookings = (coachSchedule.calendarMap[dateStr] || []).sort((a, b) => a.time.localeCompare(b.time));
                  const isToday = dateStr === getTodayString();
                  const isSelected = dateStr === coachSelectedDate;
                  return (
                    <div
                      key={day}
                      onClick={() => setCoachSelectedDate(isSelected ? null : dateStr)}
                      className={`min-h-[100px] md:min-h-[120px] flex flex-col rounded-xl p-1.5 md:p-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-purple-500 bg-purple-50 shadow-md'
                          : dayBookings.length > 0
                            ? 'ring-1 ring-purple-200 bg-purple-50/40 hover:ring-purple-300'
                            : isToday
                              ? 'bg-orange-50/50 ring-1 ring-orange-200 hover:ring-orange-300'
                              : 'ring-1 ring-gray-100 bg-white hover:ring-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-[#FF7A05] font-semibold' :
                        dayBookings.length > 0 ? 'text-purple-700 font-semibold' : 'text-gray-500'
                      }`}>
                        {day}
                      </span>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, 3).map(b => (
                          <div key={b.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] leading-tight ${
                            getMachineType(b.machine) === 'trackman'
                              ? 'bg-blue-100/80 text-blue-800'
                              : 'bg-emerald-100/80 text-emerald-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              getMachineType(b.machine) === 'trackman' ? 'bg-blue-500' : 'bg-emerald-500'
                            }`}></span>
                            <span className="truncate font-medium">{b.time.split(' - ')[0]}</span>
                            <span className="truncate hidden md:inline text-[10px] opacity-75">{b.customerName.length > 6 ? b.customerName.slice(0, 6) + '..' : b.customerName}</span>
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[10px] text-purple-500 font-medium px-1.5">+{dayBookings.length - 3} อีก</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Calendar Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Trackman
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Foresight
                </div>
              </div>
            </div>

            {/* Selected Date Detail */}
            {coachSelectedDate && (coachSchedule.calendarMap[coachSelectedDate] || []).length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays size={16} className="text-purple-500" />
                    รายละเอียดวันที่ {new Date(coachSelectedDate).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setCoachSelectedDate(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  {(coachSchedule.calendarMap[coachSelectedDate] || []).sort((a, b) => a.time.localeCompare(b.time)).map(b => (
                    <div key={b.id} className={`flex items-center gap-4 p-4 rounded-xl ring-1 transition-all ${
                      getMachineType(b.machine) === 'trackman'
                        ? 'bg-blue-50/50 ring-blue-200'
                        : 'bg-emerald-50/50 ring-emerald-200'
                    }`}>
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        getMachineType(b.machine) === 'trackman'
                          ? 'bg-blue-100 ring-1 ring-blue-200'
                          : 'bg-emerald-100 ring-1 ring-emerald-200'
                      }`}>
                        <Clock size={13} className={getMachineType(b.machine) === 'trackman' ? 'text-blue-500 mb-0.5' : 'text-emerald-500 mb-0.5'} />
                        <span className="text-xs font-semibold text-gray-800">{b.time.split(' - ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{b.customerName}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            getMachineType(b.machine) === 'trackman'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Monitor size={10} />
                            {b.machine}
                          </span>
                          <span>{b.time}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Phone size={10} /> {b.phone}</span>
                          {b.email && <span className="flex items-center gap-1"><Mail size={10} /> {b.email}</span>}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={`badge text-[11px] ${
                          b.status === 'checked-in' ? 'badge-checked-in' : 'badge-booked'
                        }`}>
                          {b.status === 'checked-in' ? 'เช็คอินแล้ว' : 'รอลูกค้า'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Schedule */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                ตารางสอนวันนี้ — {formatDateDisplay(getTodayString())}
              </h3>
              {coachSchedule.today.length > 0 ? (
                <div className="space-y-3">
                  {coachSchedule.today.map(b => (
                    <div key={b.id} className={`flex items-center gap-4 p-4 rounded-xl ring-1 transition-all ${
                      b.status === 'checked-in'
                        ? 'bg-emerald-50/60 ring-emerald-200'
                        : 'bg-purple-50/40 ring-purple-100'
                    }`}>
                      <div className="w-14 h-14 rounded-xl bg-white ring-1 ring-gray-200 flex flex-col items-center justify-center shrink-0">
                        <Clock size={14} className="text-purple-500 mb-0.5" />
                        <span className="text-xs font-semibold text-gray-800">{b.time.split(' - ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{b.customerName}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${getMachineType(b.machine) === 'trackman' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                          {b.machine} • {b.time}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.phone}</div>
                      </div>
                      <div className="shrink-0">
                        <span className={`badge text-[11px] ${
                          b.status === 'checked-in' ? 'badge-checked-in' : 'badge-booked'
                        }`}>
                          {b.status === 'checked-in' ? 'เช็คอินแล้ว' : 'รอลูกค้า'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <GraduationCap size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ไม่มีคาบสอนวันนี้</p>
                </div>
              )}
            </div>

            {/* Upcoming Schedule */}
            {coachSchedule.upcoming.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChevronRight size={16} className="text-blue-500" />
                  นัดสอนที่จะถึง ({coachSchedule.upcoming.length} คาบ)
                </h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">วันที่</th>
                        <th className="px-4 py-3 font-medium">เวลา</th>
                        <th className="px-4 py-3 font-medium">ลูกค้า</th>
                        <th className="px-4 py-3 font-medium">เบอร์โทร</th>
                        <th className="px-4 py-3 font-medium">เครื่อง</th>
                        <th className="px-4 py-3 font-medium text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coachSchedule.upcoming.map(b => (
                        <tr key={b.id} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {new Date(b.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{b.time}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{b.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{b.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${getMachineType(b.machine) === 'trackman' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                            {b.machine}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="badge badge-booked text-[10px]">รอลูกค้า</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Past Lessons */}
            {coachSchedule.past.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  ประวัติการสอน ({coachSchedule.past.length} คาบ)
                </h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">วันที่</th>
                        <th className="px-4 py-3 font-medium">เวลา</th>
                        <th className="px-4 py-3 font-medium">ลูกค้า</th>
                        <th className="px-4 py-3 font-medium">เครื่อง</th>
                        <th className="px-4 py-3 font-medium text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coachSchedule.past.map(b => (
                        <tr key={b.id} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(b.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{b.time}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{b.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${getMachineType(b.machine) === 'trackman' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                            {b.machine}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`badge text-[10px] ${
                              b.status === 'checked-in' ? 'badge-checked-in' : 'badge-booked'
                            }`}>
                              {b.status === 'checked-in' ? 'สอนแล้ว' : 'จอง'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports View */}
        {viewMode === 'reports' && role === 'admin' && (
          <div className="space-y-5">
            {/* Date Range Picker */}
            <div className="card p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Filter size={18} className="text-[#FF7A05]" />
                  <h2 className="text-lg font-semibold text-gray-900">เลือกช่วงเวลารายงาน</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setReportMonth(0)} className="px-3 py-1.5 text-xs font-medium bg-[#FF7A05] text-white rounded-lg hover:bg-orange-600 transition-colors">เดือนนี้</button>
                  <button onClick={() => setReportMonth(-1)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">เดือนก่อน</button>
                  <button onClick={() => setReportMonth(-2)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">2 เดือนก่อน</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 font-medium">จากวันที่</label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-white ring-1 ring-gray-200 rounded-lg px-3 py-2 text-sm outline-none font-medium focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 font-medium">ถึงวันที่</label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-white ring-1 ring-gray-200 rounded-lg px-3 py-2 text-sm outline-none font-medium focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <button
                  onClick={() => exportToCSV(reportData.filtered, `golf_report_${reportStartDate}_to_${reportEndDate}.csv`)}
                  className="btn-ghost px-4 py-2 flex items-center gap-2 text-sm ml-auto"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">การจองทั้งหมด</div>
                <div className="text-2xl font-semibold text-gray-900">{reportData.totalBookings}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">เช็คอินแล้ว</div>
                <div className="text-2xl font-semibold text-emerald-600">{reportData.checkedIn}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">ไม่มา (No-show)</div>
                <div className="text-2xl font-semibold text-gray-400">{reportData.noShow}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">รายได้รวม</div>
                <div className="text-2xl font-semibold text-[#FF7A05]">฿{reportData.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">มีโค้ช</div>
                <div className="text-2xl font-semibold text-purple-600">{reportData.withCoachCount}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">ใช้สิทธิ์สมาชิก</div>
                <div className="text-2xl font-semibold text-blue-600">{reportData.memberQuotaUsed}</div>
              </div>
            </div>

            {/* Per-Bay Breakdown */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Monitor size={16} className="text-gray-400" /> สรุปตาม Bay
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {reportData.byBay.map(bay => (
                  <div key={bay.machine} className="bg-gray-50/80 ring-1 ring-gray-100 rounded-xl p-4">
                    <div className="font-medium text-gray-800 text-sm mb-3">{bay.machine}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">จำนวนจอง</span>
                        <span className="font-medium text-gray-800">{bay.total} รายการ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">เช็คอิน</span>
                        <span className="font-medium text-emerald-600">{bay.checkedIn} คน</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-500">รายได้</span>
                        <span className="font-semibold text-[#FF7A05]">฿{bay.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-400" /> สรุปรายวัน
              </h3>
              {reportData.dailyBreakdown.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">วันที่</th>
                        <th className="px-4 py-3 font-medium text-center">จำนวนจอง</th>
                        <th className="px-4 py-3 font-medium text-center">เช็คอิน</th>
                        <th className="px-4 py-3 font-medium text-center">ไม่มา</th>
                        <th className="px-4 py-3 font-medium text-right">รายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyBreakdown.map(day => (
                        <tr key={day.date} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">{day.total}</td>
                          <td className="px-4 py-3 text-sm text-center text-emerald-600 font-medium">{day.checkedIn}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-400">{day.noShow}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#FF7A05]">฿{day.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">รวมทั้งหมด</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{reportData.totalBookings}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-emerald-600">{reportData.checkedIn}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-400">{reportData.noShow}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[#FF7A05]">฿{reportData.totalRevenue.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">ไม่มีข้อมูลการจองในช่วงเวลาที่เลือก</p>
                </div>
              )}
            </div>

            {/* Booking Detail Table */}
            {reportData.filtered.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" /> รายการจองทั้งหมด ({reportData.filtered.length} รายการ)
                </h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-3 py-3 font-medium">วันที่</th>
                        <th className="px-3 py-3 font-medium">เวลา</th>
                        <th className="px-3 py-3 font-medium">เครื่อง</th>
                        <th className="px-3 py-3 font-medium">ลูกค้า</th>
                        <th className="px-3 py-3 font-medium text-center">สถานะ</th>
                        <th className="px-3 py-3 font-medium text-right">ยอด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.filtered.map(b => (
                        <tr key={b.id} className="border-b border-gray-50 table-row-hover">
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.date}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.time}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.machine}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{b.customerName}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`badge text-[10px] ${
                              b.status === 'booked' ? 'badge-booked' :
                              b.status === 'checked-in' ? 'badge-checked-in' : 'badge-no-show'
                            }`}>
                              {b.status === 'booked' ? 'รอโชว์ตัว' : b.status === 'checked-in' ? 'เช็คอินแล้ว' : 'ไม่มา'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-sm text-right font-medium text-gray-800">฿{b.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly View */}
        {viewMode === 'monthly' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft size={22} className="text-gray-500" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">{formatMonthDisplay(calendarMonth)}</h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronRight size={22} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center font-medium text-gray-400 text-sm pb-2">{day}</div>
              ))}
              {blanks.map(b => <div key={`b-${b}`} className="aspect-square rounded-xl"></div>)}
              {days.map(day => {
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const bookingCount = bookings.filter(b => b.date === dateStr).length;
                const isToday = dateStr === getTodayString();
                const isSelected = dateStr === currentDate;
                return (
                  <button
                    key={day}
                    onClick={() => { setCurrentDate(dateStr); setViewMode('daily'); }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-[#FF7A05] bg-orange-50'
                        : isToday
                          ? 'bg-orange-50/50 ring-1 ring-orange-200'
                          : 'ring-1 ring-gray-100 hover:ring-gray-300 bg-white'
                    }`}
                  >
                    <span className={`text-base md:text-lg ${
                      isToday
                        ? 'text-[#FF7A05] font-semibold'
                        : isSelected
                          ? 'text-[#FF7A05] font-semibold'
                          : 'text-gray-700 font-medium'
                    }`}>
                      {day}
                    </span>
                    {bookingCount > 0 && (
                      <span className="mt-0.5 bg-gray-100 text-gray-600 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium">
                        {bookingCount} รายการ
                      </span>
                    )}
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
        <div className="modal-overlay" onClick={() => setIsManageModalOpen(false)}>
          <div className="modal-panel p-6 max-w-sm animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900">จัดการการจอง</h2>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl mb-5 space-y-2.5 text-sm ring-1 ring-gray-100">
              <p className="flex justify-between"><span className="text-gray-500">ชื่อลูกค้า</span> <span className="font-medium text-gray-800">{selectedBooking.customerName}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">เบอร์โทร</span> <span className="font-medium text-gray-800">{selectedBooking.phone}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">เวลา</span> <span className="font-medium text-gray-800">{selectedBooking.time}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">เครื่อง</span> <span className="font-medium text-gray-800">{selectedBooking.machine}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">วิธีชำระเงิน</span> {selectedBooking.usedQuota ? <span className="font-medium text-blue-600">หักชั่วโมงสมาชิก</span> : <span className="font-medium text-gray-800">จ่ายเงินปกติ</span>}</p>
              {selectedBooking.coachName && (
                <p className="flex justify-between"><span className="text-gray-500">โค้ช</span> <span className="font-medium text-purple-600">{selectedBooking.coachName}</span></p>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-2.5 mt-2.5">
                <span className="text-gray-500">ยอดสุทธิ</span>
                <span className="text-lg font-semibold text-[#FF7A05]">฿{selectedBooking.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Coach Assignment */}
            <div className="bg-purple-50/60 ring-1 ring-purple-100 p-4 rounded-xl mb-5">
              <label className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-2">
                <GraduationCap size={15}/> มอบหมายโค้ช
              </label>
              <div className="space-y-2 mb-3">
                <label
                  className={`flex items-center justify-between p-2.5 rounded-lg ring-1 cursor-pointer transition-all ${
                    manageCoach === '' ? 'ring-2 ring-gray-400 bg-gray-50' : 'ring-gray-200 bg-white hover:ring-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input type="radio" name="manageCoach" value="" checked={manageCoach === ''} onChange={() => setManageCoach('')} className="w-3.5 h-3.5 accent-gray-600" />
                    <span className="text-sm text-gray-600">ไม่มีโค้ช</span>
                  </div>
                </label>
                {getAvailableCoaches(selectedBooking.date, selectedBooking.time, selectedBooking.id).map(c => (
                  <label
                    key={c.name}
                    className={`flex items-center justify-between p-2.5 rounded-lg ring-1 cursor-pointer transition-all ${
                      c.busy
                        ? 'ring-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : manageCoach === c.name
                          ? 'ring-2 ring-purple-400 bg-purple-50'
                          : 'ring-gray-200 bg-white hover:ring-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input type="radio" name="manageCoach" value={c.name} checked={manageCoach === c.name} disabled={c.busy} onChange={(e) => setManageCoach(e.target.value)} className="w-3.5 h-3.5 accent-purple-600" />
                      <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      {c.busy && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">ไม่ว่าง</span>}
                    </div>
                    <span className={`text-sm font-semibold ${c.busy ? 'text-gray-400' : 'text-purple-600'}`}>฿{c.price.toLocaleString()}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={saveCoachAssignment}
                className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                บันทึกโค้ช
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedBooking.status === 'booked' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'checked-in')}
                  className="w-full py-3 btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> ยืนยันลูกค้ามาถึง (Check-in)
                </button>
              )}
              {selectedBooking.status === 'booked' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'no-show')}
                  className="w-full py-3 btn-secondary flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> ลูกค้าไม่มาแสดงตัว (No-show)
                </button>
              )}
              <button
                onClick={() => handleCancelBooking(selectedBooking)}
                className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-xl flex items-center justify-center gap-2 mt-3 transition-colors"
              >
                ลบข้อมูลการจองนี้ (คืนสิทธิ์)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal สร้างการจองใหม่ */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel p-6 max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {role === 'admin' ? 'เพิ่มการจอง (แอดมิน)' : 'จองเวลาเล่นกอล์ฟ'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slot Info */}
            <div className="bg-orange-50/60 p-3.5 rounded-xl mb-5 space-y-2 ring-1 ring-orange-100 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={15} className="text-[#FF7A05]"/> <span className="text-gray-500">วันที่:</span> <span className="font-medium">{formatDateDisplay(currentDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Monitor size={15} className="text-[#FF7A05]"/> <span className="text-gray-500">เครื่อง:</span> <span className="font-medium">{selectedSlot?.machine}</span>
                {selectedSlot && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    ฿{getBasePrice(selectedSlot.machine).toLocaleString()}/ชม.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={15} className="text-[#FF7A05]"/>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="bg-white ring-1 ring-gray-200 rounded-lg px-2.5 py-1 text-sm outline-none font-medium focus:ring-2 focus:ring-orange-200 transition-all"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t} disabled={getBooking(selectedSlot?.machine, t) && t !== selectedSlot?.time}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleBook}>
              <div className="space-y-4 mb-4">
                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Phone size={14}/> เบอร์ติดต่อ (เช็คสถานะสมาชิกอัตโนมัติ)
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    required
                    autoFocus
                  />
                </div>

                {/* Member Info */}
                {foundMember && (
                  <div className="bg-blue-50/60 ring-1 ring-blue-200 p-3.5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-700 font-medium text-sm flex items-center gap-1.5"><Award size={15}/> ข้อมูลคอร์สสมาชิก</span>
                    </div>
                    <div className="space-y-1.5 mb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${foundMember.trackmanHours > 0 ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-red-100 text-red-700 ring-1 ring-red-200'}`}>
                          Trackman: {foundMember.trackmanHours} ชม.
                        </span>
                        {foundMember.trackmanCoach && <span className="text-purple-600 font-medium flex items-center gap-1"><GraduationCap size={11}/> {foundMember.trackmanCoach}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${foundMember.foresightHours > 0 ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-100 text-red-700 ring-1 ring-red-200'}`}>
                          Foresight: {foundMember.foresightHours} ชม.
                        </span>
                        {foundMember.foresightCoach && <span className="text-purple-600 font-medium flex items-center gap-1"><GraduationCap size={11}/> {foundMember.foresightCoach}</span>}
                      </div>
                    </div>
                    {currentMachineType ? (
                      canUseMemberQuota ? (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-800 bg-white p-2.5 rounded-lg ring-1 ring-blue-100 hover:bg-blue-50 transition-colors">
                            <input type="checkbox" className="w-4 h-4 accent-[#FF7A05]" checked={useMemberQuota} onChange={(e) => { setUseMemberQuota(e.target.checked); if(e.target.checked) { setWithCoach(false); setSelectedCoach(''); } }} />
                            ใช้คอร์สสมาชิก {currentMachineType === 'trackman' ? 'Trackman' : 'Foresight'} (รวมโค้ชแล้ว)
                          </label>
                          {useMemberQuota && getMemberCoachForMachine(foundMember, selectedSlot.machine) && (
                            <div className="mt-2 bg-purple-50 ring-1 ring-purple-100 p-2.5 rounded-lg flex items-center gap-2 text-sm text-purple-700">
                              <GraduationCap size={15} className="text-purple-500" />
                              <span className="font-medium">โค้ชประจำ: {getMemberCoachForMachine(foundMember, selectedSlot.machine)}</span>
                              <span className="text-purple-400 text-xs">(รวมในคอร์สแล้ว)</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-red-500 text-xs mt-1">ชั่วโมง {currentMachineType === 'trackman' ? 'Trackman' : 'Foresight'} หมดแล้ว กรุณาซื้อคอร์สเพิ่มในเมนูสมาชิก</p>
                      )
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">Bay นี้ไม่สามารถใช้สิทธิ์สมาชิกได้</p>
                    )}
                  </div>
                )}

                {/* Customer Name */}
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <User size={14}/> ชื่อลูกค้า
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                {/* Line & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <MessageCircle size={14}/> Line ID
                    </label>
                    <input type="text" className="input-field" value={lineId} onChange={(e) => setLineId(e.target.value)} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <Mail size={14}/> อีเมล
                    </label>
                    <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {/* Promo Code */}
                {!useMemberQuota && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <Tag size={14}/> โค้ดส่วนลด
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="GOLF10"
                        className="input-field flex-1 uppercase"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        ใช้โค้ด
                      </button>
                    </div>
                    {discountAmount > 0 && <p className="text-[#FF7A05] text-xs mt-1.5 font-medium">ส่วนลด: ฿{discountAmount}</p>}
                  </div>
                )}
              </div>

              {/* Coach Option — only when NOT using member quota (bay booking) */}
              {!useMemberQuota && (
                <div className="mb-5 bg-purple-50/60 p-3.5 rounded-xl ring-1 ring-purple-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      id="withCoach"
                      type="checkbox"
                      className="w-5 h-5 accent-[#FF7A05] cursor-pointer rounded"
                      checked={withCoach}
                      onChange={(e) => {
                        setWithCoach(e.target.checked);
                        if (!e.target.checked) setSelectedCoach('');
                      }}
                    />
                    <label htmlFor="withCoach" className="text-gray-700 text-sm font-medium flex items-center gap-2 cursor-pointer select-none">
                      <GraduationCap size={16} className="text-purple-500" /> เพิ่มโค้ชสอน (จ่ายเพิ่ม)
                    </label>
                  </div>
                  {withCoach && (
                    <div>
                      <label className="text-gray-600 text-sm font-medium mb-1.5 block">เลือกโค้ช</label>
                      <div className="space-y-2">
                        {getAvailableCoaches(currentDate, selectedTime).map(c => (
                          <label
                            key={c.name}
                            className={`flex items-center justify-between p-3 rounded-xl ring-1 cursor-pointer transition-all ${
                              c.busy
                                ? 'ring-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : selectedCoach === c.name
                                  ? 'ring-2 ring-purple-400 bg-purple-50'
                                  : 'ring-gray-200 bg-white hover:ring-purple-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="coach"
                                value={c.name}
                                checked={selectedCoach === c.name}
                                disabled={c.busy}
                                onChange={(e) => setSelectedCoach(e.target.value)}
                                className="w-4 h-4 accent-purple-600"
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-800">{c.name}</span>
                                {c.busy && (
                                  <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">ไม่ว่าง</span>
                                )}
                              </div>
                            </div>
                            <span className={`text-sm font-semibold ${c.busy ? 'text-gray-400' : 'text-purple-600'}`}>
                              +฿{c.price.toLocaleString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Summary */}
              {(() => {
                const selectedCoachPrice = !useMemberQuota && withCoach && selectedCoach ? getCoachPrice(selectedCoach) : 0;
                const memberCoach = useMemberQuota && foundMember && selectedSlot ? getMemberCoachForMachine(foundMember, selectedSlot.machine) : '';
                return (
                  <div className="bg-gray-50/80 p-3.5 rounded-xl mb-5 ring-1 ring-gray-100 text-sm">
                    {useMemberQuota ? (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">คอร์สสมาชิก ({selectedSlot?.machine})</span>
                          <span className="font-medium text-emerald-600">รวมค่าเครื่อง+โค้ชแล้ว</span>
                        </div>
                        {memberCoach && (
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">โค้ชประจำ</span>
                            <span className="font-medium text-purple-600">{memberCoach}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="font-medium text-gray-800">ยอดรวม</span>
                          <span className="font-semibold text-emerald-600 text-lg">฿0 (ใช้สิทธิ์คอร์ส)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">ค่าเครื่อง ({selectedSlot?.machine})</span>
                          <span className="font-medium text-gray-800">฿{currentBasePrice.toLocaleString()}</span>
                        </div>
                        {withCoach && selectedCoach && (
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">ค่าโค้ช ({selectedCoach})</span>
                            <span className="font-medium text-gray-800">+฿{selectedCoachPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between mb-1 text-red-500">
                            <span>ส่วนลด</span>
                            <span className="font-medium">-฿{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="font-medium text-gray-800">ยอดรวม</span>
                          <span className="font-semibold text-[#FF7A05] text-lg">
                            ฿{Math.max(0, currentBasePrice + selectedCoachPrice - discountAmount).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 py-3 btn-primary">
                  {role === 'admin' ? 'ยืนยันการจอง' : (useMemberQuota && !withCoach ? 'ยืนยันใช้สิทธิ์' : 'ไปชำระเงิน')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal ซื้อแพ็กเกจ/คอร์ส */}
      {isPackageModalOpen && selectedPackage && (
        <div className="modal-overlay" onClick={() => setIsPackageModalOpen(false)}>
          <div className="modal-panel p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#FF7A05]"/> ซื้อคอร์สเรียน/เล่น
              </h2>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Package Summary */}
            <div className="bg-orange-50/60 ring-1 ring-orange-200 p-5 rounded-xl mb-5 text-center">
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium ring-1 ring-purple-200">รวมค่าโค้ชแล้ว</span>
              <h3 className="text-gray-900 font-semibold text-lg mt-2">{selectedPackage.name}</h3>
              <p className="text-gray-500 font-medium mt-1 text-sm">
                {selectedPackage.hours} ชั่วโมง ({selectedPackage.machineType === 'trackman' ? 'Trackman' : 'Foresight'}) + โค้ชสอน
              </p>
              <div className="text-2xl font-semibold text-[#FF7A05] mt-2">฿{selectedPackage.price.toLocaleString()}</div>
            </div>

            <form onSubmit={handleBuyPackage} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                  <Phone size={14}/> เบอร์โทรศัพท์ (ใช้เป็นรหัสอ้างอิง)
                </label>
                <input
                  type="tel"
                  autoFocus
                  required
                  className="input-field"
                  value={pkgPhone}
                  onChange={(e) => handlePkgPhoneChange(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                  <User size={14}/> ชื่อ-นามสกุล
                </label>
                <input type="text" required className="input-field" value={pkgName} onChange={(e) => setPkgName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <MessageCircle size={13}/> Line ID
                  </label>
                  <input type="text" className="input-field" value={pkgLineId} onChange={(e) => setPkgLineId(e.target.value)} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Mail size={13}/> อีเมล
                  </label>
                  <input type="email" className="input-field" value={pkgEmail} onChange={(e) => setPkgEmail(e.target.value)} />
                </div>
              </div>

              {/* Coach Selection for Course */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-2">
                  <GraduationCap size={14} className="text-purple-500" /> เลือกโค้ชผู้สอนประจำคอร์ส
                </label>
                <div className="space-y-2">
                  {COACHES_DATA.map(c => (
                    <label
                      key={c.name}
                      className={`flex items-center justify-between p-3 rounded-xl ring-1 cursor-pointer transition-all ${
                        pkgCoach === c.name
                          ? 'ring-2 ring-purple-400 bg-purple-50'
                          : 'ring-gray-200 bg-white hover:ring-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="pkgCoach"
                          value={c.name}
                          checked={pkgCoach === c.name}
                          onChange={(e) => setPkgCoach(e.target.value)}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">฿{c.price.toLocaleString()}/ชม. (ถ้าจองแยก)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsPackageModalOpen(false)} className="flex-1 py-3 btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 py-3 btn-primary">
                  {role === 'admin' ? 'เพิ่มเข้าระบบ' : 'ไปชำระเงิน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Payment Modal */}
      {isPaymentModalOpen && isPaymentModalOpen.data && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="modal-panel p-6 max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={36} className="text-[#FF7A05]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">สแกนชำระเงิน</h2>

            <div className="bg-gray-50/80 p-4 rounded-xl text-left space-y-2 mb-5 ring-1 ring-gray-100">
              {isPaymentModalOpen.type === 'package' ? (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">แพ็กเกจ:</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.package.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">ผู้ซื้อ:</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.name}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">เครื่อง:</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.machine}</span></div>
                  {isPaymentModalOpen.data.usedQuota ? (
                    <div className="flex justify-between text-sm text-blue-600"><span>สิทธิ์สมาชิก:</span><span className="font-medium">หัก 1 ชั่วโมง</span></div>
                  ) : (
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ค่าเครื่อง:</span><span className="font-medium text-gray-800">฿{getBasePrice(isPaymentModalOpen.data.machine).toLocaleString()}</span></div>
                  )}
                  {isPaymentModalOpen.data.withCoach && <div className="flex justify-between text-sm"><span className="text-gray-500">ค่าโค้ช ({isPaymentModalOpen.data.coachName}):</span><span className="font-medium text-gray-800">฿{(isPaymentModalOpen.data.coachPrice || 0).toLocaleString()}</span></div>}
                  {isPaymentModalOpen.data.discount > 0 && <div className="flex justify-between text-sm text-red-500"><span>ส่วนลด:</span><span className="font-medium">-฿{isPaymentModalOpen.data.discount.toLocaleString()}</span></div>}
                </>
              )}
              <div className="pt-2.5 border-t border-gray-200 flex justify-between mt-2.5">
                <span className="font-medium text-gray-800">ยอดรวมสุทธิ:</span>
                <span className="font-semibold text-[#FF7A05] text-xl">฿{isPaymentModalOpen.data.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 btn-secondary">
                ยกเลิก
              </button>
              <button onClick={handlePaymentConfirm} className="flex-1 py-3 btn-primary">
                แจ้งชำระเงินแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
