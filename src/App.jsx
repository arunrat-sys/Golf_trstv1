import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, User, Clock,
  Monitor, X, Shield, UserCircle, CalendarDays, GraduationCap,
  Phone, MessageCircle, Mail, QrCode, BarChart3, Download,
  CheckCircle2, XCircle, Tag, Users, CreditCard, Award, ShoppingCart,
  FileText, Filter, TrendingUp, LogOut, LogIn, UserPlus, Eye, EyeOff, Lock,
  Settings, Plus, Trash2, Pencil, Percent, ToggleLeft, ToggleRight,
  Camera, ImagePlus, Star, Briefcase, BookOpen, ChevronDown, Info
} from 'lucide-react';

const START_HOUR = 9;
const END_HOUR = 22;
const DAYS_OF_WEEK_MAP = {
  th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
};
const LOCALE_MAP = { th: 'th-TH', en: 'en-US', ja: 'ja-JP' };

const TRANSLATIONS = {
  // ---- Auth page ----
  systemSubtitle: { th: 'ระบบจองสนามกอล์ฟจำลอง', en: 'Golf Simulator Booking System', ja: 'ゴルフシミュレーター予約システム' },
  login: { th: 'เข้าสู่ระบบ', en: 'Login', ja: 'ログイン' },
  register: { th: 'ลงทะเบียน', en: 'Register', ja: '新規登録' },
  phone: { th: 'เบอร์โทรศัพท์', en: 'Phone Number', ja: '電話番号' },
  password: { th: 'รหัสผ่าน', en: 'Password', ja: 'パスワード' },
  enterPassword: { th: 'กรอกรหัสผ่าน', en: 'Enter password', ja: 'パスワードを入力' },
  fullName: { th: 'ชื่อ-นามสกุล', en: 'Full Name', ja: '氏名' },
  enterFullName: { th: 'กรอกชื่อ-นามสกุล', en: 'Enter full name', ja: '氏名を入力' },
  setPassword: { th: 'ตั้งรหัสผ่าน (อย่างน้อย 4 ตัว)', en: 'Set password (min 4 chars)', ja: 'パスワード設定（4文字以上）' },
  accountType: { th: 'ประเภทบัญชี', en: 'Account Type', ja: 'アカウント種別' },
  customer: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様' },
  coach: { th: 'โค้ช', en: 'Coach', ja: 'コーチ' },
  admin: { th: 'แอดมิน', en: 'Admin', ja: '管理者' },
  coachNameLabel: { th: 'ชื่อโค้ช (แสดงในระบบ)', en: 'Coach Name (displayed in system)', ja: 'コーチ名（システム表示用）' },
  coachNamePlaceholder: { th: 'เช่น โค้ชดี', en: 'e.g. Coach D', ja: '例：コーチD' },
  demoAccounts: { th: 'บัญชีทดลองใช้ (รหัสผ่าน: 1234)', en: 'Demo accounts (password: 1234)', ja: 'デモアカウント（パスワード：1234）' },
  customerLabel: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様' },

  // ---- Auth errors ----
  errPhoneOrPassword: { th: 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง', en: 'Incorrect phone or password', ja: '電話番号またはパスワードが正しくありません' },
  errFillAll: { th: 'กรุณากรอกข้อมูลให้ครบ', en: 'Please fill in all fields', ja: 'すべての項目を入力してください' },
  errPasswordMin: { th: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', en: 'Password must be at least 4 characters', ja: 'パスワードは4文字以上必要です' },
  errPhoneUsed: { th: 'เบอร์โทรนี้ถูกใช้ลงทะเบียนแล้ว', en: 'This phone is already registered', ja: 'この電話番号は既に登録されています' },
  errEnterCoachName: { th: 'กรุณากรอกชื่อโค้ช', en: 'Please enter coach name', ja: 'コーチ名を入力してください' },

  // ---- Top bar / Nav ----
  logout: { th: 'ออกจากระบบ', en: 'Logout', ja: 'ログアウト' },
  hello: { th: 'สวัสดี,', en: 'Hello,', ja: 'こんにちは,' },
  daily: { th: 'รายวัน', en: 'Daily', ja: '日別' },
  calendar: { th: 'ปฏิทิน', en: 'Calendar', ja: 'カレンダー' },
  membersAndCourses: { th: 'สมาชิก/คอร์ส', en: 'Members/Courses', ja: '会員/コース' },
  coachSchedule: { th: 'ตารางสอน', en: 'Schedule', ja: 'スケジュール' },
  dashboard: { th: 'แดชบอร์ด', en: 'Dashboard', ja: 'ダッシュボード' },
  reports: { th: 'รายงาน', en: 'Reports', ja: 'レポート' },
  settings: { th: 'ตั้งค่า', en: 'Settings', ja: '設定' },

  // ---- Daily view ----
  prevDay: { th: 'วันก่อนหน้า', en: 'Previous Day', ja: '前日' },
  nextDay: { th: 'วันถัดไป', en: 'Next Day', ja: '翌日' },
  time: { th: 'เวลา', en: 'Time', ja: '時間' },
  available: { th: 'ว่าง', en: 'Open', ja: '空き' },
  book: { th: '+ จอง', en: '+ Book', ja: '+ 予約' },
  booked: { th: 'ถูกจองแล้ว', en: 'Booked', ja: '予約済み' },
  myBooking: { th: 'จองเรียบร้อยแล้ว', en: 'Your Booking', ja: '予約済み（自分）' },
  notAvailable: { th: 'ไม่ว่าง', en: 'Unavailable', ja: '空きなし' },
  statusBooked: { th: 'รอโชว์ตัว', en: 'Awaiting', ja: '来店待ち' },
  statusCheckedIn: { th: 'เช็คอินแล้ว', en: 'Checked In', ja: 'チェックイン済' },
  statusNoShow: { th: 'ไม่มา', en: 'No-show', ja: '不参加' },
  hasCoach: { th: 'มีโค้ช', en: 'With Coach', ja: 'コーチ付き' },

  // ---- Members / Packages view ----
  trackmanCourses: { th: 'คอร์สเรียน Trackman', en: 'Trackman Courses', ja: 'Trackmanコース' },
  foresightCourses: { th: 'คอร์สเรียน Foresight', en: 'Foresight Courses', ja: 'Foresightコース' },
  popular: { th: 'ยอดนิยม', en: 'Popular', ja: '人気' },
  courseHours: { th: 'คอร์สเรียน', en: 'Course', ja: 'コース' },
  hours: { th: 'ชั่วโมง', en: 'hours', ja: '時間' },
  coachIncluded: { th: 'รวมค่าโค้ชสอนแล้ว', en: 'Coach fee included', ja: 'コーチ料込み' },
  useForTrackman: { th: 'ใช้จองเครื่อง Trackman', en: 'For Trackman machines', ja: 'Trackmanマシン用' },
  useForForesight: { th: 'ใช้จองเครื่อง Foresight', en: 'For Foresight machines', ja: 'Foresightマシン用' },
  buyPackage: { th: 'เลือกซื้อแพ็กเกจนี้', en: 'Buy This Package', ja: 'このパッケージを購入' },
  myCourses: { th: 'คอร์สของฉัน', en: 'My Courses', ja: 'マイコース' },
  hoursRemaining: { th: 'ชม. คงเหลือ', en: 'hrs remaining', ja: '時間 残り' },
  hoursUnit: { th: 'ชม.', en: 'hrs', ja: '時間' },
  hoursUsedUp: { th: 'หมดแล้ว — เลือกซื้อแพ็คเกจด้านบนเพื่อเติม', en: 'Used up — buy a package above to refill', ja: '残りなし — 上記パッケージを購入してください' },
  noCourses: { th: 'คุณยังไม่มีคอร์ส — เลือกซื้อแพ็คเกจด้านบนเพื่อเริ่มต้น', en: 'No courses yet — buy a package above to get started', ja: 'コースがありません — 上記パッケージを購入してください' },
  memberListTitle: { th: 'รายชื่อสมาชิกในระบบ', en: 'Member List', ja: '会員一覧' },
  customerName: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名' },
  contactPhone: { th: 'เบอร์ติดต่อ', en: 'Phone', ja: '連絡先' },
  lineEmail: { th: 'Line / Email', en: 'Line / Email', ja: 'Line / Email' },
  trackmanRemBought: { th: 'Trackman (คงเหลือ/ซื้อ)', en: 'Trackman (Remaining/Bought)', ja: 'Trackman (残り/購入)' },
  foresightRemBought: { th: 'Foresight (คงเหลือ/ซื้อ)', en: 'Foresight (Remaining/Bought)', ja: 'Foresight (残り/購入)' },
  noMembers: { th: 'ยังไม่มีข้อมูลสมาชิก', en: 'No member data yet', ja: '会員データがありません' },
  hrsUnit: { th: 'ชม.', en: 'hrs', ja: '時間' },

  // ---- Dashboard ----
  dashboardTitle: { th: 'ภาพรวมระบบและรายงาน', en: 'System Overview & Reports', ja: 'システム概要とレポート' },
  bookingsToday: { th: 'การจองวันนี้', en: "Today's Bookings", ja: '本日の予約' },
  checkinToday: { th: 'มาแสดงตัว (เช็คอิน)', en: 'Checked In', ja: 'チェックイン' },
  noShowToday: { th: 'ไม่มา (No-show)', en: 'No-show', ja: '不参加 (No-show)' },
  expectedRevenue: { th: 'ยอดรับเงินคาดการณ์ (วันนี้)', en: 'Expected Revenue (Today)', ja: '予想収益（本日）' },
  items: { th: 'รายการ', en: 'items', ja: '件' },
  people: { th: 'คน', en: 'people', ja: '人' },

  // ---- Coach Schedule ----
  today: { th: 'วันนี้', en: 'Today', ja: '今日' },
  nextAppointment: { th: 'นัดถัดไป', en: 'Next Appointment', ja: '次の予約' },
  thisMonth: { th: 'เดือนนี้', en: 'This Month', ja: '今月' },
  taughtAlready: { th: 'สอนแล้ว', en: 'Taught', ja: '指導済' },
  sessions: { th: 'คาบ', en: 'sessions', ja: 'コマ' },
  todaySchedule: { th: 'วันนี้', en: 'Today', ja: '今日' },
  noSessionsToday: { th: 'ไม่มีคาบสอนวันนี้', en: 'No sessions today', ja: '本日のセッションなし' },
  waitingCustomer: { th: 'รอลูกค้า', en: 'Awaiting', ja: '来店待ち' },
  teachingHistory: { th: 'ประวัติการสอน', en: 'Teaching History', ja: '指導履歴' },
  more: { th: 'อีก', en: 'more', ja: '他' },
  detailForDate: { th: 'รายละเอียดวันที่', en: 'Details for', ja: '日付の詳細' },

  // ---- Reports ----
  selectReportRange: { th: 'เลือกช่วงเวลารายงาน', en: 'Select Report Period', ja: 'レポート期間を選択' },
  thisMonthBtn: { th: 'เดือนนี้', en: 'This Month', ja: '今月' },
  lastMonthBtn: { th: 'เดือนก่อน', en: 'Last Month', ja: '先月' },
  twoMonthsAgo: { th: '2 เดือนก่อน', en: '2 Months Ago', ja: '2ヶ月前' },
  fromDate: { th: 'จากวันที่', en: 'From', ja: '開始日' },
  toDate: { th: 'ถึงวันที่', en: 'To', ja: '終了日' },
  totalBookings: { th: 'การจองทั้งหมด', en: 'Total Bookings', ja: '総予約数' },
  checkedIn: { th: 'เช็คอินแล้ว', en: 'Checked In', ja: 'チェックイン済' },
  noShowLabel: { th: 'ไม่มา (No-show)', en: 'No-show', ja: '不参加' },
  totalRevenue: { th: 'รายได้รวม', en: 'Total Revenue', ja: '総収益' },
  withCoach: { th: 'มีโค้ช', en: 'With Coach', ja: 'コーチ付き' },
  memberQuotaUsed: { th: 'ใช้สิทธิ์สมาชิก', en: 'Member Quota Used', ja: '会員枠使用' },
  summaryByBay: { th: 'สรุปตาม Bay', en: 'Summary by Bay', ja: 'ベイ別集計' },
  bookingCount: { th: 'จำนวนจอง', en: 'Bookings', ja: '予約数' },
  checkinCount: { th: 'เช็คอิน', en: 'Check-ins', ja: 'チェックイン' },
  revenue: { th: 'รายได้', en: 'Revenue', ja: '収益' },
  dailySummary: { th: 'สรุปรายวัน', en: 'Daily Summary', ja: '日別集計' },
  date: { th: 'วันที่', en: 'Date', ja: '日付' },
  noShowCol: { th: 'ไม่มา', en: 'No-show', ja: '不参加' },
  grandTotal: { th: 'รวมทั้งหมด', en: 'Grand Total', ja: '合計' },
  noDataForRange: { th: 'ไม่มีข้อมูลการจองในช่วงเวลาที่เลือก', en: 'No booking data for selected period', ja: '選択期間の予約データなし' },
  allBookings: { th: 'รายการจองทั้งหมด', en: 'All Bookings', ja: '全予約一覧' },
  timeCol: { th: 'เวลา', en: 'Time', ja: '時間' },
  machine: { th: 'เครื่อง', en: 'Machine', ja: 'マシン' },
  customerCol: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様' },
  statusCol: { th: 'สถานะ', en: 'Status', ja: 'ステータス' },
  amount: { th: 'ยอด', en: 'Amount', ja: '金額' },

  // ---- Settings ----
  systemSettings: { th: 'ตั้งค่าระบบ', en: 'System Settings', ja: 'システム設定' },
  settingsDesc: { th: 'จัดการเบย์, แพ็คเกจ และโปรโมชั่น', en: 'Manage bays, packages & promotions', ja: 'ベイ、パッケージ、プロモーション管理' },
  baysTab: { th: 'เบย์', en: 'Bays', ja: 'ベイ' },
  coachesTab: { th: 'โค้ช', en: 'Coaches', ja: 'コーチ' },
  packagesTab: { th: 'แพ็คเกจ', en: 'Packages', ja: 'パッケージ' },
  promosTab: { th: 'โปรโมโค้ด', en: 'Promo Codes', ja: 'プロモコード' },
  editBay: { th: 'แก้ไขเบย์', en: 'Edit Bay', ja: 'ベイ編集' },
  addBay: { th: 'เพิ่มเบย์ใหม่', en: 'Add New Bay', ja: '新規ベイ追加' },
  bayNamePlaceholder: { th: 'ชื่อเบย์ เช่น Bay 5 (Trackman)', en: 'Bay name e.g. Bay 5 (Trackman)', ja: 'ベイ名 例: Bay 5 (Trackman)' },
  noType: { th: 'ไม่ระบุประเภท', en: 'No Type', ja: '種別なし' },
  pricePerHour: { th: 'ราคา/ชม.', en: 'Price/hr', ja: '料金/時' },
  save: { th: 'บันทึก', en: 'Save', ja: '保存' },
  add: { th: 'เพิ่ม', en: 'Add', ja: '追加' },
  cancel: { th: 'ยกเลิก', en: 'Cancel', ja: 'キャンセル' },
  noBays: { th: 'ยังไม่มีเบย์', en: 'No bays yet', ja: 'ベイがありません' },
  editCoach: { th: 'แก้ไขโค้ช', en: 'Edit Coach', ja: 'コーチ編集' },
  addCoach: { th: 'เพิ่มโค้ชใหม่', en: 'Add New Coach', ja: '新規コーチ追加' },
  coachNamePH: { th: 'ชื่อโค้ช เช่น โค้ชดี', en: 'Coach name e.g. Coach D', ja: 'コーチ名 例: コーチD' },
  pricePerHourBaht: { th: 'ราคา/ชม. (บาท)', en: 'Price/hr (THB)', ja: '料金/時（バーツ）' },
  educationPH: { th: 'วุฒิการศึกษา / ใบรับรอง เช่น PGA Teaching Professional', en: 'Education/Certification e.g. PGA Teaching Professional', ja: '学歴/資格 例: PGA Teaching Professional' },
  expertisePH: { th: 'ความเชี่ยวชาญ เช่น Short Game, Putting', en: 'Expertise e.g. Short Game, Putting', ja: '専門分野 例: Short Game, Putting' },
  bioPH: { th: 'ประวัติย่อ เช่น ประสบการณ์สอน 10 ปี', en: 'Bio e.g. 10 years teaching experience', ja: '略歴 例: 指導歴10年' },
  addCoachBtn: { th: 'เพิ่มโค้ช', en: 'Add Coach', ja: 'コーチ追加' },
  noCoaches: { th: 'ยังไม่มีโค้ช', en: 'No coaches yet', ja: 'コーチがいません' },
  educationLabel: { th: 'วุฒิ:', en: 'Education:', ja: '学歴:' },
  expertiseLabel: { th: 'เชี่ยวชาญ:', en: 'Expertise:', ja: '専門:' },
  bioLabel: { th: 'ประวัติ:', en: 'Bio:', ja: '略歴:' },
  editPkg: { th: 'แก้ไขแพ็คเกจ', en: 'Edit Package', ja: 'パッケージ編集' },
  addPkg: { th: 'เพิ่มแพ็คเกจใหม่', en: 'Add New Package', ja: '新規パッケージ追加' },
  pkgNamePH: { th: 'ชื่อแพ็คเกจ', en: 'Package name', ja: 'パッケージ名' },
  numHours: { th: 'จำนวนชั่วโมง', en: 'Number of hours', ja: '時間数' },
  priceBaht: { th: 'ราคา (บาท)', en: 'Price (THB)', ja: '料金（バーツ）' },
  savingText: { th: 'ข้อความประหยัด เช่น ประหยัด 5,000 บาท', en: 'Saving text e.g. Save 5,000 THB', ja: '節約テキスト 例: 5,000バーツお得' },
  descText: { th: 'รายละเอียด เช่น รวมค่าโค้ชแล้ว', en: 'Description e.g. Coach fee included', ja: '説明 例: コーチ料込み' },
  showAsPopular: { th: 'แสดงเป็น "ยอดนิยม"', en: 'Show as "Popular"', ja: '「人気」として表示' },
  addPkgBtn: { th: 'เพิ่มแพ็คเกจ', en: 'Add Package', ja: 'パッケージ追加' },
  noPackages: { th: 'ยังไม่มีแพ็คเกจ', en: 'No packages yet', ja: 'パッケージがありません' },
  editPromo: { th: 'แก้ไขโปรโมโค้ด', en: 'Edit Promo Code', ja: 'プロモコード編集' },
  addPromo: { th: 'เพิ่มโปรโมโค้ดใหม่', en: 'Add New Promo Code', ja: '新規プロモコード追加' },
  promoCodePH: { th: 'โค้ด เช่น SAVE20', en: 'Code e.g. SAVE20', ja: 'コード 例: SAVE20' },
  discountPercent: { th: 'ลดเป็น % (เปอร์เซ็นต์)', en: 'Percent discount (%)', ja: '割引率（%）' },
  discountFixed: { th: 'ลดเป็นจำนวนเงิน (บาท)', en: 'Fixed amount (THB)', ja: '定額割引（バーツ）' },
  discountPercentPH: { th: 'ส่วนลด %', en: 'Discount %', ja: '割引 %' },
  discountFixedPH: { th: 'ส่วนลด (บาท)', en: 'Discount (THB)', ja: '割引（バーツ）' },
  expiryDate: { th: 'วันหมดอายุ (เว้นว่าง = ไม่มีกำหนด)', en: 'Expiry date (blank = no expiry)', ja: '有効期限（空欄=無期限）' },
  addPromoBtn: { th: 'เพิ่มโปรโมโค้ด', en: 'Add Promo Code', ja: 'プロモコード追加' },
  noPromos: { th: 'ยังไม่มีโปรโมโค้ด', en: 'No promo codes yet', ja: 'プロモコードがありません' },
  expired: { th: 'หมดอายุ:', en: 'Expires:', ja: '有効期限:' },
  alreadyExpired: { th: '(หมดอายุแล้ว)', en: '(Expired)', ja: '（期限切れ）' },
  noExpiry: { th: 'ไม่มีวันหมดอายุ', en: 'No expiry', ja: '無期限' },

  // ---- Manage Booking Modal ----
  manageBooking: { th: 'จัดการการจอง', en: 'Manage Booking', ja: '予約管理' },
  customerNameLabel: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名' },
  phoneLabel: { th: 'เบอร์โทร', en: 'Phone', ja: '電話' },
  timeLabel: { th: 'เวลา', en: 'Time', ja: '時間' },
  machineLabel: { th: 'เครื่อง', en: 'Machine', ja: 'マシン' },
  paymentMethod: { th: 'วิธีชำระเงิน', en: 'Payment Method', ja: '支払方法' },
  memberQuotaDeduct: { th: 'หักชั่วโมงสมาชิก', en: 'Member Quota', ja: '会員枠控除' },
  normalPayment: { th: 'จ่ายเงินปกติ', en: 'Normal Payment', ja: '通常支払い' },
  coachLabel: { th: 'โค้ช', en: 'Coach', ja: 'コーチ' },
  netTotal: { th: 'ยอดสุทธิ', en: 'Net Total', ja: '合計金額' },
  assignCoach: { th: 'มอบหมายโค้ช', en: 'Assign Coach', ja: 'コーチ割当' },
  noCoach: { th: 'ไม่มีโค้ช', en: 'No Coach', ja: 'コーチなし' },
  busy: { th: 'ไม่ว่าง', en: 'Busy', ja: '空きなし' },
  saveCoach: { th: 'บันทึกโค้ช', en: 'Save Coach', ja: 'コーチ保存' },
  confirmCheckin: { th: 'ยืนยันลูกค้ามาถึง (Check-in)', en: 'Confirm Check-in', ja: 'チェックイン確認' },
  confirmNoShow: { th: 'ลูกค้าไม่มาแสดงตัว (No-show)', en: 'Mark as No-show', ja: '不参加とマーク' },
  deleteBooking: { th: 'ลบข้อมูลการจองนี้ (คืนสิทธิ์)', en: 'Delete Booking (Refund Quota)', ja: '予約を削除（枠を返却）' },

  // ---- Booking Modal ----
  addBookingAdmin: { th: 'เพิ่มการจอง (แอดมิน)', en: 'Add Booking (Admin)', ja: '予約追加（管理者）' },
  bookGolf: { th: 'จองเวลาเล่นกอล์ฟ', en: 'Book Golf Session', ja: 'ゴルフセッション予約' },
  dateLabel: { th: 'วันที่:', en: 'Date:', ja: '日付:' },
  machineColonLabel: { th: 'เครื่อง:', en: 'Machine:', ja: 'マシン:' },
  phoneAutoCheck: { th: 'เบอร์ติดต่อ (เช็คสถานะสมาชิกอัตโนมัติ)', en: 'Phone (auto-check membership)', ja: '電話番号（会員自動確認）' },
  memberCourseRights: { th: 'สิทธิ์คอร์สสมาชิก', en: 'Member Course Rights', ja: '会員コース権利' },
  useMemberRight: { th: 'ใช้สิทธิ์', en: 'Use', ja: '利用' },
  includesCoach: { th: '(รวมโค้ชแล้ว)', en: '(Coach included)', ja: '（コーチ込み）' },
  courseCoach: { th: 'โค้ชประจำคอร์ส:', en: 'Course Coach:', ja: 'コースコーチ:' },
  hoursUsedUpShort: { th: 'หมดแล้ว —', en: 'Used up —', ja: '残りなし —' },
  buyCourseMore: { th: 'ซื้อคอร์สเพิ่ม', en: 'Buy more courses', ja: 'コースを追加購入' },
  bayNoMemberSupport: { th: 'Bay นี้ไม่รองรับสิทธิ์สมาชิก', en: 'This bay does not support member quota', ja: 'このベイは会員枠に対応していません' },
  customerNameField: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名' },
  email: { th: 'อีเมล', en: 'Email', ja: 'メール' },
  promoCodeLabel: { th: 'โค้ดส่วนลด', en: 'Promo Code', ja: 'プロモコード' },
  applyCode: { th: 'ใช้โค้ด', en: 'Apply', ja: '適用' },
  discountLabel: { th: 'ส่วนลด:', en: 'Discount:', ja: '割引:' },
  addCoachExtra: { th: 'เพิ่มโค้ชสอน (จ่ายเพิ่ม)', en: 'Add Coach (extra charge)', ja: 'コーチ追加（追加料金）' },
  selectCoach: { th: 'เลือกโค้ช', en: 'Select Coach', ja: 'コーチを選択' },
  viewProfile: { th: 'ดูโปรไฟล์', en: 'View Profile', ja: 'プロフィール' },
  todayScheduleOf: { th: 'ตารางวันนี้ของ', en: "Today's schedule for", ja: '本日のスケジュール:' },
  freeAllDay: { th: 'ว่างทั้งวัน', en: 'Free all day', ja: '終日空き' },
  memberCourse: { th: 'คอร์สสมาชิก', en: 'Member Course', ja: '会員コース' },
  machineAndCoachIncluded: { th: 'รวมค่าเครื่อง+โค้ชแล้ว', en: 'Machine + Coach included', ja: 'マシン＋コーチ込み' },
  assignedCoach: { th: 'โค้ชประจำ', en: 'Assigned Coach', ja: '担当コーチ' },
  totalLabel: { th: 'ยอดรวม', en: 'Total', ja: '合計' },
  useCourseRight: { th: '(ใช้สิทธิ์คอร์ส)', en: '(Using course quota)', ja: '（コース枠使用）' },
  machineFee: { th: 'ค่าเครื่อง', en: 'Machine Fee', ja: 'マシン料金' },
  coachFee: { th: 'ค่าโค้ช', en: 'Coach Fee', ja: 'コーチ料金' },
  discount: { th: 'ส่วนลด', en: 'Discount', ja: '割引' },
  confirmBooking: { th: 'ยืนยันการจอง', en: 'Confirm Booking', ja: '予約確定' },
  confirmUseRight: { th: 'ยืนยันใช้สิทธิ์', en: 'Confirm Usage', ja: '利用確定' },
  goToPayment: { th: 'ไปชำระเงิน', en: 'Go to Payment', ja: 'お支払いへ' },

  // ---- Package Modal ----
  buyCourseTitle: { th: 'ซื้อคอร์สเรียน/เล่น', en: 'Buy Course/Package', ja: 'コース/パッケージ購入' },
  coachFeeIncluded: { th: 'รวมค่าโค้ชแล้ว', en: 'Coach fee included', ja: 'コーチ料込み' },
  hoursLabel: { th: 'ชั่วโมง', en: 'hours', ja: '時間' },
  plusCoaching: { th: '+ โค้ชสอน', en: '+ Coaching', ja: '+ コーチング' },
  phoneRefLabel: { th: 'เบอร์โทรศัพท์ (ใช้เป็นรหัสอ้างอิง)', en: 'Phone (used as reference)', ja: '電話番号（参照用）' },
  selectCourseCoach: { th: 'เลือกโค้ชผู้สอนประจำคอร์ส', en: 'Select Course Coach', ja: 'コースコーチを選択' },
  addToSystem: { th: 'เพิ่มเข้าระบบ', en: 'Add to System', ja: 'システムに追加' },

  // ---- Payment Modal ----
  scanToPay: { th: 'สแกนชำระเงิน', en: 'Scan to Pay', ja: 'QRコードでお支払い' },
  packageLabel: { th: 'แพ็กเกจ:', en: 'Package:', ja: 'パッケージ:' },
  buyer: { th: 'ผู้ซื้อ:', en: 'Buyer:', ja: '購入者:' },
  machineColon: { th: 'เครื่อง:', en: 'Machine:', ja: 'マシン:' },
  memberRightLabel: { th: 'สิทธิ์สมาชิก:', en: 'Member Quota:', ja: '会員枠:' },
  deduct1Hour: { th: 'หัก 1 ชั่วโมง', en: 'Deduct 1 hour', ja: '1時間控除' },
  machineFeeColon: { th: 'ค่าเครื่อง:', en: 'Machine fee:', ja: 'マシン料金:' },
  coachFeeColon: { th: 'ค่าโค้ช', en: 'Coach fee', ja: 'コーチ料金' },
  discountColon: { th: 'ส่วนลด:', en: 'Discount:', ja: '割引:' },
  netTotalColon: { th: 'ยอดรวมสุทธิ:', en: 'Net Total:', ja: '合計金額:' },
  confirmPayment: { th: 'แจ้งชำระเงินแล้ว', en: 'Confirm Payment', ja: '支払い確認' },

  // ---- Coach Profile Modal ----
  perHour: { th: '/ ชั่วโมง', en: '/ hour', ja: '/ 時間' },
  educationCert: { th: 'วุฒิการศึกษา / ใบรับรอง', en: 'Education / Certification', ja: '学歴 / 資格' },
  expertiseTitle: { th: 'ความเชี่ยวชาญ', en: 'Expertise', ja: '専門分野' },
  close: { th: 'ปิด', en: 'Close', ja: '閉じる' },

  // ---- Alert messages ----
  alertEnterCoachName: { th: 'กรุณากรอกชื่อโค้ช', en: 'Please enter coach name', ja: 'コーチ名を入力してください' },
  alertDeleteCoach: { th: 'ลบโค้ชนี้?', en: 'Delete this coach?', ja: 'このコーチを削除しますか？' },
  alertEnterBayName: { th: 'กรุณากรอกชื่อเบย์', en: 'Please enter bay name', ja: 'ベイ名を入力してください' },
  alertDeleteBay: { th: 'ลบเบย์นี้? (การจองที่มีอยู่แล้วจะไม่ถูกลบ)', en: 'Delete this bay? (Existing bookings will not be removed)', ja: 'このベイを削除しますか？（既存の予約は削除されません）' },
  alertEnterPkgName: { th: 'กรุณากรอกชื่อแพ็คเกจ', en: 'Please enter package name', ja: 'パッケージ名を入力してください' },
  alertDeletePkg: { th: 'ลบแพ็คเกจนี้?', en: 'Delete this package?', ja: 'このパッケージを削除しますか？' },
  alertEnterPromoCode: { th: 'กรุณากรอกโค้ดโปรโมชั่น', en: 'Please enter promo code', ja: 'プロモコードを入力してください' },
  alertDeletePromo: { th: 'ลบโปรโมโค้ดนี้?', en: 'Delete this promo code?', ja: 'このプロモコードを削除しますか？' },
  alertImageTooLarge: { th: 'รูปภาพต้องมีขนาดไม่เกิน 500KB', en: 'Image must be under 500KB', ja: '画像は500KB以下にしてください' },
  alertPromoNoQuota: { th: 'ไม่สามารถใช้โค้ดส่วนลดร่วมกับการหักชั่วโมงสมาชิกได้', en: 'Cannot use promo code with member quota deduction', ja: 'プロモコードと会員枠控除は併用できません' },
  alertPromoInvalid: { th: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ', en: 'Invalid or expired promo code', ja: '無効または期限切れのプロモコード' },
  alertPromoExpired: { th: 'โค้ดส่วนลดนี้หมดอายุแล้ว', en: 'This promo code has expired', ja: 'このプロモコードは期限切れです' },
  alertPromoSuccessPercent: { th: 'ใช้โค้ดส่วนลดสำเร็จ! ลด', en: 'Promo applied! Discount', ja: 'プロモ適用！割引' },
  alertPromoSuccessFixed: { th: 'ใช้โค้ดส่วนลดสำเร็จ! ลด', en: 'Promo applied! Discount', ja: 'プロモ適用！割引' },
  alertFillNamePhone: { th: 'กรุณากรอกชื่อและเบอร์ติดต่อ', en: 'Please enter name and phone', ja: '名前と電話番号を入力してください' },
  alertBayNoMember: { th: 'Bay นี้ไม่สามารถใช้สิทธิ์สมาชิกได้ (ไม่มีประเภทเครื่อง)', en: 'This bay does not support member quota (no machine type)', ja: 'このベイは会員枠に対応していません（マシン種別なし）' },
  alertHoursUsedUp: { th: 'หมดแล้ว กรุณาซื้อเพิ่มในเมนูสมาชิก', en: 'Used up. Please buy more in Members menu', ja: '残りなし。会員メニューで追加購入してください' },
  alertCourseCoachBusy: { th: '(โค้ชประจำคอร์ส) ไม่ว่างในเวลานี้ กรุณาเลือกเวลาอื่น', en: '(Course coach) is busy at this time. Please choose another time', ja: '（コースコーチ）はこの時間帯は予約済みです。別の時間を選択してください' },
  alertCoachBusy: { th: 'ไม่ว่างในเวลานี้ กรุณาเลือกโค้ชท่านอื่นหรือเปลี่ยนเวลา', en: 'is busy at this time. Please choose another coach or time', ja: 'はこの時間帯は予約済みです。別のコーチまたは時間を選択してください' },
  alertMemberBookingSuccess: { th: 'ใช้สิทธิ์สมาชิกเรียบร้อยแล้ว การจองสำเร็จ!', en: 'Member quota used. Booking successful!', ja: '会員枠を使用しました。予約完了！' },
  alertCalendarSent: { th: 'ส่งคำเชิญลงปฏิทินนัดหมายไปยัง', en: 'Calendar invite sent to', ja: 'カレンダー招待を送信しました:' },
  alertCalendarSentSuffix: { th: 'เรียบร้อยแล้ว', en: 'successfully', ja: '' },
  alertFillNamePhonePkg: { th: 'กรุณากรอกชื่อและเบอร์โทรศัพท์', en: 'Please enter name and phone', ja: '名前と電話番号を入力してください' },
  alertSelectCoach: { th: 'กรุณาเลือกโค้ชผู้สอน', en: 'Please select a coach', ja: 'コーチを選択してください' },
  alertPkgSuccess: { th: 'สั่งซื้อ', en: 'Purchased', ja: '購入完了' },
  alertPkgSuccessSuffix: { th: 'สำเร็จ! โค้ชผู้สอน:', en: 'successfully! Coach:', ja: '！コーチ:' },
  alertPkgAddedHours: { th: 'เพิ่ม', en: 'Added', ja: '追加' },
  alertPkgAddedSuffix: { th: 'เข้าสู่ระบบแล้ว', en: 'to system', ja: 'をシステムに追加' },
  alertCustomerCannotEdit: { th: 'ลูกค้าไม่สามารถแก้ไขการจองได้ กรุณาติดต่อหน้าร้าน', en: 'Customers cannot modify bookings. Please contact the front desk.', ja: 'お客様は予約を変更できません。フロントにお問い合わせください。' },
  alertCoachSaved: { th: 'บันทึกโค้ชสำเร็จ', en: 'Coach saved successfully', ja: 'コーチを保存しました' },
  alertCoachBusyManage: { th: 'ไม่ว่างในเวลานี้', en: 'is busy at this time', ja: 'はこの時間帯は予約済みです' },
  alertChooseAnotherCoach: { th: 'กรุณาเลือกโค้ชท่านอื่น', en: 'Please choose another coach', ja: '別のコーチを選択してください' },
  alertConfirmCancel: { th: 'คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?', en: 'Do you want to cancel this booking?', ja: 'この予約をキャンセルしますか？' },

  // ---- CSV export headers ----
  csvId: { th: 'รหัส', en: 'ID', ja: 'ID' },
  csvDate: { th: 'วันที่', en: 'Date', ja: '日付' },
  csvTime: { th: 'เวลา', en: 'Time', ja: '時間' },
  csvMachine: { th: 'เครื่อง', en: 'Machine', ja: 'マシン' },
  csvCustomer: { th: 'ชื่อลูกค้า', en: 'Customer', ja: 'お客様' },
  csvPhone: { th: 'เบอร์โทร', en: 'Phone', ja: '電話' },
  csvCoach: { th: 'โค้ช', en: 'Coach', ja: 'コーチ' },
  csvCoachName: { th: 'ชื่อโค้ช', en: 'Coach Name', ja: 'コーチ名' },
  csvMemberQuota: { th: 'สิทธิ์สมาชิก', en: 'Member Quota', ja: '会員枠' },
  csvStatus: { th: 'สถานะ', en: 'Status', ja: 'ステータス' },
  csvDiscount: { th: 'ส่วนลด', en: 'Discount', ja: '割引' },
  csvNetAmount: { th: 'ยอดสุทธิ', en: 'Net Amount', ja: '合計金額' },
  csvHasCoach: { th: 'มี', en: 'Yes', ja: 'あり' },
  csvNoCoach: { th: 'ไม่มี', en: 'No', ja: 'なし' },
  csvDeductHours: { th: 'หักชั่วโมง', en: 'Deducted', ja: '控除' },
  csvNormalPay: { th: 'จ่ายปกติ', en: 'Normal', ja: '通常' },

  // ---- Calendar view ----
  bookingsCount: { th: 'รายการ', en: 'bookings', ja: '件' },

  // ---- Misc ----
  bahtUnit: { th: 'บาท', en: 'THB', ja: 'バーツ' },
};
const DEFAULT_COACHES = [
  { id: 1, name: 'โค้ชเอ', price: 2000, education: 'PGA Teaching Professional', expertise: 'Short Game, Putting', bio: 'ประสบการณ์สอน 10 ปี เน้นเทคนิค Short Game และ Putting ให้ผลลัพธ์ที่วัดได้จริง', avatar: '', active: true },
  { id: 2, name: 'โค้ชบี', price: 1500, education: 'TPI Certified', expertise: 'Driver, Long Iron', bio: 'อดีตนักกอล์ฟทีมชาติ เชี่ยวชาญการตีไกลและเทคนิค Iron Play', avatar: '', active: true },
  { id: 3, name: 'โค้ชซี', price: 1000, education: 'Golf Academy Thailand', expertise: 'เริ่มต้นเรียนกอล์ฟ, Swing Basic', bio: 'เชี่ยวชาญสอนผู้เริ่มต้น ปูพื้นฐาน Swing อย่างถูกวิธี', avatar: '', active: true },
];

const DEFAULT_BAYS = [
  { id: 1, name: 'Bay 1 (Trackman)', type: 'trackman', price: 1500, active: true },
  { id: 2, name: 'Bay 2 (Foresight)', type: 'foresight', price: 1000, active: true },
  { id: 3, name: 'Bay 3', type: null, price: 1000, active: true },
  { id: 4, name: 'Bay 4', type: null, price: 1000, active: true },
];

const DEFAULT_PACKAGES = [
  { id: 'pkg_tm_1', name: 'คอร์ส Trackman 1 ชม.', hours: 1, price: 3500, machineType: 'trackman', highlight: false, save: '', desc: 'รวมค่าโค้ชแล้ว', active: true },
  { id: 'pkg_tm_10', name: 'คอร์ส Trackman 10 ชม.', hours: 10, price: 30000, machineType: 'trackman', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว', active: true },
  { id: 'pkg_tm_20', name: 'คอร์ส Trackman 20 ชม.', hours: 20, price: 55000, machineType: 'trackman', highlight: true, save: 'ประหยัด 15,000 บาท', desc: 'รวมค่าโค้ชแล้ว', active: true },
  { id: 'pkg_fs_1', name: 'คอร์ส Foresight 1 ชม.', hours: 1, price: 3000, machineType: 'foresight', highlight: false, save: '', desc: 'รวมค่าโค้ชแล้ว', active: true },
  { id: 'pkg_fs_10', name: 'คอร์ส Foresight 10 ชม.', hours: 10, price: 25000, machineType: 'foresight', highlight: true, save: 'ประหยัด 5,000 บาท', desc: 'รวมค่าโค้ชแล้ว', active: true },
  { id: 'pkg_fs_20', name: 'คอร์ส Foresight 20 ชม.', hours: 20, price: 45000, machineType: 'foresight', highlight: true, save: 'ประหยัด 15,000 บาท', desc: 'รวมค่าโค้ชแล้ว', active: true },
];

const DEFAULT_PROMOS = [
  { id: 1, code: 'GOLF10', type: 'percent', value: 10, active: true, expiryDate: '' },
  { id: 2, code: 'SALE500', type: 'fixed', value: 500, active: true, expiryDate: '' },
];

export default function App() {
  const [lang, setLang] = useState('th');
  const t = (key) => (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) || (TRANSLATIONS[key] && TRANSLATIONS[key]['th']) || key;
  const currentLocale = LOCALE_MAP[lang] || 'th-TH';
  const DAYS_OF_WEEK = DAYS_OF_WEEK_MAP[lang] || DAYS_OF_WEEK_MAP.th;

  const timeSlots = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00 - ${(i + 1).toString().padStart(2, '0')}:00`);
  }

  const getTodayString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  // ---------------- DYNAMIC SETTINGS STATE ----------------
  const [bays, setBays] = useState(DEFAULT_BAYS);
  const [coaches, setCoaches] = useState(DEFAULT_COACHES);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [promoCodes, setPromoCodes] = useState(DEFAULT_PROMOS);

  // Derived coach helpers
  const activeCoaches = coaches.filter(c => c.active);
  const coachNames = activeCoaches.map(c => c.name);
  const getCoachPrice = (coachName) => {
    const coach = coaches.find(c => c.name === coachName);
    return coach ? coach.price : 1500;
  };
  const getCoachInfo = (coachName) => coaches.find(c => c.name === coachName) || null;

  // Derived: active bay names for rendering
  const activeBays = bays.filter(b => b.active);
  const activeBayNames = activeBays.map(b => b.name);

  // Dynamic helpers (reference bays state)
  const getMachineType = (machineName) => {
    const bay = bays.find(b => b.name === machineName);
    if (bay && bay.type) return bay.type;
    if (machineName.toLowerCase().includes('trackman')) return 'trackman';
    if (machineName.toLowerCase().includes('foresight')) return 'foresight';
    return null;
  };

  const getBasePrice = (machineName) => {
    const bay = bays.find(b => b.name === machineName);
    if (bay) return bay.price;
    return 1000;
  };

  // Admin settings UI state
  const [adminTab, setAdminTab] = useState('bays');
  const [bayForm, setBayForm] = useState({ name: '', type: 'foresight', price: 1000 });
  const [editingBayId, setEditingBayId] = useState(null);
  const [pkgForm, setPkgForm] = useState({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' });
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: 0, expiryDate: '' });
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [coachForm, setCoachForm] = useState({ name: '', price: 1500, education: '', expertise: '', bio: '' });
  const [editingCoachId, setEditingCoachId] = useState(null);

  // Coach CRUD
  const handleSaveCoach = () => {
    if (!coachForm.name.trim()) { alert(t('alertEnterCoachName')); return; }
    if (editingCoachId) {
      setCoaches(coaches.map(c => c.id === editingCoachId ? { ...c, ...coachForm, name: coachForm.name.trim(), price: Number(coachForm.price) || 1500 } : c));
      setEditingCoachId(null);
    } else {
      setCoaches([...coaches, { ...coachForm, id: Date.now(), name: coachForm.name.trim(), price: Number(coachForm.price) || 1500, active: true }]);
    }
    setCoachForm({ name: '', price: 1500, education: '', expertise: '', bio: '' });
  };
  const handleEditCoach = (coach) => {
    setEditingCoachId(coach.id);
    setCoachForm({ name: coach.name, price: coach.price, education: coach.education || '', expertise: coach.expertise || '', bio: coach.bio || '' });
  };
  const handleToggleCoach = (id) => setCoaches(coaches.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const handleDeleteCoach = (id) => {
    if (confirm(t('alertDeleteCoach'))) setCoaches(coaches.filter(c => c.id !== id));
  };

  // Bay CRUD
  const handleSaveBay = () => {
    if (!bayForm.name.trim()) { alert(t('alertEnterBayName')); return; }
    if (editingBayId) {
      setBays(bays.map(b => b.id === editingBayId ? { ...b, name: bayForm.name.trim(), type: bayForm.type || null, price: Number(bayForm.price) || 1000 } : b));
      setEditingBayId(null);
    } else {
      setBays([...bays, { id: Date.now(), name: bayForm.name.trim(), type: bayForm.type || null, price: Number(bayForm.price) || 1000, active: true }]);
    }
    setBayForm({ name: '', type: 'foresight', price: 1000 });
  };
  const handleEditBay = (bay) => {
    setEditingBayId(bay.id);
    setBayForm({ name: bay.name, type: bay.type || '', price: bay.price });
  };
  const handleToggleBay = (id) => setBays(bays.map(b => b.id === id ? { ...b, active: !b.active } : b));
  const handleDeleteBay = (id) => {
    if (confirm(t('alertDeleteBay'))) setBays(bays.filter(b => b.id !== id));
  };

  // Package CRUD
  const handleSavePackage = () => {
    if (!pkgForm.name.trim()) { alert(t('alertEnterPkgName')); return; }
    if (editingPkgId) {
      setPackages(packages.map(p => p.id === editingPkgId ? { ...p, ...pkgForm, name: pkgForm.name.trim(), hours: Number(pkgForm.hours), price: Number(pkgForm.price) } : p));
      setEditingPkgId(null);
    } else {
      setPackages([...packages, { ...pkgForm, id: `pkg_${Date.now()}`, name: pkgForm.name.trim(), hours: Number(pkgForm.hours), price: Number(pkgForm.price), active: true }]);
    }
    setPkgForm({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' });
  };
  const handleEditPackage = (pkg) => {
    setEditingPkgId(pkg.id);
    setPkgForm({ name: pkg.name, hours: pkg.hours, price: pkg.price, machineType: pkg.machineType, highlight: pkg.highlight, save: pkg.save || '', desc: pkg.desc || '' });
  };
  const handleTogglePackage = (id) => setPackages(packages.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const handleDeletePackage = (id) => {
    if (confirm(t('alertDeletePkg'))) setPackages(packages.filter(p => p.id !== id));
  };

  // Promo CRUD
  const handleSavePromo = () => {
    if (!promoForm.code.trim()) { alert(t('alertEnterPromoCode')); return; }
    if (editingPromoId) {
      setPromoCodes(promoCodes.map(p => p.id === editingPromoId ? { ...p, ...promoForm, code: promoForm.code.trim().toUpperCase(), value: Number(promoForm.value) } : p));
      setEditingPromoId(null);
    } else {
      setPromoCodes([...promoCodes, { ...promoForm, id: Date.now(), code: promoForm.code.trim().toUpperCase(), value: Number(promoForm.value), active: true }]);
    }
    setPromoForm({ code: '', type: 'percent', value: 0, expiryDate: '' });
  };
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo.id);
    setPromoForm({ code: promo.code, type: promo.type, value: promo.value, expiryDate: promo.expiryDate || '' });
  };
  const handleTogglePromo = (id) => setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const handleDeletePromo = (id) => {
    if (confirm(t('alertDeletePromo'))) setPromoCodes(promoCodes.filter(p => p.id !== id));
  };

  // Coach profile modal
  const [viewingCoach, setViewingCoach] = useState(null);

  // Avatar upload helper
  const handleAvatarUpload = (file, callback) => {
    if (!file) return;
    if (file.size > 500000) { alert(t('alertImageTooLarge')); return; }
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  // Update current user avatar
  const handleUserAvatarChange = (file) => {
    handleAvatarUpload(file, (dataUrl) => {
      setCurrentUser({ ...currentUser, avatar: dataUrl });
      setAppUsers(appUsers.map(u => u.id === currentUser.id ? { ...u, avatar: dataUrl } : u));
    });
  };

  // Update coach avatar (admin)
  const handleCoachAvatarUpload = (coachId, file) => {
    handleAvatarUpload(file, (dataUrl) => {
      setCoaches(coaches.map(c => c.id === coachId ? { ...c, avatar: dataUrl } : c));
    });
  };

  // Avatar component
  const Avatar = ({ src, name, size = 40, className = '' }) => {
    if (src) {
      return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
    }
    const initials = (name || '?').charAt(0);
    return (
      <div className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium ${className}`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {initials}
      </div>
    );
  };

  // ---------------- AUTH STATE ----------------
  const [appUsers, setAppUsers] = useState([
    { id: 1, name: 'Admin', phone: '0999999999', password: '1234', role: 'admin', coachName: '', avatar: '' },
    { id: 2, name: 'โค้ชเอ', phone: '0811111111', password: '1234', role: 'coach', coachName: 'โค้ชเอ', avatar: '' },
    { id: 3, name: 'โค้ชบี', phone: '0822222222', password: '1234', role: 'coach', coachName: 'โค้ชบี', avatar: '' },
    { id: 4, name: 'โค้ชซี', phone: '0833333333', password: '1234', role: 'coach', coachName: 'โค้ชซี', avatar: '' },
    { id: 5, name: 'คุณสมชาย', phone: '0812345678', password: '1234', role: 'customer', coachName: '', avatar: '' },
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
  const selectedRoleCoach = currentUser?.coachName || (coachNames[0] || '');

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
  const [selectedPackage, setSelectedPackage] = useState(DEFAULT_PACKAGES[1]);

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
    return activeCoaches.map(c => ({
      ...c,
      busy: isCoachBusy(c.name, date, time, excludeBookingId),
    }));
  };

  // Get coach's full schedule for a given date
  const getCoachDaySchedule = (coachName, date) => {
    return bookings.filter(b =>
      b.withCoach && b.coachName === coachName && b.date === date && b.status !== 'no-show'
    ).sort((a, b) => a.time.localeCompare(b.time));
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
      alert(t('alertPromoNoQuota'));
      return;
    }
    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : 1000;
    const coachP = withCoach && selectedCoach ? getCoachPrice(selectedCoach) : 0;
    const foundPromo = promoCodes.find(p => p.code === promoCode.trim().toUpperCase() && p.active);
    if (!foundPromo) {
      setDiscountAmount(0);
      alert(t('alertPromoInvalid'));
      return;
    }
    if (foundPromo.expiryDate && new Date(foundPromo.expiryDate) < new Date()) {
      setDiscountAmount(0);
      alert(t('alertPromoExpired'));
      return;
    }
    if (foundPromo.type === 'percent') {
      const subtotal = basePrice + coachP;
      setDiscountAmount(subtotal * (foundPromo.value / 100));
      alert(`${t('alertPromoSuccessPercent')} ${foundPromo.value}%`);
    } else {
      setDiscountAmount(foundPromo.value);
      alert(`${t('alertPromoSuccessFixed')} ${foundPromo.value.toLocaleString()} ${t('bahtUnit')}`);
    }
  };

  const openBookingModal = (machine, time) => {
    setSelectedSlot({ machine, time });
    setSelectedTime(time);
    setWithCoach(false);
    setSelectedCoach('');
    setPromoCode('');
    setDiscountAmount(0);
    setUseMemberQuota(false);
    setFoundMember(null);

    // Auto-fill for logged-in customers
    if (role === 'customer' && currentUser) {
      const myPhone = currentUser.phone;
      setPhone(myPhone);
      setCustomerName(currentUser.name);
      setLineId('');
      setEmail('');
      const member = members.find(m => m.phone === myPhone);
      if (member) {
        setFoundMember(member);
        setCustomerName(member.name);
        setLineId(member.lineId || '');
        setEmail(member.email || '');
        const machineType = getMachineType(machine);
        if (machineType && getMemberHoursForMachine(member, machine) > 0) {
          setUseMemberQuota(true);
        }
      }
    } else {
      setCustomerName('');
      setPhone('');
      setLineId('');
      setEmail('');
    }
    setIsModalOpen(true);
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert(t('alertFillNamePhone'));
      return;
    }

    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : 1000;

    // Validate member quota usage
    if (useMemberQuota && foundMember && selectedSlot) {
      const machineType = getMachineType(selectedSlot.machine);
      if (!machineType) {
        alert(t('alertBayNoMember'));
        setUseMemberQuota(false);
        return;
      }
      const availableHours = getMemberHoursForMachine(foundMember, selectedSlot.machine);
      if (availableHours <= 0) {
        alert(`${machineType === 'trackman' ? 'Trackman' : 'Foresight'} ${t('alertHoursUsedUp')}`);
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
        alert(`${bookingCoach} ${t('alertCourseCoachBusy')}`);
        return;
      }
    } else if (withCoach && selectedCoach) {
      // Bay booking with optional coach add-on
      bookingCoach = selectedCoach;
      coachPrice = getCoachPrice(selectedCoach);
      if (isCoachBusy(selectedCoach, currentDate, selectedTime)) {
        alert(`${selectedCoach} ${t('alertCoachBusy')}`);
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
        alert(t('alertMemberBookingSuccess'));
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
      alert(`${t('alertCalendarSent')} ${bookingData.email} ${t('alertCalendarSentSuffix')}`);
    }
  };

  // ---------------- PACKAGE PURCHASE LOGIC ----------------
  const openPackageModal = (pkg) => {
    setSelectedPackage(pkg);
    setPkgCoach('');

    // Auto-fill for logged-in customers
    if (role === 'customer' && currentUser) {
      setPkgPhone(currentUser.phone);
      setPkgName(currentUser.name);
      const member = members.find(m => m.phone === currentUser.phone);
      if (member) {
        setPkgEmail(member.email || '');
        setPkgLineId(member.lineId || '');
      } else {
        setPkgEmail('');
        setPkgLineId('');
      }
    } else {
      setPkgPhone('');
      setPkgName('');
      setPkgEmail('');
      setPkgLineId('');
    }
    setIsPackageModalOpen(true);
  };

  const handleBuyPackage = (e) => {
    e.preventDefault();
    if (!pkgPhone.trim() || !pkgName.trim()) {
      alert(t('alertFillNamePhonePkg'));
      return;
    }
    if (!pkgCoach) {
      alert(t('alertSelectCoach'));
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
    alert(`${t('alertPkgSuccess')} ${data.package.name} ${t('alertPkgSuccessSuffix')} ${coachName} • ${t('alertPkgAddedHours')} ${pkg.hours} ${t('hrsUnit')} ${machineType === 'trackman' ? 'Trackman' : 'Foresight'} ${t('alertPkgAddedSuffix')}`);
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
      alert(t('alertCustomerCannotEdit'));
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
      alert(`${manageCoach} ${t('alertCoachBusyManage')} (${selectedBooking.time}) ${t('alertChooseAnotherCoach')}`);
      return;
    }
    setBookings(bookings.map(b =>
      b.id === selectedBooking.id ? { ...b, coachName: manageCoach, withCoach: manageCoach ? true : b.withCoach } : b
    ));
    setSelectedBooking({ ...selectedBooking, coachName: manageCoach, withCoach: manageCoach ? true : selectedBooking.withCoach });
    alert(t('alertCoachSaved'));
  };

  const handleCancelBooking = (booking) => {
    if (confirm(t('alertConfirmCancel'))) {
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
    const headers = [t('csvId'), t('csvDate'), t('csvTime'), t('csvMachine'), t('csvCustomer'), t('csvPhone'), t('csvCoach'), t('csvCoachName'), t('csvMemberQuota'), t('csvStatus'), t('csvDiscount'), t('csvNetAmount')];
    const rows = data.map(b => [
      b.id, b.date, b.time, b.machine, b.customerName, b.phone,
      b.withCoach ? t('csvHasCoach') : t('csvNoCoach'), b.coachName || '-', b.usedQuota ? t('csvDeductHours') : t('csvNormalPay'), b.status, b.discount, b.price
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
  const formatDateDisplay = (dateStr) => new Date(dateStr).toLocaleDateString(currentLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatMonthDisplay = (dateObj) => dateObj.toLocaleDateString(currentLocale, { year: 'numeric', month: 'long' });

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
    const byBay = activeBayNames.map(machine => {
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
  const currentBasePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : 1000;
  const currentMachineType = selectedSlot ? getMachineType(selectedSlot.machine) : null;

  // Check if member can use quota on selected machine
  const canUseMemberQuota = foundMember && selectedSlot && currentMachineType && getMemberHoursForMachine(foundMember, selectedSlot.machine) > 0;

  const activePackages = packages.filter(p => p.active !== false);
  const trackmanPackages = activePackages.filter(p => p.machineType === 'trackman');
  const foresightPackages = activePackages.filter(p => p.machineType === 'foresight');

  // ---------------- AUTH HANDLERS ----------------
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const user = appUsers.find(u => u.phone === authPhone.trim() && u.password === authPassword);
    if (!user) {
      setAuthError(t('errPhoneOrPassword'));
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
      setAuthError(t('errFillAll'));
      return;
    }
    if (authPassword.length < 4) {
      setAuthError(t('errPasswordMin'));
      return;
    }
    if (appUsers.some(u => u.phone === authPhone.trim())) {
      setAuthError(t('errPhoneUsed'));
      return;
    }
    if (authRole === 'coach' && !authCoachName.trim()) {
      setAuthError(t('errEnterCoachName'));
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
          {/* Language Switcher */}
          <div className="flex justify-center gap-1 mb-4">
            {[{ key: 'th', label: 'TH' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JP' }].map(l => (
              <button key={l.key} onClick={() => setLang(l.key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${lang === l.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-gray-300'}`}>{l.label}</button>
            ))}
          </div>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#FF7A05] to-[#ff9a3c] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Monitor size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Golf Simulator</h1>
            <p className="text-gray-400 text-sm mt-1">{t('systemSubtitle')}</p>
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
                <LogIn size={16} /> {t('login')}
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus size={16} /> {t('register')}
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Phone size={14} /> {t('phone')}
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
                    <Lock size={14} /> {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder={t('enterPassword')}
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
                  <LogIn size={18} /> {t('login')}
                </button>

                {/* Demo accounts info */}
                <div className="bg-gray-50/80 ring-1 ring-gray-100 rounded-xl p-4 mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">{t('demoAccounts')}</p>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><Shield size={11} className="text-gray-600" /> Admin</span><span className="font-mono text-gray-600">0999999999</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><GraduationCap size={11} className="text-purple-500" /> โค้ชเอ</span><span className="font-mono text-gray-600">0811111111</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><GraduationCap size={11} className="text-purple-500" /> โค้ชบี</span><span className="font-mono text-gray-600">0822222222</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1.5"><UserCircle size={11} className="text-[#FF7A05]" /> {`คุณสมชาย (${t('customerLabel')})`}</span><span className="font-mono text-gray-600">0812345678</span></div>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <User size={14} /> {t('fullName')}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder={t('enterFullName')}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                    <Phone size={14} /> {t('phone')}
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
                    <Lock size={14} /> {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder={t('setPassword')}
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
                  <label className="text-gray-600 text-sm font-medium mb-2 block">{t('accountType')}</label>
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
                      {t('customer')}
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
                      {t('coach')}
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
                      {t('admin')}
                    </button>
                  </div>
                </div>

                {/* Coach Name (only for coach role) */}
                {authRole === 'coach' && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <GraduationCap size={14} /> {t('coachNameLabel')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={authCoachName}
                      onChange={(e) => setAuthCoachName(e.target.value)}
                      placeholder={t('coachNamePlaceholder')}
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
                  <UserPlus size={18} /> {t('register')}
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
        <div className="flex justify-end mb-1 gap-2">
          <div className="bg-white rounded-full shadow-sm ring-1 ring-gray-200 p-1 flex items-center gap-0.5">
            {[{ key: 'th', label: 'TH' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JP' }].map(l => (
              <button key={l.key} onClick={() => setLang(l.key)} className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${lang === l.key ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}>{l.label}</button>
            ))}
          </div>
          <div className="bg-white rounded-full shadow-sm ring-1 ring-gray-200 p-1 flex items-center gap-1">
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer group ${
              role === 'admin' ? 'bg-gray-900 text-white' :
              role === 'coach' ? 'bg-purple-600 text-white' :
              'bg-[#FF7A05] text-white'
            }`}>
              <div className="relative">
                <Avatar src={currentUser.avatar} name={currentUser.name} size={26} className="ring-2 ring-white/30" />
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                  <Camera size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span>{currentUser.name}</span>
              {role === 'coach' && <span className="text-white/70 text-xs">({selectedRoleCoach})</span>}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUserAvatarChange(e.target.files[0])} />
            </label>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={15} /> {t('logout')}
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
                    : <span className="text-[#FF7A05] font-medium">{t('hello')} {currentUser.name}</span>
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
              <Clock size={16} /> {t('daily')}
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays size={16} /> {t('calendar')}
            </button>
            {role !== 'coach' && (
              <button
                onClick={() => setViewMode('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'members'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users size={16} /> {t('membersAndCourses')}
              </button>
            )}
            {role === 'coach' && (
              <button
                onClick={() => setViewMode('coach-schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'coach-schedule'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap size={16} /> {t('coachSchedule')}
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
                <BarChart3 size={16} /> {t('dashboard')}
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
                <FileText size={16} /> {t('reports')}
              </button>
            )}
            {role === 'admin' && (
              <button
                onClick={() => setViewMode('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'settings'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={16} /> {t('settings')}
              </button>
            )}
          </div>
        </div>

        {/* ----------------- DAILY VIEW ----------------- */}
        {viewMode === 'daily' && (
          <div className="space-y-4">

            {/* Customer Course Hours Banner */}
            {role === 'customer' && currentUser && (() => {
              const myMember = members.find(m => m.phone === currentUser.phone);
              if (!myMember) return null;
              const hasTrackman = myMember.trackmanBought > 0;
              const hasForesight = myMember.foresightBought > 0;
              if (!hasTrackman && !hasForesight) return null;
              return (
                <div className="card px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Award size={16} className="text-gray-400" /> {t('myCourses')}
                    </span>
                    <button onClick={() => setViewMode('members')} className="text-xs text-gray-400 hover:text-gray-600 underline">{t('buyPackage')}</button>
                  </div>
                  <div className={`grid gap-4 ${hasTrackman && hasForesight ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasTrackman && (
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#111827" strokeWidth="3"
                              strokeDasharray={`${Math.min(100, (myMember.trackmanHours / myMember.trackmanBought) * 100)} 100`}
                              strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">{myMember.trackmanHours}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Trackman</div>
                          <div className="text-xs text-gray-400">{myMember.trackmanHours} / {myMember.trackmanBought} {t('hoursUnit')}</div>
                          {myMember.trackmanCoach && <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><GraduationCap size={10} /> {myMember.trackmanCoach}</div>}
                        </div>
                      </div>
                    )}
                    {hasForesight && (
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#111827" strokeWidth="3"
                              strokeDasharray={`${Math.min(100, (myMember.foresightHours / myMember.foresightBought) * 100)} 100`}
                              strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">{myMember.foresightHours}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Foresight</div>
                          <div className="text-xs text-gray-400">{myMember.foresightHours} / {myMember.foresightBought} {t('hoursUnit')}</div>
                          {myMember.foresightCoach && <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><GraduationCap size={10} /> {myMember.foresightCoach}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Date Navigation */}
            <div className="flex items-center justify-between card px-5 py-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft size={20} /> <span className="hidden md:inline text-sm">{t('prevDay')}</span>
              </button>
              <div className="flex items-center gap-2.5 text-gray-800 font-medium text-base">
                <Calendar size={18} className="text-[#FF7A05]" />
                {formatDateDisplay(currentDate)}
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 flex items-center gap-1 font-medium transition-colors"
              >
                <span className="hidden md:inline text-sm">{t('nextDay')}</span> <ChevronRight size={20} />
              </button>
            </div>

            {/* Booking Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3.5 font-medium text-gray-500 text-sm w-32 border-r border-gray-100 text-center sticky left-0 bg-white z-10">
                        <Clock size={14} className="inline mr-1.5 -mt-0.5"/> {t('time')}
                      </th>
                      {activeBayNames.map((machine) => (
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
                        {activeBayNames.map((machine) => {
                          const booking = getBooking(machine, time);
                          return (
                            <td key={`${machine}-${time}`} className="p-2 text-center">
                              {booking ? (
                                <div
                                  onClick={() => openManageModal(booking)}
                                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 group relative min-h-[66px] cursor-pointer ${
                                    role === 'admin'
                                      ? getStatusColor(booking.status)
                                      : currentUser && booking.phone === currentUser.phone
                                        ? 'bg-emerald-50 ring-1 ring-emerald-200 cursor-default'
                                        : 'bg-gray-50 ring-1 ring-gray-100 cursor-default opacity-60'
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
                                          {booking.status === 'booked' ? t('statusBooked') : booking.status === 'checked-in' ? t('statusCheckedIn') : t('statusNoShow')}
                                        </span>
                                        {booking.usedQuota && <span className="badge badge-member text-[10px]"><Award size={10}/> Member</span>}
                                        {booking.withCoach && <span className="badge badge-coach text-[10px]"><GraduationCap size={10} /> {booking.coachName || t('coach')}</span>}
                                      </div>
                                    </>
                                  ) : (
                                    currentUser && booking.phone === currentUser.phone ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-emerald-600 font-medium text-sm">{t('myBooking')}</span>
                                        <span className="text-[10px] text-gray-400">{booking.time.split(' - ')[0]}</span>
                                        {booking.withCoach && <span className="badge badge-coach text-[10px]"><GraduationCap size={10} /> {booking.coachName || t('hasCoach')}</span>}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-gray-300 font-medium text-sm">{t('notAvailable')}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div
                                  onClick={() => openBookingModal(machine, time)}
                                  className="slot-available p-2.5 group"
                                >
                                  <span className="text-sm font-medium group-hover:hidden">{t('available')}</span>
                                  <span className="text-sm font-medium hidden group-hover:block">{t('book')}</span>
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
                <h2 className="text-lg font-semibold text-gray-900">{t('trackmanCourses')}</h2>
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
                          {t('popular')}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-3xl font-semibold text-gray-900">฿{pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 text-gray-500 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> {t('courseHours')} {pkg.hours} {t('hours')}</li>
                        <li className="flex items-center gap-2"><GraduationCap size={15} className="text-purple-500"/> {t('coachIncluded')}</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> {t('useForTrackman')}</li>
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
                      {t('buyPackage')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Foresight Package Cards */}
            <div className="card p-6">
              <div className="mb-6 flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-[#FF7A05]" />
                <h2 className="text-lg font-semibold text-gray-900">{t('foresightCourses')}</h2>
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
                          {t('popular')}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-end gap-1 mb-4">
                        <span className="text-3xl font-semibold text-gray-900">฿{pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 text-gray-500 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> {t('courseHours')} {pkg.hours} {t('hours')}</li>
                        <li className="flex items-center gap-2"><GraduationCap size={15} className="text-purple-500"/> {t('coachIncluded')}</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#FF7A05]"/> {t('useForForesight')}</li>
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
                      {t('buyPackage')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Members Table */}
            {role === 'admin' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-gray-400"/> {t('memberListTitle')}
                </h2>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">{t('customerName')}</th>
                        <th className="px-4 py-3 font-medium">{t('contactPhone')}</th>
                        <th className="px-4 py-3 font-medium">{t('lineEmail')}</th>
                        <th className="px-4 py-3 font-medium text-center">{t('trackmanRemBought')}</th>
                        <th className="px-4 py-3 font-medium text-center">{t('foresightRemBought')}</th>
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
                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">{t('noMembers')}</td></tr>
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
              <h2 className="text-lg font-semibold text-gray-900">{t('dashboardTitle')}</h2>
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
                  <h3 className="text-gray-500 text-sm font-medium">{t('bookingsToday')}</h3>
                </div>
                <div className="text-3xl font-semibold text-gray-900">{dashboardStats.today.total} <span className="text-base font-normal text-gray-400">{t('items')}</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{t('checkinToday')}</h3>
                </div>
                <div className="text-3xl font-semibold text-emerald-600">{dashboardStats.today.checkedIn} <span className="text-base font-normal text-gray-400">{t('people')}</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <XCircle size={18} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{t('noShowToday')}</h3>
                </div>
                <div className="text-3xl font-semibold text-gray-500">{dashboardStats.today.noShow} <span className="text-base font-normal text-gray-400">คน</span></div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#FF7A05]" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{t('expectedRevenue')}</h3>
                </div>
                <div className="text-3xl font-semibold text-[#FF7A05]">฿{dashboardStats.today.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Coach Schedule View */}
        {viewMode === 'coach-schedule' && role === 'coach' && (
          <div className="space-y-5">

            {/* Next Up Alert */}
            {(() => {
              const nextBooking = coachSchedule.today.find(b => b.status === 'booked') || coachSchedule.upcoming[0];
              if (!nextBooking) return null;
              const isToday = nextBooking.date === getTodayString();
              return (
                <div className={`card p-4 flex items-center gap-4 ${isToday ? 'ring-2 ring-gray-900' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <span className="text-[10px] font-medium leading-none">{isToday ? t('today') : new Date(nextBooking.date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' })}</span>
                    <span className="text-sm font-bold leading-tight">{nextBooking.time.split(' - ')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-medium">{t('nextAppointment')}</div>
                    <div className="text-sm font-semibold text-gray-900">{nextBooking.customerName}</div>
                    <div className="text-xs text-gray-400">{nextBooking.machine} &middot; {nextBooking.time}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {nextBooking.phone && <a href={`tel:${nextBooking.phone}`} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"><Phone size={16} /></a>}
                  </div>
                </div>
              );
            })()}

            {/* Summary - compact */}
            <div className="grid grid-cols-4 gap-3">
              <div className="card p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900">{coachSchedule.today.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{t('todaySchedule')}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900">{coachSchedule.upcoming.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{t('nextAppointment')}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900">{coachSchedule.totalThisMonth}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{t('thisMonth')}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900">{coachSchedule.past.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{t('taughtAlready')}</div>
              </div>
            </div>

            {/* Coach Calendar */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeCoachMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronLeft size={22} className="text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {coachCalendarMonth.toLocaleDateString(currentLocale, { year: 'numeric', month: 'long' })}
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
                          <div className="text-[10px] text-purple-500 font-medium px-1.5">+{dayBookings.length - 3} {t('more')}</div>
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
                    {t('detailForDate')} {new Date(coachSelectedDate).toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                          {b.status === 'checked-in' ? t('statusCheckedIn') : t('waitingCustomer')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Schedule - Timeline */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" /> {t('todaySchedule')} &middot; {formatDateDisplay(getTodayString())}</span>
                <span className="text-xs text-gray-400 font-normal">{coachSchedule.today.length} {t('sessions')}</span>
              </h3>
              {coachSchedule.today.length > 0 ? (
                <div className="space-y-1">
                  {coachSchedule.today.map((b, i) => (
                    <div key={b.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center w-12 shrink-0">
                        <span className="text-xs font-semibold text-gray-900">{b.time.split(' - ')[0]}</span>
                        <span className="text-[10px] text-gray-300">{b.time.split(' - ')[1]}</span>
                        {i < coachSchedule.today.length - 1 && <div className="flex-1 w-px bg-gray-200 mt-1"></div>}
                      </div>
                      {/* Card */}
                      <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl mb-2 ring-1 ${
                        b.status === 'checked-in' ? 'bg-gray-50 ring-gray-200' : 'bg-white ring-gray-200'
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{b.customerName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{b.machine}</div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {b.status === 'checked-in' ? (
                            <span className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle2 size={13} /> {t('statusCheckedIn')}</span>
                          ) : (
                            <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium">{t('waitingCustomer')}</span>
                          )}
                          {b.phone && <a href={`tel:${b.phone}`} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Phone size={14} /></a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300">
                  <p className="text-sm">{t('noSessionsToday')}</p>
                </div>
              )}
            </div>

            {/* Upcoming Schedule - clean list */}
            {coachSchedule.upcoming.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>{t('nextAppointment')}</span>
                  <span className="text-xs text-gray-400 font-normal">{coachSchedule.upcoming.length} {t('sessions')}</span>
                </h3>
                <div className="space-y-2">
                  {coachSchedule.upcoming.slice(0, 10).map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-gray-100 bg-white">
                      <div className="w-10 shrink-0 text-center">
                        <div className="text-xs font-semibold text-gray-900">{new Date(b.date).toLocaleDateString(currentLocale, { day: 'numeric' })}</div>
                        <div className="text-[10px] text-gray-400">{new Date(b.date).toLocaleDateString(currentLocale, { month: 'short' })}</div>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{b.customerName}</div>
                        <div className="text-xs text-gray-400">{b.time} &middot; {b.machine}</div>
                      </div>
                      <a href={`tel:${b.phone}`} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"><Phone size={14} /></a>
                    </div>
                  ))}
                  {coachSchedule.upcoming.length > 10 && (
                    <div className="text-center text-xs text-gray-400 pt-1">+{coachSchedule.upcoming.length - 10} {t('sessions')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Past Lessons - compact */}
            {coachSchedule.past.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>{t('teachingHistory')}</span>
                  <span className="text-xs text-gray-400 font-normal">{coachSchedule.past.length} {t('sessions')}</span>
                </h3>
                <div className="space-y-1">
                  {coachSchedule.past.slice(0, 10).map(b => (
                    <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-xs text-gray-400 w-16 shrink-0">
                        {new Date(b.date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs text-gray-400 w-20 shrink-0">{b.time.split(' - ')[0]}-{b.time.split(' - ')[1]}</div>
                      <div className="flex-1 min-w-0 text-sm text-gray-600 truncate">{b.customerName}</div>
                      <div className="text-xs text-gray-300 shrink-0">{b.machine}</div>
                    </div>
                  ))}
                  {coachSchedule.past.length > 10 && (
                    <div className="text-center text-xs text-gray-400 pt-1">+{coachSchedule.past.length - 10} {t('sessions')}</div>
                  )}
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
                  <h2 className="text-lg font-semibold text-gray-900">{t('selectReportRange')}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setReportMonth(0)} className="px-3 py-1.5 text-xs font-medium bg-[#FF7A05] text-white rounded-lg hover:bg-orange-600 transition-colors">{t('thisMonthBtn')}</button>
                  <button onClick={() => setReportMonth(-1)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">{t('lastMonthBtn')}</button>
                  <button onClick={() => setReportMonth(-2)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">{t('twoMonthsAgo')}</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 font-medium">{t('fromDate')}</label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-white ring-1 ring-gray-200 rounded-lg px-3 py-2 text-sm outline-none font-medium focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 font-medium">{t('toDate')}</label>
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
                <div className="text-gray-500 text-xs font-medium mb-1">{t('totalBookings')}</div>
                <div className="text-2xl font-semibold text-gray-900">{reportData.totalBookings}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">{t('checkedIn')}</div>
                <div className="text-2xl font-semibold text-emerald-600">{reportData.checkedIn}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">{t('noShowLabel')}</div>
                <div className="text-2xl font-semibold text-gray-400">{reportData.noShow}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">{t('totalRevenue')}</div>
                <div className="text-2xl font-semibold text-[#FF7A05]">฿{reportData.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">{t('withCoach')}</div>
                <div className="text-2xl font-semibold text-purple-600">{reportData.withCoachCount}</div>
              </div>
              <div className="card p-4">
                <div className="text-gray-500 text-xs font-medium mb-1">{t('memberQuotaUsed')}</div>
                <div className="text-2xl font-semibold text-blue-600">{reportData.memberQuotaUsed}</div>
              </div>
            </div>

            {/* Per-Bay Breakdown */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Monitor size={16} className="text-gray-400" /> {t('summaryByBay')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {reportData.byBay.map(bay => (
                  <div key={bay.machine} className="bg-gray-50/80 ring-1 ring-gray-100 rounded-xl p-4">
                    <div className="font-medium text-gray-800 text-sm mb-3">{bay.machine}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bookingCount')}</span>
                        <span className="font-medium text-gray-800">{bay.total} {t('items')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('checkinCount')}</span>
                        <span className="font-medium text-emerald-600">{bay.checkedIn} คน</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-500">{t('revenue')}</span>
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
                <TrendingUp size={16} className="text-gray-400" /> {t('dailySummary')}
              </h3>
              {reportData.dailyBreakdown.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">{t('date')}</th>
                        <th className="px-4 py-3 font-medium text-center">{t('bookingCount')}</th>
                        <th className="px-4 py-3 font-medium text-center">{t('checkinCount')}</th>
                        <th className="px-4 py-3 font-medium text-center">{t('noShowCol')}</th>
                        <th className="px-4 py-3 font-medium text-right">{t('revenue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyBreakdown.map(day => (
                        <tr key={day.date} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {new Date(day.date).toLocaleDateString(currentLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">{day.total}</td>
                          <td className="px-4 py-3 text-sm text-center text-emerald-600 font-medium">{day.checkedIn}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-400">{day.noShow}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#FF7A05]">฿{day.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t('grandTotal')}</td>
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
                  <p className="text-sm">{t('noDataForRange')}</p>
                </div>
              )}
            </div>

            {/* Booking Detail Table */}
            {reportData.filtered.length > 0 && (
              <div className="card p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" /> {t('allBookings')} ({reportData.filtered.length} {t('items')})
                </h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500">
                        <th className="px-3 py-3 font-medium">{t('date')}</th>
                        <th className="px-3 py-3 font-medium">{t('timeCol')}</th>
                        <th className="px-3 py-3 font-medium">{t('machine')}</th>
                        <th className="px-3 py-3 font-medium">{t('customerCol')}</th>
                        <th className="px-3 py-3 font-medium text-center">{t('statusCol')}</th>
                        <th className="px-3 py-3 font-medium text-right">{t('amount')}</th>
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
                              {b.status === 'booked' ? t('statusBooked') : b.status === 'checked-in' ? t('statusCheckedIn') : t('statusNoShow')}
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
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center font-medium text-gray-400 text-sm pb-2">{day}</div>
              ))}
              {blanks.map(b => <div key={`b-${b}`} className="min-h-[80px] md:min-h-[100px] rounded-xl"></div>)}
              {days.map(day => {
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isToday = dateStr === getTodayString();
                const isSelected = dateStr === currentDate;

                // Customer: show only their bookings; Admin/Coach: show all
                const dayBookings = role === 'customer' && currentUser
                  ? bookings.filter(b => b.date === dateStr && b.phone === currentUser.phone && b.status !== 'no-show').sort((a, b) => a.time.localeCompare(b.time))
                  : bookings.filter(b => b.date === dateStr && b.status !== 'no-show').sort((a, b) => a.time.localeCompare(b.time));

                const hasBookings = dayBookings.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => { setCurrentDate(dateStr); setViewMode('daily'); }}
                    className={`min-h-[80px] md:min-h-[100px] flex flex-col rounded-xl p-1.5 md:p-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'ring-2 ring-[#FF7A05] bg-orange-50'
                        : hasBookings
                          ? 'ring-1 ring-gray-300 bg-white hover:ring-gray-400'
                          : isToday
                            ? 'bg-orange-50/50 ring-1 ring-orange-200'
                            : 'ring-1 ring-gray-100 hover:ring-gray-200 bg-white'
                    }`}
                  >
                    <span className={`text-sm mb-1 ${
                      isToday ? 'text-[#FF7A05] font-bold' :
                      hasBookings ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
                    }`}>
                      {day}
                    </span>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {dayBookings.slice(0, 3).map(b => {
                        const mt = getMachineType(b.machine);
                        return (
                          <div key={b.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] md:text-[11px] leading-tight ${
                            b.status === 'checked-in'
                              ? 'bg-emerald-100/80 text-emerald-800'
                              : mt === 'trackman'
                                ? 'bg-blue-100/80 text-blue-800'
                                : 'bg-amber-100/80 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              b.status === 'checked-in' ? 'bg-emerald-500' :
                              mt === 'trackman' ? 'bg-blue-500' : 'bg-amber-500'
                            }`}></span>
                            <span className="font-medium truncate">{b.time.split(' - ')[0]}</span>
                            <span className="truncate hidden md:inline text-[10px] opacity-75">{b.machine.length > 8 ? b.machine.slice(0, 8) + '..' : b.machine}</span>
                          </div>
                        );
                      })}
                      {dayBookings.length > 3 && (
                        <div className="text-[10px] text-gray-400 font-medium px-1.5">+{dayBookings.length - 3}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            {role === 'customer' && (
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Trackman
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Foresight
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {t('checkedIn')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- ADMIN SETTINGS VIEW ----------------- */}
        {viewMode === 'settings' && role === 'admin' && (
          <div className="space-y-5">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Settings size={20} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('systemSettings')}</h2>
                  <p className="text-sm text-gray-400">{t('settingsDesc')}</p>
                </div>
              </div>

              {/* Settings Tabs */}
              <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl mb-6">
                {[
                  { key: 'bays', label: t('baysTab'), icon: <Monitor size={15} /> },
                  { key: 'coaches', label: t('coachesTab'), icon: <GraduationCap size={15} /> },
                  { key: 'packages', label: t('packagesTab'), icon: <ShoppingCart size={15} /> },
                  { key: 'promos', label: t('promosTab'), icon: <Percent size={15} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAdminTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      adminTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* ========== BAYS TAB ========== */}
              {adminTab === 'bays' && (
                <div className="space-y-4">
                  {/* Add/Edit Bay Form */}
                  <div className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Plus size={15} /> {editingBayId ? t('editBay') : t('addBay')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('bayNamePlaceholder')}
                        value={bayForm.name}
                        onChange={(e) => setBayForm({ ...bayForm, name: e.target.value })}
                      />
                      <select
                        className="input-field"
                        value={bayForm.type || ''}
                        onChange={(e) => setBayForm({ ...bayForm, type: e.target.value || null })}
                      >
                        <option value="">{t('noType')}</option>
                        <option value="trackman">Trackman</option>
                        <option value="foresight">Foresight</option>
                      </select>
                      <input
                        type="number"
                        className="input-field"
                        placeholder={t('pricePerHour')}
                        value={bayForm.price}
                        onChange={(e) => setBayForm({ ...bayForm, price: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveBay} className="btn-primary px-4 py-2.5 flex-1 flex items-center justify-center gap-1.5 text-sm">
                          {editingBayId ? <Pencil size={14} /> : <Plus size={14} />}
                          {editingBayId ? t('save') : t('add')}
                        </button>
                        {editingBayId && (
                          <button onClick={() => { setEditingBayId(null); setBayForm({ name: '', type: 'foresight', price: 1000 }); }} className="btn-ghost px-3 py-2.5 text-sm">
                            {t('cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bay List */}
                  <div className="space-y-2">
                    {bays.map((bay) => (
                      <div key={bay.id} className={`flex items-center justify-between p-4 rounded-xl ring-1 transition-all ${bay.active ? 'bg-white ring-gray-200' : 'bg-gray-50 ring-gray-100 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            bay.type === 'trackman' ? 'bg-blue-100 text-blue-600' :
                            bay.type === 'foresight' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            <Monitor size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{bay.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              {bay.type && <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bay.type === 'trackman' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{bay.type === 'trackman' ? 'Trackman' : 'Foresight'}</span>}
                              <span>฿{bay.price.toLocaleString()}/ชม.</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleBay(bay.id)} className={`p-2 rounded-lg transition-colors ${bay.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {bay.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => handleEditBay(bay)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeleteBay(bay.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {bays.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noBays')}</div>}
                  </div>
                </div>
              )}

              {/* ========== COACHES TAB ========== */}
              {adminTab === 'coaches' && (
                <div className="space-y-4">
                  {/* Add/Edit Coach Form */}
                  <div className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Plus size={15} /> {editingCoachId ? t('editCoach') : t('addCoach')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('coachNamePH')}
                        value={coachForm.name}
                        onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                      />
                      <input
                        type="number"
                        className="input-field"
                        placeholder={t('pricePerHourBaht')}
                        value={coachForm.price}
                        onChange={(e) => setCoachForm({ ...coachForm, price: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('educationPH')}
                        value={coachForm.education}
                        onChange={(e) => setCoachForm({ ...coachForm, education: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('expertisePH')}
                        value={coachForm.expertise}
                        onChange={(e) => setCoachForm({ ...coachForm, expertise: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('bioPH')}
                        value={coachForm.bio}
                        onChange={(e) => setCoachForm({ ...coachForm, bio: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={handleSaveCoach} className="btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm">
                        {editingCoachId ? <Pencil size={14} /> : <Plus size={14} />}
                        {editingCoachId ? t('save') : t('addCoachBtn')}
                      </button>
                      {editingCoachId && (
                        <button onClick={() => { setEditingCoachId(null); setCoachForm({ name: '', price: 1500, education: '', expertise: '', bio: '' }); }} className="btn-ghost px-3 py-2.5 text-sm">
                          {t('cancel')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Coach List */}
                  <div className="space-y-2">
                    {coaches.map((coach) => (
                      <div key={coach.id} className={`p-4 rounded-xl ring-1 transition-all ${coach.active ? 'bg-white ring-gray-200' : 'bg-gray-50 ring-gray-100 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <label className="relative cursor-pointer group">
                              <Avatar src={coach.avatar} name={coach.name} size={40} />
                              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                <Camera size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoachAvatarUpload(coach.id, e.target.files[0])} />
                            </label>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{coach.name}</div>
                              <div className="text-xs text-gray-400">฿{coach.price.toLocaleString()}/ชม.</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleCoach(coach.id)} className={`p-2 rounded-lg transition-colors ${coach.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                              {coach.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>
                            <button onClick={() => handleEditCoach(coach)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDeleteCoach(coach.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {(coach.education || coach.expertise || coach.bio) && (
                          <div className="mt-2 ml-13 pl-[52px] text-xs text-gray-400 space-y-0.5 border-t border-gray-50 pt-2">
                            {coach.education && <div><span className="text-gray-500">{t('educationLabel')}</span> {coach.education}</div>}
                            {coach.expertise && <div><span className="text-gray-500">{t('expertiseLabel')}</span> {coach.expertise}</div>}
                            {coach.bio && <div><span className="text-gray-500">{t('bioLabel')}</span> {coach.bio}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                    {coaches.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noCoaches')}</div>}
                  </div>
                </div>
              )}

              {/* ========== PACKAGES TAB ========== */}
              {adminTab === 'packages' && (
                <div className="space-y-4">
                  {/* Add/Edit Package Form */}
                  <div className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Plus size={15} /> {editingPkgId ? t('editPkg') : t('addPkg')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('pkgNamePH')}
                        value={pkgForm.name}
                        onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      />
                      <select
                        className="input-field"
                        value={pkgForm.machineType}
                        onChange={(e) => setPkgForm({ ...pkgForm, machineType: e.target.value })}
                      >
                        <option value="trackman">Trackman</option>
                        <option value="foresight">Foresight</option>
                      </select>
                      <input
                        type="number"
                        className="input-field"
                        placeholder={t('numHours')}
                        value={pkgForm.hours}
                        onChange={(e) => setPkgForm({ ...pkgForm, hours: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="number"
                        className="input-field"
                        placeholder={t('priceBaht')}
                        value={pkgForm.price}
                        onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('savingText')}
                        value={pkgForm.save}
                        onChange={(e) => setPkgForm({ ...pkgForm, save: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('descText')}
                        value={pkgForm.desc}
                        onChange={(e) => setPkgForm({ ...pkgForm, desc: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgForm.highlight}
                          onChange={(e) => setPkgForm({ ...pkgForm, highlight: e.target.checked })}
                          className="rounded"
                        />
                        {t('showAsPopular')}
                      </label>
                      <div className="flex gap-2 ml-auto">
                        <button onClick={handleSavePackage} className="btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm">
                          {editingPkgId ? <Pencil size={14} /> : <Plus size={14} />}
                          {editingPkgId ? t('save') : t('addPkgBtn')}
                        </button>
                        {editingPkgId && (
                          <button onClick={() => { setEditingPkgId(null); setPkgForm({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' }); }} className="btn-ghost px-3 py-2.5 text-sm">
                            {t('cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package List */}
                  <div className="space-y-2">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className={`flex items-center justify-between p-4 rounded-xl ring-1 transition-all ${pkg.active !== false ? 'bg-white ring-gray-200' : 'bg-gray-50 ring-gray-100 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pkg.machineType === 'trackman' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <ShoppingCart size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                              {pkg.name}
                              {pkg.highlight && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">{t('popular')}</span>}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <span>{pkg.hours} ชม.</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${pkg.machineType === 'trackman' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{pkg.machineType === 'trackman' ? 'Trackman' : 'Foresight'}</span>
                              <span className="font-semibold text-gray-600">฿{pkg.price.toLocaleString()}</span>
                              {pkg.save && <span className="text-emerald-500">{pkg.save}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleTogglePackage(pkg.id)} className={`p-2 rounded-lg transition-colors ${pkg.active !== false ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {pkg.active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => handleEditPackage(pkg)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeletePackage(pkg.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {packages.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noPackages')}</div>}
                  </div>
                </div>
              )}

              {/* ========== PROMOS TAB ========== */}
              {adminTab === 'promos' && (
                <div className="space-y-4">
                  {/* Add/Edit Promo Form */}
                  <div className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Plus size={15} /> {editingPromoId ? t('editPromo') : t('addPromo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        className="input-field uppercase"
                        placeholder={t('promoCodePH')}
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                      />
                      <select
                        className="input-field"
                        value={promoForm.type}
                        onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                      >
                        <option value="percent">{t('discountPercent')}</option>
                        <option value="fixed">{t('discountFixed')}</option>
                      </select>
                      <input
                        type="number"
                        className="input-field"
                        placeholder={promoForm.type === 'percent' ? t('discountPercentPH') : t('discountFixedPH')}
                        value={promoForm.value}
                        onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                      />
                      <input
                        type="date"
                        className="input-field"
                        value={promoForm.expiryDate}
                        onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                        title={t('expiryDate')}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">{t('expiryDate')}</span>
                      <div className="flex gap-2 ml-auto">
                        <button onClick={handleSavePromo} className="btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm">
                          {editingPromoId ? <Pencil size={14} /> : <Plus size={14} />}
                          {editingPromoId ? t('save') : t('addPromoBtn')}
                        </button>
                        {editingPromoId && (
                          <button onClick={() => { setEditingPromoId(null); setPromoForm({ code: '', type: 'percent', value: 0, expiryDate: '' }); }} className="btn-ghost px-3 py-2.5 text-sm">
                            {t('cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Promo List */}
                  <div className="space-y-2">
                    {promoCodes.map((promo) => (
                      <div key={promo.id} className={`flex items-center justify-between p-4 rounded-xl ring-1 transition-all ${promo.active ? 'bg-white ring-gray-200' : 'bg-gray-50 ring-gray-100 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Tag size={16} />
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-gray-900 text-sm">{promo.code}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <span className="font-medium text-[#FF7A05]">
                                {promo.type === 'percent' ? `ลด ${promo.value}%` : `ลด ฿${promo.value.toLocaleString()}`}
                              </span>
                              {promo.expiryDate ? (
                                <span className={new Date(promo.expiryDate) < new Date() ? 'text-red-500' : 'text-gray-400'}>
                                  {t('expired')} {new Date(promo.expiryDate).toLocaleDateString(currentLocale)}
                                  {new Date(promo.expiryDate) < new Date() && ' ' + t('alreadyExpired')}
                                </span>
                              ) : (
                                <span>{t('noExpiry')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleTogglePromo(promo.id)} className={`p-2 rounded-lg transition-colors ${promo.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {promo.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => handleEditPromo(promo)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeletePromo(promo.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {promoCodes.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noPromos')}</div>}
                  </div>
                </div>
              )}
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
              <h2 className="text-lg font-semibold text-gray-900">{t('manageBooking')}</h2>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl mb-5 space-y-2.5 text-sm ring-1 ring-gray-100">
              <p className="flex justify-between"><span className="text-gray-500">{t('customerNameLabel')}</span> <span className="font-medium text-gray-800">{selectedBooking.customerName}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">{t('phoneLabel')}</span> <span className="font-medium text-gray-800">{selectedBooking.phone}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">{t('timeLabel')}</span> <span className="font-medium text-gray-800">{selectedBooking.time}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">{t('machineLabel')}</span> <span className="font-medium text-gray-800">{selectedBooking.machine}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">{t('paymentMethod')}</span> {selectedBooking.usedQuota ? <span className="font-medium text-blue-600">{t('memberQuotaDeduct')}</span> : <span className="font-medium text-gray-800">{t('normalPayment')}</span>}</p>
              {selectedBooking.coachName && (
                <p className="flex justify-between"><span className="text-gray-500">{t('coachLabel')}</span> <span className="font-medium text-purple-600">{selectedBooking.coachName}</span></p>
              )}
              <div className="flex justify-between items-center border-t border-gray-200 pt-2.5 mt-2.5">
                <span className="text-gray-500">{t('netTotal')}</span>
                <span className="text-lg font-semibold text-[#FF7A05]">฿{selectedBooking.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Coach Assignment */}
            <div className="bg-purple-50/60 ring-1 ring-purple-100 p-4 rounded-xl mb-5">
              <label className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-2">
                <GraduationCap size={15}/> {t('assignCoach')}
              </label>
              <div className="space-y-2 mb-3">
                <label
                  className={`flex items-center justify-between p-2.5 rounded-lg ring-1 cursor-pointer transition-all ${
                    manageCoach === '' ? 'ring-2 ring-gray-400 bg-gray-50' : 'ring-gray-200 bg-white hover:ring-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input type="radio" name="manageCoach" value="" checked={manageCoach === ''} onChange={() => setManageCoach('')} className="w-3.5 h-3.5 accent-gray-600" />
                    <span className="text-sm text-gray-600">{t('noCoach')}</span>
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
                      {c.busy && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{t('busy')}</span>}
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
                {t('saveCoach')}
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedBooking.status === 'booked' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'checked-in')}
                  className="w-full py-3 btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> {t('confirmCheckin')}
                </button>
              )}
              {selectedBooking.status === 'booked' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'no-show')}
                  className="w-full py-3 btn-secondary flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> {t('confirmNoShow')}
                </button>
              )}
              <button
                onClick={() => handleCancelBooking(selectedBooking)}
                className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-xl flex items-center justify-center gap-2 mt-3 transition-colors"
              >
                {t('deleteBooking')}
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
                {role === 'admin' ? t('addBookingAdmin') : t('bookGolf')}
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
                <Calendar size={15} className="text-[#FF7A05]"/> <span className="text-gray-500">{t('dateLabel')}</span> <span className="font-medium">{formatDateDisplay(currentDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Monitor size={15} className="text-[#FF7A05]"/> <span className="text-gray-500">{t('machineColonLabel')}</span> <span className="font-medium">{selectedSlot?.machine}</span>
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

                {/* Logged-in customer: show account info */}
                {role === 'customer' && currentUser ? (
                  <div className="rounded-xl ring-1 ring-gray-200 p-3.5 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <Avatar src={currentUser.avatar} name={currentUser.name} size={36} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-400">{currentUser.phone}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Phone */}
                    <div>
                      <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                        <Phone size={14}/> {t('phoneAutoCheck')}
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
                  </>
                )}

                {/* Member Info */}
                {foundMember && (
                  <div className="rounded-xl ring-1 ring-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                      <span className="text-gray-700 font-medium text-sm flex items-center gap-1.5"><Award size={14}/> {t('memberCourseRights')}</span>
                    </div>

                    {/* Hours Summary */}
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      <div className="px-4 py-3">
                        <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Trackman</div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-semibold ${foundMember.trackmanHours > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{foundMember.trackmanHours}</span>
                          <span className="text-xs text-gray-400">/ {foundMember.trackmanBought} {t('hrsUnit')}</span>
                        </div>
                        {foundMember.trackmanCoach && (
                          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><GraduationCap size={10}/> {foundMember.trackmanCoach}</div>
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Foresight</div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-semibold ${foundMember.foresightHours > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{foundMember.foresightHours}</span>
                          <span className="text-xs text-gray-400">/ {foundMember.foresightBought} {t('hrsUnit')}</span>
                        </div>
                        {foundMember.foresightCoach && (
                          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><GraduationCap size={10}/> {foundMember.foresightCoach}</div>
                        )}
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                      {currentMachineType ? (
                        canUseMemberQuota ? (
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 select-none">
                              <input type="checkbox" className="w-4 h-4 rounded accent-gray-900" checked={useMemberQuota} onChange={(e) => { setUseMemberQuota(e.target.checked); if(e.target.checked) { setWithCoach(false); setSelectedCoach(''); } }} />
                              <span>{t('useMemberRight')} {currentMachineType === 'trackman' ? 'Trackman' : 'Foresight'} <span className="text-gray-400 text-xs">{t('includesCoach')}</span></span>
                            </label>
                            {useMemberQuota && getMemberCoachForMachine(foundMember, selectedSlot.machine) && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 pl-7">
                                <GraduationCap size={13} className="text-gray-400" />
                                {t('courseCoach')} <span className="font-medium">{getMemberCoachForMachine(foundMember, selectedSlot.machine)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">{currentMachineType === 'trackman' ? 'Trackman' : 'Foresight'} {t('hoursUsedUpShort')} <button type="button" onClick={() => setViewMode('members')} className="underline text-gray-700 hover:text-gray-900">{t('buyCourseMore')}</button></p>
                        )
                      ) : (
                        <p className="text-sm text-gray-400">{t('bayNoMemberSupport')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Name / Line / Email - only show for admin/coach (walk-in) */}
                {role !== 'customer' && (
                  <>
                    <div>
                      <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                        <User size={14}/> {t('customerNameField')}
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                          <MessageCircle size={14}/> Line ID
                        </label>
                        <input type="text" className="input-field" value={lineId} onChange={(e) => setLineId(e.target.value)} />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                          <Mail size={14}/> {t('email')}
                        </label>
                        <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {/* Promo Code */}
                {!useMemberQuota && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <Tag size={14}/> {t('promoCodeLabel')}
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
                        {t('applyCode')}
                      </button>
                    </div>
                    {discountAmount > 0 && <p className="text-[#FF7A05] text-xs mt-1.5 font-medium">{t('discountLabel')} ฿{discountAmount}</p>}
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
                      <GraduationCap size={16} className="text-purple-500" /> {t('addCoachExtra')}
                    </label>
                  </div>
                  {withCoach && (
                    <div>
                      <label className="text-gray-600 text-sm font-medium mb-1.5 block">{t('selectCoach')}</label>
                      <div className="space-y-2">
                        {getAvailableCoaches(currentDate, selectedTime).map(c => {
                          const info = getCoachInfo(c.name);
                          const daySchedule = getCoachDaySchedule(c.name, currentDate);
                          return (
                          <label
                            key={c.name}
                            className={`block rounded-xl ring-1 cursor-pointer transition-all overflow-hidden ${
                              c.busy
                                ? 'ring-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : selectedCoach === c.name
                                  ? 'ring-2 ring-gray-900 bg-gray-50'
                                  : 'ring-gray-200 bg-white hover:ring-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 p-3">
                              <input
                                type="radio"
                                name="coach"
                                value={c.name}
                                checked={selectedCoach === c.name}
                                disabled={c.busy}
                                onChange={(e) => setSelectedCoach(e.target.value)}
                                className="w-4 h-4 accent-gray-900 shrink-0"
                              />
                              <Avatar src={info?.avatar} name={c.name} size={36} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                  {c.busy && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{t('busy')}</span>}
                                </div>
                                {info?.expertise && <div className="text-xs text-gray-400 truncate">{info.expertise}</div>}
                              </div>
                              <div className="shrink-0 text-right flex flex-col items-end gap-1">
                                <span className={`text-sm font-semibold ${c.busy ? 'text-gray-300' : 'text-gray-900'}`}>+฿{c.price.toLocaleString()}</span>
                                {info && (
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingCoach(info); }} className="text-[11px] text-gray-400 hover:text-gray-600 underline">{t('viewProfile')}</button>
                                )}
                              </div>
                            </div>
                            {/* Coach day schedule */}
                            {daySchedule.length > 0 && (
                              <div className="border-t border-gray-100 px-3 py-2 bg-gray-50/50">
                                <div className="text-[10px] text-gray-400 mb-1.5">{t('todayScheduleOf')} {c.name}</div>
                                <div className="flex flex-wrap gap-1">
                                  {daySchedule.map(b => (
                                    <span key={b.id} className="inline-flex items-center gap-1 text-[10px] bg-white ring-1 ring-gray-200 px-1.5 py-0.5 rounded">
                                      <span className="font-medium text-gray-700">{b.time.split(' - ')[0]}</span>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-gray-400 truncate max-w-[80px]">{b.machine}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {daySchedule.length === 0 && !c.busy && (
                              <div className="border-t border-gray-100 px-3 py-1.5 bg-gray-50/50">
                                <span className="text-[10px] text-gray-300">{t('freeAllDay')}</span>
                              </div>
                            )}
                          </label>
                          );
                        })}
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
                          <span className="text-gray-500">{t('memberCourse')} ({selectedSlot?.machine})</span>
                          <span className="font-medium text-emerald-600">{t('machineAndCoachIncluded')}</span>
                        </div>
                        {memberCoach && (
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">{t('assignedCoach')}</span>
                            <span className="font-medium text-purple-600">{memberCoach}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="font-medium text-gray-800">{t('totalLabel')}</span>
                          <span className="font-semibold text-emerald-600 text-lg">฿0 {t('useCourseRight')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">{t('machineFee')} ({selectedSlot?.machine})</span>
                          <span className="font-medium text-gray-800">฿{currentBasePrice.toLocaleString()}</span>
                        </div>
                        {withCoach && selectedCoach && (
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">{t('coachFee')} ({selectedCoach})</span>
                            <span className="font-medium text-gray-800">+฿{selectedCoachPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between mb-1 text-red-500">
                            <span>{t('discount')}</span>
                            <span className="font-medium">-฿{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                          <span className="font-medium text-gray-800">{t('totalLabel')}</span>
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
                  {t('cancel')}
                </button>
                <button type="submit" className="flex-1 py-3 btn-primary">
                  {role === 'admin' ? t('confirmBooking') : (useMemberQuota && !withCoach ? t('confirmUseRight') : t('goToPayment'))}
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
                <ShoppingCart size={20} className="text-[#FF7A05]"/> {t('buyCourseTitle')}
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
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium ring-1 ring-purple-200">{t('coachFeeIncluded')}</span>
              <h3 className="text-gray-900 font-semibold text-lg mt-2">{selectedPackage.name}</h3>
              <p className="text-gray-500 font-medium mt-1 text-sm">
                {selectedPackage.hours} {t('hoursLabel')} ({selectedPackage.machineType === 'trackman' ? 'Trackman' : 'Foresight'}) {t('plusCoaching')}
              </p>
              <div className="text-2xl font-semibold text-[#FF7A05] mt-2">฿{selectedPackage.price.toLocaleString()}</div>
            </div>

            <form onSubmit={handleBuyPackage} className="space-y-4">
              {/* Logged-in customer: show account info */}
              {role === 'customer' && currentUser ? (
                <div className="rounded-xl ring-1 ring-gray-200 p-3.5 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                      <div className="text-xs text-gray-400">{currentUser.phone}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <Phone size={14}/> {t('phoneRefLabel')}
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
                      <User size={14}/> {t('fullName')}
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
                        <Mail size={13}/> {t('email')}
                      </label>
                      <input type="email" className="input-field" value={pkgEmail} onChange={(e) => setPkgEmail(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {/* Coach Selection for Course */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-2">
                  <GraduationCap size={14} className="text-purple-500" /> {t('selectCourseCoach')}
                </label>
                <div className="space-y-2">
                  {activeCoaches.map(c => (
                    <label
                      key={c.name}
                      className={`block p-3 rounded-xl ring-1 cursor-pointer transition-all ${
                        pkgCoach === c.name
                          ? 'ring-2 ring-gray-900 bg-gray-50'
                          : 'ring-gray-200 bg-white hover:ring-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="pkgCoach"
                          value={c.name}
                          checked={pkgCoach === c.name}
                          onChange={(e) => setPkgCoach(e.target.value)}
                          className="w-4 h-4 accent-gray-900 shrink-0"
                        />
                        <Avatar src={c.avatar} name={c.name} size={36} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900">{c.name}</span>
                          {c.expertise && <div className="text-xs text-gray-400 truncate">{c.expertise}</div>}
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-400">฿{c.price.toLocaleString()}/ชม.</span>
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingCoach(c); }} className="text-[11px] text-gray-400 hover:text-gray-600 underline">{t('viewProfile')}</button>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsPackageModalOpen(false)} className="flex-1 py-3 btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" className="flex-1 py-3 btn-primary">
                  {role === 'admin' ? t('addToSystem') : t('goToPayment')}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('scanToPay')}</h2>

            <div className="bg-gray-50/80 p-4 rounded-xl text-left space-y-2 mb-5 ring-1 ring-gray-100">
              {isPaymentModalOpen.type === 'package' ? (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">{t('packageLabel')}</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.package.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">{t('buyer')}</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.name}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">{t('machineColon')}</span><span className="font-medium text-gray-800">{isPaymentModalOpen.data.machine}</span></div>
                  {isPaymentModalOpen.data.usedQuota ? (
                    <div className="flex justify-between text-sm text-blue-600"><span>{t('memberRightLabel')}</span><span className="font-medium">{t('deduct1Hour')}</span></div>
                  ) : (
                    <div className="flex justify-between text-sm"><span className="text-gray-500">{t('machineFeeColon')}</span><span className="font-medium text-gray-800">฿{getBasePrice(isPaymentModalOpen.data.machine).toLocaleString()}</span></div>
                  )}
                  {isPaymentModalOpen.data.withCoach && <div className="flex justify-between text-sm"><span className="text-gray-500">{t('coachFeeColon')} ({isPaymentModalOpen.data.coachName}):</span><span className="font-medium text-gray-800">฿{(isPaymentModalOpen.data.coachPrice || 0).toLocaleString()}</span></div>}
                  {isPaymentModalOpen.data.discount > 0 && <div className="flex justify-between text-sm text-red-500"><span>{t('discountColon')}</span><span className="font-medium">-฿{isPaymentModalOpen.data.discount.toLocaleString()}</span></div>}
                </>
              )}
              <div className="pt-2.5 border-t border-gray-200 flex justify-between mt-2.5">
                <span className="font-medium text-gray-800">{t('netTotalColon')}</span>
                <span className="font-semibold text-[#FF7A05] text-xl">฿{isPaymentModalOpen.data.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 btn-secondary">
                {t('cancel')}
              </button>
              <button onClick={handlePaymentConfirm} className="flex-1 py-3 btn-primary">
                {t('confirmPayment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coach Profile Modal */}
      {viewingCoach && (
        <div className="modal-overlay" onClick={() => setViewingCoach(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Cover / Avatar area */}
            <div className="bg-gray-100 h-24 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <Avatar src={viewingCoach.avatar} name={viewingCoach.name} size={80} className="ring-4 ring-white shadow-lg" />
              </div>
              <button onClick={() => setViewingCoach(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-white/80 rounded-full p-1.5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="pt-14 pb-6 px-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">{viewingCoach.name}</h3>
              <div className="text-sm text-gray-400 mt-0.5">฿{viewingCoach.price.toLocaleString()} {t('perHour')}</div>

              {viewingCoach.bio && (
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">{viewingCoach.bio}</p>
              )}

              <div className="mt-5 space-y-3 text-left">
                {viewingCoach.education && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <BookOpen size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">{t('educationCert')}</div>
                      <div className="text-sm text-gray-700 font-medium mt-0.5">{viewingCoach.education}</div>
                    </div>
                  </div>
                )}
                {viewingCoach.expertise && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <Star size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wide">{t('expertiseTitle')}</div>
                      <div className="text-sm text-gray-700 font-medium mt-0.5">{viewingCoach.expertise}</div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setViewingCoach(null)} className="mt-6 w-full py-2.5 btn-ghost text-sm">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
