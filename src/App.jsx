import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, User, Clock,
  Monitor, X, Shield, UserCircle, CalendarDays, GraduationCap,
  Phone, MessageCircle, Mail, QrCode, BarChart3, Download,
  CheckCircle2, XCircle, Tag, Users, CreditCard, Award, ShoppingCart,
  FileText, Filter, TrendingUp, LogOut, LogIn, UserPlus, Eye, EyeOff, Lock,
  Settings, Plus, Trash2, Pencil, Percent, ToggleLeft, ToggleRight,
  Camera, ImagePlus, Star, Briefcase, BookOpen, ChevronDown, Info,
  Paperclip, Globe, AlertCircle, Upload
} from 'lucide-react';

// ========== Toast Notification Component ==========
const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl ring-1 backdrop-blur-sm ${toast.exiting ? 'toast-exit' : 'toast-enter'} ${
          toast.type === 'success' ? 'bg-emerald-50 ring-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-red-50 ring-red-200 text-red-800' :
          toast.type === 'warning' ? 'bg-amber-50 ring-amber-200 text-amber-800' :
          'bg-blue-50 ring-blue-200 text-blue-800'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> :
           toast.type === 'error' ? <XCircle size={20} className="text-red-500" /> :
           toast.type === 'warning' ? <AlertCircle size={20} className="text-amber-500" /> :
           <Info size={20} className="text-blue-500" />}
        </div>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-600 -mt-0.5">
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
);

// ========== Confirm Dialog Component ==========
const ConfirmDialog = ({ open, title, message, type = 'warning', confirmLabel, cancelLabel, onConfirm, onCancel }) => {
  if (!open) return null;
  const colors = {
    warning: { bg: 'bg-amber-50', ring: 'ring-amber-200', icon: <AlertCircle size={28} className="text-amber-500" />, btn: 'bg-amber-500 hover:bg-amber-600' },
    danger: { bg: 'bg-red-50', ring: 'ring-red-200', icon: <Trash2 size={28} className="text-red-500" />, btn: 'bg-red-500 hover:bg-red-600' },
    info: { bg: 'bg-blue-50', ring: 'ring-blue-200', icon: <Info size={28} className="text-blue-500" />, btn: 'bg-blue-500 hover:bg-blue-600' },
    success: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: <CheckCircle2 size={28} className="text-emerald-500" />, btn: 'btn-primary' },
  };
  const c = colors[type] || colors.warning;
  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onCancel}>
      <div className="modal-panel max-w-sm p-6 modal-enter" onClick={e => e.stopPropagation()}>
        <div className={`w-14 h-14 ${c.bg} ring-1 ${c.ring} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          {c.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 btn-secondary rounded-xl font-medium">
            {cancelLabel || 'ยกเลิก'}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${c.btn}`}>
            {confirmLabel || 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  );
};

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || '';
const api = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API Error');
  }
  return res.json();
};

const START_HOUR = 9;
const END_HOUR = 22;
const DAYS_OF_WEEK_MAP = {
  th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const LOCALE_MAP = { th: 'th-TH', en: 'en-US', ja: 'ja-JP', ru: 'ru-RU', zh: 'zh-CN' };

const TRANSLATIONS = {
  // ---- Auth page ----
  systemSubtitle: { th: 'ระบบจองสนามกอล์ฟจำลอง', en: 'Golf Simulator Booking System', ja: 'ゴルフシミュレーター予約システム', ru: 'Система бронирования гольф-симулятора', zh: '高尔夫模拟器预订系统' },
  login: { th: 'เข้าสู่ระบบ', en: 'Login', ja: 'ログイン', ru: 'Войти', zh: '登录' },
  register: { th: 'ลงทะเบียน', en: 'Register', ja: '新規登録', ru: 'Регистрация', zh: '注册' },
  phone: { th: 'เบอร์โทรศัพท์', en: 'Phone Number', ja: '電話番号', ru: 'Телефон', zh: '手机号' },
  password: { th: 'รหัสผ่าน', en: 'Password', ja: 'パスワード', ru: 'Пароль', zh: '密码' },
  enterPassword: { th: 'กรอกรหัสผ่าน', en: 'Enter password', ja: 'パスワードを入力', ru: 'Введите пароль', zh: '输入密码' },
  fullName: { th: 'ชื่อ-นามสกุล', en: 'Full Name', ja: '氏名', ru: 'Полное имя', zh: '姓名' },
  enterFullName: { th: 'กรอกชื่อ-นามสกุล', en: 'Enter full name', ja: '氏名を入力', ru: 'Введите полное имя', zh: '输入姓名' },
  firstName: { th: 'ชื่อ', en: 'First Name', ja: '名', ru: 'Имя', zh: '名' },
  enterFirstName: { th: 'กรอกชื่อ', en: 'Enter first name', ja: '名を入力', ru: 'Введите имя', zh: '输入名' },
  lastName: { th: 'นามสกุล', en: 'Last Name', ja: '姓', ru: 'Фамилия', zh: '姓' },
  enterLastName: { th: 'กรอกนามสกุล', en: 'Enter last name', ja: '姓を入力', ru: 'Введите фамилию', zh: '输入姓' },
  nickname: { th: 'ชื่อเล่น', en: 'Nickname', ja: 'ニックネーム', ru: 'Никнейм', zh: '昵称' },
  enterNickname: { th: 'กรอกชื่อเล่น', en: 'Enter nickname', ja: 'ニックネームを入力', ru: 'Введите никнейм', zh: '输入昵称' },
  birthdate: { th: 'วันเดือนปีเกิด', en: 'Date of Birth', ja: '生年月日', ru: 'Дата рождения', zh: '出生日期' },
  setPassword: { th: 'ตั้งรหัสผ่าน', en: 'Set password', ja: 'パスワード設定', ru: 'Пароль', zh: '设置密码' },
  passwordRequirements: { th: 'อย่างน้อย 8 ตัว มีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ', en: 'Min 8 chars, uppercase, number & special char', ja: '8文字以上、大文字・数字・特殊文字を含む', ru: 'Мин. 8 символов, заглавная, цифра, спецсимвол', zh: '至少8位，含大写字母、数字和特殊字符' },
  errPasswordWeak: { th: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว มีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ (!@#$%)', en: 'Password needs 8+ chars, uppercase, number & special character', ja: 'パスワードは8文字以上で大文字・数字・特殊文字が必要です', ru: 'Пароль: 8+ символов, заглавная, цифра, спецсимвол', zh: '密码需8位以上，含大写字母、数字和特殊字符' },
  accountType: { th: 'ประเภทบัญชี', en: 'Account Type', ja: 'アカウント種別', ru: 'Тип аккаунта', zh: '账户类型' },
  customer: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様', ru: 'Клиент', zh: '客户' },
  coach: { th: 'โค้ช', en: 'Coach', ja: 'コーチ', ru: 'Тренер', zh: '教练' },
  admin: { th: 'แอดมิน', en: 'Admin', ja: '管理者', ru: 'Админ', zh: '管理员' },
  coachNameLabel: { th: 'ชื่อโค้ช (แสดงในระบบ)', en: 'Coach Name (displayed in system)', ja: 'コーチ名（システム表示用）', ru: 'Имя тренера (в системе)', zh: '教练姓名（系统显示）' },
  coachNamePlaceholder: { th: 'เช่น โค้ชดี', en: 'e.g. Coach D', ja: '例：コーチD', ru: 'напр. Тренер Д', zh: '例如 教练D' },
  demoAccounts: { th: 'บัญชีทดลองใช้ (รหัสผ่าน: 1234)', en: 'Demo accounts (password: 1234)', ja: 'デモアカウント（パスワード：1234）', ru: 'Демо-аккаунты (пароль: 1234)', zh: '演示账户（密码：1234）' },
  customerLabel: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様', ru: 'Клиент', zh: '客户' },

  // ---- Auth errors ----
  errPhoneOrPassword: { th: 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง', en: 'Incorrect phone or password', ja: '電話番号またはパスワードが正しくありません', ru: 'Неверный телефон или пароль', zh: '手机号或密码错误' },
  errFillAll: { th: 'กรุณากรอกข้อมูลให้ครบ', en: 'Please fill in all fields', ja: 'すべての項目を入力してください', ru: 'Заполните все поля', zh: '请填写所有字段' },
  errPasswordMin: { th: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', en: 'Password must be at least 4 characters', ja: 'パスワードは4文字以上必要です', ru: 'Пароль минимум 4 символа', zh: '密码至少4个字符' },
  errPhoneUsed: { th: 'เบอร์โทรนี้ถูกใช้ลงทะเบียนแล้ว', en: 'This phone is already registered', ja: 'この電話番号は既に登録されています', ru: 'Этот номер уже зарегистрирован', zh: '该手机号已注册' },
  loginWithLine: { th: 'เข้าสู่ระบบด้วย LINE', en: 'Login with LINE', ja: 'LINEでログイン', ru: 'Войти через LINE', zh: '使用LINE登录' },
  orDivider: { th: 'หรือ', en: 'or', ja: 'または', ru: 'или', zh: '或' },
  lineLoginError: { th: 'เข้าสู่ระบบ LINE ไม่สำเร็จ', en: 'LINE login failed', ja: 'LINEログインに失敗しました', ru: 'Ошибка входа через LINE', zh: 'LINE登录失败' },
  loginWithGoogle: { th: 'เข้าสู่ระบบด้วย Google', en: 'Login with Google', ja: 'Googleでログイン', ru: 'Войти через Google', zh: '使用Google登录' },
  googleLoginError: { th: 'เข้าสู่ระบบ Google ไม่สำเร็จ', en: 'Google login failed', ja: 'Googleログインに失敗しました', ru: 'Ошибка входа через Google', zh: 'Google登录失败' },
  errEnterCoachName: { th: 'กรุณากรอกชื่อโค้ช', en: 'Please enter coach name', ja: 'コーチ名を入力してください', ru: 'Введите имя тренера', zh: '请输入教练姓名' },

  // ---- Top bar / Nav ----
  logout: { th: 'ออกจากระบบ', en: 'Logout', ja: 'ログアウト', ru: 'Выйти', zh: '退出' },
  hello: { th: 'สวัสดี,', en: 'Hello,', ja: 'こんにちは,', ru: 'Привет,', zh: '你好,' },
  daily: { th: 'รายวัน', en: 'Daily', ja: '日別', ru: 'День', zh: '每日' },
  calendar: { th: 'ปฏิทิน', en: 'Calendar', ja: 'カレンダー', ru: 'Календарь', zh: '日历' },
  membersAndCourses: { th: 'สมาชิก/คอร์ส', en: 'Members/Courses', ja: '会員/コース', ru: 'Члены/Курсы', zh: '会员/课程' },
  coachSchedule: { th: 'ตารางสอน', en: 'Schedule', ja: 'スケジュール', ru: 'Расписание', zh: '课程表' },
  dashboard: { th: 'แดชบอร์ด', en: 'Dashboard', ja: 'ダッシュボード', ru: 'Панель', zh: '仪表板' },
  reports: { th: 'รายงาน', en: 'Reports', ja: 'レポート', ru: 'Отчёты', zh: '报表' },
  settings: { th: 'ตั้งค่า', en: 'Settings', ja: '設定', ru: 'Настройки', zh: '设置' },

  // ---- Daily view ----
  prevDay: { th: 'วันก่อนหน้า', en: 'Previous Day', ja: '前日', ru: 'Пред. день', zh: '前一天' },
  nextDay: { th: 'วันถัดไป', en: 'Next Day', ja: '翌日', ru: 'След. день', zh: '后一天' },
  time: { th: 'เวลา', en: 'Time', ja: '時間', ru: 'Время', zh: '时间' },
  available: { th: 'ว่าง', en: 'Open', ja: '空き', ru: 'Свободно', zh: '空闲' },
  book: { th: '+ จอง', en: '+ Book', ja: '+ 予約', ru: '+ Забронировать', zh: '+ 预订' },
  booked: { th: 'ถูกจองแล้ว', en: 'Booked', ja: '予約済み', ru: 'Забронировано', zh: '已预订' },
  myBooking: { th: 'จองเรียบร้อยแล้ว', en: 'Your Booking', ja: '予約済み（自分）', ru: 'Ваше бронирование', zh: '您的预订' },
  notAvailable: { th: 'ไม่ว่าง', en: 'Unavailable', ja: '空きなし', ru: 'Недоступно', zh: '不可用' },
  statusBooked: { th: 'รอโชว์ตัว', en: 'Awaiting', ja: '来店待ち', ru: 'Ожидание', zh: '等待到场' },
  statusCheckedIn: { th: 'เช็คอินแล้ว', en: 'Checked In', ja: 'チェックイン済', ru: 'Отмечен', zh: '已签到' },
  statusNoShow: { th: 'ไม่มา', en: 'No-show', ja: '不参加', ru: 'Не пришёл', zh: '未到场' },
  hasCoach: { th: 'มีโค้ช', en: 'With Coach', ja: 'コーチ付き', ru: 'С тренером', zh: '有教练' },

  // ---- Members / Packages view ----
  trackmanCourses: { th: 'คอร์สเรียน Trackman', en: 'Trackman Courses', ja: 'Trackmanコース', ru: 'Курсы Trackman', zh: 'Trackman课程' },
  foresightCourses: { th: 'คอร์สเรียน Foresight', en: 'Foresight Courses', ja: 'Foresightコース', ru: 'Курсы Foresight', zh: 'Foresight课程' },
  popular: { th: 'ยอดนิยม', en: 'Popular', ja: '人気', ru: 'Популярный', zh: '热门' },
  courseHours: { th: 'คอร์สเรียน', en: 'Course', ja: 'コース', ru: 'Курс', zh: '课程' },
  hours: { th: 'ชั่วโมง', en: 'hours', ja: '時間', ru: 'часов', zh: '小时' },
  coachIncluded: { th: 'รวมค่าโค้ชสอนแล้ว', en: 'Coach fee included', ja: 'コーチ料込み', ru: 'Тренер включён', zh: '含教练费' },
  useForTrackman: { th: 'ใช้จองเครื่อง Trackman', en: 'For Trackman machines', ja: 'Trackmanマシン用', ru: 'Для Trackman', zh: '用于Trackman设备' },
  useForForesight: { th: 'ใช้จองเครื่อง Foresight', en: 'For Foresight machines', ja: 'Foresightマシン用', ru: 'Для Foresight', zh: '用于Foresight设备' },
  buyPackage: { th: 'เลือกซื้อแพ็กเกจนี้', en: 'Buy This Package', ja: 'このパッケージを購入', ru: 'Купить пакет', zh: '购买此套餐' },
  myCourses: { th: 'คอร์สของฉัน', en: 'My Courses', ja: 'マイコース', ru: 'Мои курсы', zh: '我的课程' },
  hoursRemaining: { th: 'ชม. คงเหลือ', en: 'hrs remaining', ja: '時間 残り', ru: 'ч. осталось', zh: '小时剩余' },
  hoursUnit: { th: 'ชม.', en: 'hrs', ja: '時間', ru: 'ч.', zh: '小时' },
  hoursUsedUp: { th: 'หมดแล้ว — เลือกซื้อแพ็คเกจด้านบนเพื่อเติม', en: 'Used up — buy a package above to refill', ja: '残りなし — 上記パッケージを購入してください', ru: 'Использовано — купите пакет выше', zh: '已用完 - 请购买上方套餐补充' },
  noCourses: { th: 'คุณยังไม่มีคอร์ส — เลือกซื้อแพ็คเกจด้านบนเพื่อเริ่มต้น', en: 'No courses yet — buy a package above to get started', ja: 'コースがありません — 上記パッケージを購入してください', ru: 'Нет курсов — купите пакет выше', zh: '暂无课程 - 请购买上方套餐开始' },
  memberListTitle: { th: 'รายชื่อสมาชิกในระบบ', en: 'Member List', ja: '会員一覧', ru: 'Список членов', zh: '会员列表' },
  customerName: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名', ru: 'Имя клиента', zh: '客户姓名' },
  contactPhone: { th: 'เบอร์ติดต่อ', en: 'Phone', ja: '連絡先', ru: 'Телефон', zh: '联系电话' },
  lineEmail: { th: 'Line / Email', en: 'Line / Email', ja: 'Line / Email', ru: 'Line / Email', zh: 'Line / Email' },
  trackmanRemBought: { th: 'Trackman (คงเหลือ/ซื้อ)', en: 'Trackman (Remaining/Bought)', ja: 'Trackman (残り/購入)', ru: 'Trackman (Ост./Куплено)', zh: 'Trackman（剩余/购买）' },
  foresightRemBought: { th: 'Foresight (คงเหลือ/ซื้อ)', en: 'Foresight (Remaining/Bought)', ja: 'Foresight (残り/購入)', ru: 'Foresight (Ост./Куплено)', zh: 'Foresight（剩余/购买）' },
  noMembers: { th: 'ยังไม่มีข้อมูลสมาชิก', en: 'No member data yet', ja: '会員データがありません', ru: 'Нет данных о членах', zh: '暂无会员数据' },
  hrsUnit: { th: 'ชม.', en: 'hrs', ja: '時間', ru: 'ч.', zh: '小时' },

  // ---- Dashboard ----
  dashboardTitle: { th: 'ภาพรวมระบบและรายงาน', en: 'System Overview & Reports', ja: 'システム概要とレポート', ru: 'Обзор системы и отчёты', zh: '系统概览与报表' },
  bookingsToday: { th: 'การจองวันนี้', en: "Today's Bookings", ja: '本日の予約', ru: 'Бронирования сегодня', zh: '今日预订' },
  checkinToday: { th: 'มาแสดงตัว (เช็คอิน)', en: 'Checked In', ja: 'チェックイン', ru: 'Отмечено', zh: '已签到' },
  noShowToday: { th: 'ไม่มา (No-show)', en: 'No-show', ja: '不参加 (No-show)', ru: 'Не пришёл', zh: '未到场' },
  expectedRevenue: { th: 'ยอดรับเงินคาดการณ์ (วันนี้)', en: 'Expected Revenue (Today)', ja: '予想収益（本日）', ru: 'Ожид. доход (сегодня)', zh: '预期收入（今日）' },
  items: { th: 'รายการ', en: 'items', ja: '件', ru: 'шт.', zh: '项' },
  people: { th: 'คน', en: 'people', ja: '人', ru: 'чел.', zh: '人' },

  // ---- Coach Schedule ----
  today: { th: 'วันนี้', en: 'Today', ja: '今日', ru: 'Сегодня', zh: '今天' },
  nextAppointment: { th: 'นัดถัดไป', en: 'Next Appointment', ja: '次の予約', ru: 'След. встреча', zh: '下一个预约' },
  thisMonth: { th: 'เดือนนี้', en: 'This Month', ja: '今月', ru: 'Этот месяц', zh: '本月' },
  taughtAlready: { th: 'สอนแล้ว', en: 'Taught', ja: '指導済', ru: 'Проведено', zh: '已教' },
  sessions: { th: 'คาบ', en: 'sessions', ja: 'コマ', ru: 'сессий', zh: '节' },
  todaySchedule: { th: 'วันนี้', en: 'Today', ja: '今日', ru: 'Сегодня', zh: '今天' },
  noSessionsToday: { th: 'ไม่มีคาบสอนวันนี้', en: 'No sessions today', ja: '本日のセッションなし', ru: 'Нет занятий сегодня', zh: '今天没有课程' },
  waitingCustomer: { th: 'รอลูกค้า', en: 'Awaiting', ja: '来店待ち', ru: 'Ожидание', zh: '等待客户' },
  teachingHistory: { th: 'ประวัติการสอน', en: 'Teaching History', ja: '指導履歴', ru: 'История обучения', zh: '教学历史' },
  more: { th: 'อีก', en: 'more', ja: '他', ru: 'ещё', zh: '更多' },
  detailForDate: { th: 'รายละเอียดวันที่', en: 'Details for', ja: '日付の詳細', ru: 'Детали за', zh: '日期详情' },

  // ---- Reports ----
  selectReportRange: { th: 'เลือกช่วงเวลารายงาน', en: 'Select Report Period', ja: 'レポート期間を選択', ru: 'Период отчёта', zh: '选择报表时段' },
  thisMonthBtn: { th: 'เดือนนี้', en: 'This Month', ja: '今月', ru: 'Этот месяц', zh: '本月' },
  lastMonthBtn: { th: 'เดือนก่อน', en: 'Last Month', ja: '先月', ru: 'Прошлый месяц', zh: '上月' },
  twoMonthsAgo: { th: '2 เดือนก่อน', en: '2 Months Ago', ja: '2ヶ月前', ru: '2 месяца назад', zh: '两个月前' },
  fromDate: { th: 'จากวันที่', en: 'From', ja: '開始日', ru: 'С', zh: '从' },
  toDate: { th: 'ถึงวันที่', en: 'To', ja: '終了日', ru: 'По', zh: '到' },
  totalBookings: { th: 'การจองทั้งหมด', en: 'Total Bookings', ja: '総予約数', ru: 'Всего броней', zh: '总预订数' },
  checkedIn: { th: 'เช็คอินแล้ว', en: 'Checked In', ja: 'チェックイン済', ru: 'Отмечено', zh: '已签到' },
  noShowLabel: { th: 'ไม่มา (No-show)', en: 'No-show', ja: '不参加', ru: 'Не пришёл', zh: '未到场' },
  totalRevenue: { th: 'รายได้รวม', en: 'Total Revenue', ja: '総収益', ru: 'Общий доход', zh: '总收入' },
  withCoach: { th: 'มีโค้ช', en: 'With Coach', ja: 'コーチ付き', ru: 'С тренером', zh: '有教练' },
  memberQuotaUsed: { th: 'ใช้สิทธิ์สมาชิก', en: 'Member Quota Used', ja: '会員枠使用', ru: 'Использовано квот', zh: '会员额度已用' },
  summaryByBay: { th: 'สรุปตาม Bay', en: 'Summary by Bay', ja: 'ベイ別集計', ru: 'По бейсам', zh: '按球道统计' },
  bookingCount: { th: 'จำนวนจอง', en: 'Bookings', ja: '予約数', ru: 'Бронирования', zh: '预订数' },
  checkinCount: { th: 'เช็คอิน', en: 'Check-ins', ja: 'チェックイン', ru: 'Отметки', zh: '签到数' },
  revenue: { th: 'รายได้', en: 'Revenue', ja: '収益', ru: 'Доход', zh: '收入' },
  dailySummary: { th: 'สรุปรายวัน', en: 'Daily Summary', ja: '日別集計', ru: 'По дням', zh: '每日汇总' },
  date: { th: 'วันที่', en: 'Date', ja: '日付', ru: 'Дата', zh: '日期' },
  noShowCol: { th: 'ไม่มา', en: 'No-show', ja: '不参加', ru: 'Не пришёл', zh: '未到' },
  memberCol: { th: 'สมาชิก', en: 'Member', ja: '会員', ru: 'Член', zh: '会员' },
  walkInCol: { th: 'Walk-in', en: 'Walk-in', ja: 'ウォークイン', ru: 'Walk-in', zh: '散客' },
  grandTotal: { th: 'รวมทั้งหมด', en: 'Grand Total', ja: '合計', ru: 'Итого', zh: '总计' },
  noDataForRange: { th: 'ไม่มีข้อมูลการจองในช่วงเวลาที่เลือก', en: 'No booking data for selected period', ja: '選択期間の予約データなし', ru: 'Нет данных за период', zh: '所选时段无预订数据' },
  allBookings: { th: 'รายการจองทั้งหมด', en: 'All Bookings', ja: '全予約一覧', ru: 'Все бронирования', zh: '所有预订' },
  timeCol: { th: 'เวลา', en: 'Time', ja: '時間', ru: 'Время', zh: '时间' },
  machine: { th: 'เครื่อง', en: 'Machine', ja: 'マシン', ru: 'Машина', zh: '设备' },
  customerCol: { th: 'ลูกค้า', en: 'Customer', ja: 'お客様', ru: 'Клиент', zh: '客户' },
  statusCol: { th: 'สถานะ', en: 'Status', ja: 'ステータス', ru: 'Статус', zh: '状态' },
  amount: { th: 'ยอด', en: 'Amount', ja: '金額', ru: 'Сумма', zh: '金额' },

  // ---- Settings ----
  systemSettings: { th: 'ตั้งค่าระบบ', en: 'System Settings', ja: 'システム設定', ru: 'Настройки системы', zh: '系统设置' },
  settingsDesc: { th: 'จัดการเบย์, แพ็คเกจ และโปรโมชั่น', en: 'Manage bays, packages & promotions', ja: 'ベイ、パッケージ、プロモーション管理', ru: 'Бейсы, пакеты и промо', zh: '管理球道、套餐和促销' },
  baysTab: { th: 'เบย์', en: 'Bays', ja: 'ベイ', ru: 'Бейсы', zh: '球道' },
  coachesTab: { th: 'โค้ช', en: 'Coaches', ja: 'コーチ', ru: 'Тренеры', zh: '教练' },
  packagesTab: { th: 'แพ็คเกจ', en: 'Packages', ja: 'パッケージ', ru: 'Пакеты', zh: '套餐' },
  promosTab: { th: 'โปรโมโค้ด', en: 'Promo Codes', ja: 'プロモコード', ru: 'Промокоды', zh: '优惠码' },
  usersTab: { th: 'ผู้ใช้', en: 'Users', ja: 'ユーザー', ru: 'Пользователи', zh: '用户' },
  deleteUser: { th: 'ลบผู้ใช้', en: 'Delete User', ja: 'ユーザー削除', ru: 'Удалить', zh: '删除用户' },
  confirmDeleteUser: { th: 'ต้องการลบผู้ใช้นี้หรือไม่? ผู้ใช้จะสามารถสมัครสมาชิกใหม่ได้', en: 'Delete this user? They can re-register.', ja: 'このユーザーを削除しますか？再登録可能です。', ru: 'Удалить пользователя? Он сможет зарегистрироваться снова.', zh: '删除此用户？他们可以重新注册。' },
  noUsers: { th: 'ไม่มีผู้ใช้', en: 'No users', ja: 'ユーザーなし', ru: 'Нет пользователей', zh: '暂无用户' },
  userDeleted: { th: 'ลบผู้ใช้แล้ว', en: 'User deleted', ja: 'ユーザーを削除しました', ru: 'Пользователь удалён', zh: '用户已删除' },
  editBay: { th: 'แก้ไขเบย์', en: 'Edit Bay', ja: 'ベイ編集', ru: 'Редакт. бейс', zh: '编辑球道' },
  addBay: { th: 'เพิ่มเบย์ใหม่', en: 'Add New Bay', ja: '新規ベイ追加', ru: 'Добавить бейс', zh: '添加新球道' },
  bayNamePlaceholder: { th: 'ชื่อเบย์ เช่น Bay 5 (Trackman)', en: 'Bay name e.g. Bay 5 (Trackman)', ja: 'ベイ名 例: Bay 5 (Trackman)', ru: 'Название напр. Bay 5 (Trackman)', zh: '球道名 例如 Bay 5 (Trackman)' },
  noType: { th: 'ไม่ระบุประเภท', en: 'No Type', ja: '種別なし', ru: 'Без типа', zh: '无类型' },
  pricePerHour: { th: 'ราคา/ชม.', en: 'Price/hr', ja: '料金/時', ru: 'Цена/ч.', zh: '价格/小时' },
  save: { th: 'บันทึก', en: 'Save', ja: '保存', ru: 'Сохранить', zh: '保存' },
  add: { th: 'เพิ่ม', en: 'Add', ja: '追加', ru: 'Добавить', zh: '添加' },
  cancel: { th: 'ยกเลิก', en: 'Cancel', ja: 'キャンセル', ru: 'Отмена', zh: '取消' },
  noBays: { th: 'ยังไม่มีเบย์', en: 'No bays yet', ja: 'ベイがありません', ru: 'Нет бейсов', zh: '暂无球道' },
  editCoach: { th: 'แก้ไขโค้ช', en: 'Edit Coach', ja: 'コーチ編集', ru: 'Редакт. тренера', zh: '编辑教练' },
  addCoach: { th: 'เพิ่มโค้ชใหม่', en: 'Add New Coach', ja: '新規コーチ追加', ru: 'Добавить тренера', zh: '添加新教练' },
  coachPhone: { th: 'เบอร์โทร (ใช้ล็อกอิน)', en: 'Phone (for login)', ja: '電話番号（ログイン用）', ru: 'Телефон (для входа)', zh: '手机号（用于登录）' },
  coachPassword: { th: 'รหัสผ่าน', en: 'Password', ja: 'パスワード', ru: 'Пароль', zh: '密码' },
  coachAccountCreated: { th: 'สร้างบัญชีโค้ชเรียบร้อย', en: 'Coach account created', ja: 'コーチアカウント作成完了', ru: 'Аккаунт тренера создан', zh: '教练账户已创建' },
  coachNamePH: { th: 'ชื่อโค้ช เช่น โค้ชดี', en: 'Coach name e.g. Coach D', ja: 'コーチ名 例: コーチD', ru: 'Имя напр. Тренер Д', zh: '教练姓名 例如 教练D' },
  pricePerHourBaht: { th: 'ราคา/ชม. (บาท)', en: 'Price/hr (THB)', ja: '料金/時（バーツ）', ru: 'Цена/ч. (бат)', zh: '价格/小时（泰铢）' },
  educationPH: { th: 'วุฒิการศึกษา / ใบรับรอง เช่น PGA Teaching Professional', en: 'Education/Certification e.g. PGA Teaching Professional', ja: '学歴/資格 例: PGA Teaching Professional', ru: 'Образование напр. PGA Teaching Professional', zh: '学历/认证 例如 PGA Teaching Professional' },
  expertisePH: { th: 'ความเชี่ยวชาญ เช่น Short Game, Putting', en: 'Expertise e.g. Short Game, Putting', ja: '専門分野 例: Short Game, Putting', ru: 'Специализация напр. Short Game, Putting', zh: '专长 例如 Short Game, Putting' },
  bioPH: { th: 'ประวัติย่อ เช่น ประสบการณ์สอน 10 ปี', en: 'Bio e.g. 10 years teaching experience', ja: '略歴 例: 指導歴10年', ru: 'Биография напр. 10 лет опыта', zh: '简介 例如 10年教学经验' },
  addCoachBtn: { th: 'เพิ่มโค้ช', en: 'Add Coach', ja: 'コーチ追加', ru: 'Добавить тренера', zh: '添加教练' },
  noCoaches: { th: 'ยังไม่มีโค้ช', en: 'No coaches yet', ja: 'コーチがいません', ru: 'Нет тренеров', zh: '暂无教练' },
  educationLabel: { th: 'วุฒิ:', en: 'Education:', ja: '学歴:', ru: 'Образование:', zh: '学历:' },
  expertiseLabel: { th: 'เชี่ยวชาญ:', en: 'Expertise:', ja: '専門:', ru: 'Специализация:', zh: '专长:' },
  bioLabel: { th: 'ประวัติ:', en: 'Bio:', ja: '略歴:', ru: 'Биография:', zh: '简介:' },
  editPkg: { th: 'แก้ไขแพ็คเกจ', en: 'Edit Package', ja: 'パッケージ編集', ru: 'Редакт. пакет', zh: '编辑套餐' },
  addPkg: { th: 'เพิ่มแพ็คเกจใหม่', en: 'Add New Package', ja: '新規パッケージ追加', ru: 'Добавить пакет', zh: '添加新套餐' },
  pkgNamePH: { th: 'ชื่อแพ็คเกจ', en: 'Package name', ja: 'パッケージ名', ru: 'Название пакета', zh: '套餐名称' },
  numHours: { th: 'จำนวนชั่วโมง', en: 'Number of hours', ja: '時間数', ru: 'Кол-во часов', zh: '小时数' },
  priceBaht: { th: 'ราคา (บาท)', en: 'Price (THB)', ja: '料金（バーツ）', ru: 'Цена (бат)', zh: '价格（泰铢）' },
  savingText: { th: 'ข้อความประหยัด เช่น ประหยัด 5,000 บาท', en: 'Saving text e.g. Save 5,000 THB', ja: '節約テキスト 例: 5,000バーツお得', ru: 'Текст экономии напр. Экономия 5000 бат', zh: '优惠文字 例如 节省5,000泰铢' },
  descText: { th: 'รายละเอียด เช่น รวมค่าโค้ชแล้ว', en: 'Description e.g. Coach fee included', ja: '説明 例: コーチ料込み', ru: 'Описание напр. Тренер включён', zh: '描述 例如 含教练费' },
  showAsPopular: { th: 'แสดงเป็น "ยอดนิยม"', en: 'Show as "Popular"', ja: '「人気」として表示', ru: 'Показать как «Популярный»', zh: '显示为"热门"' },
  addPkgBtn: { th: 'เพิ่มแพ็คเกจ', en: 'Add Package', ja: 'パッケージ追加', ru: 'Добавить пакет', zh: '添加套餐' },
  noPackages: { th: 'ยังไม่มีแพ็คเกจ', en: 'No packages yet', ja: 'パッケージがありません', ru: 'Нет пакетов', zh: '暂无套餐' },
  editPromo: { th: 'แก้ไขโปรโมโค้ด', en: 'Edit Promo Code', ja: 'プロモコード編集', ru: 'Редакт. промокод', zh: '编辑优惠码' },
  addPromo: { th: 'เพิ่มโปรโมโค้ดใหม่', en: 'Add New Promo Code', ja: '新規プロモコード追加', ru: 'Добавить промокод', zh: '添加新优惠码' },
  promoCodePH: { th: 'โค้ด เช่น SAVE20', en: 'Code e.g. SAVE20', ja: 'コード 例: SAVE20', ru: 'Код напр. SAVE20', zh: '代码 例如 SAVE20' },
  discountPercent: { th: 'ลดเป็น % (เปอร์เซ็นต์)', en: 'Percent discount (%)', ja: '割引率（%）', ru: 'Скидка в %', zh: '百分比折扣（%）' },
  discountFixed: { th: 'ลดเป็นจำนวนเงิน (บาท)', en: 'Fixed amount (THB)', ja: '定額割引（バーツ）', ru: 'Фикс. сумма (бат)', zh: '固定金额（泰铢）' },
  discountPercentPH: { th: 'ส่วนลด %', en: 'Discount %', ja: '割引 %', ru: 'Скидка %', zh: '折扣 %' },
  discountFixedPH: { th: 'ส่วนลด (บาท)', en: 'Discount (THB)', ja: '割引（バーツ）', ru: 'Скидка (бат)', zh: '折扣（泰铢）' },
  expiryDate: { th: 'วันหมดอายุ (เว้นว่าง = ไม่มีกำหนด)', en: 'Expiry date (blank = no expiry)', ja: '有効期限（空欄=無期限）', ru: 'Срок (пусто = бессрочно)', zh: '到期日期（空=无限期）' },
  addPromoBtn: { th: 'เพิ่มโปรโมโค้ด', en: 'Add Promo Code', ja: 'プロモコード追加', ru: 'Добавить промокод', zh: '添加优惠码' },
  noPromos: { th: 'ยังไม่มีโปรโมโค้ด', en: 'No promo codes yet', ja: 'プロモコードがありません', ru: 'Нет промокодов', zh: '暂无优惠码' },
  expired: { th: 'หมดอายุ:', en: 'Expires:', ja: '有効期限:', ru: 'Истекает:', zh: '到期:' },
  alreadyExpired: { th: '(หมดอายุแล้ว)', en: '(Expired)', ja: '（期限切れ）', ru: '(Истёк)', zh: '（已过期）' },
  noExpiry: { th: 'ไม่มีวันหมดอายุ', en: 'No expiry', ja: '無期限', ru: 'Бессрочно', zh: '无限期' },

  // ---- Manage Booking Modal ----
  manageBooking: { th: 'จัดการการจอง', en: 'Manage Booking', ja: '予約管理', ru: 'Управление бронью', zh: '管理预订' },
  customerNameLabel: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名', ru: 'Имя клиента', zh: '客户姓名' },
  phoneLabel: { th: 'เบอร์โทร', en: 'Phone', ja: '電話', ru: 'Телефон', zh: '电话' },
  timeLabel: { th: 'เวลา', en: 'Time', ja: '時間', ru: 'Время', zh: '时间' },
  machineLabel: { th: 'เครื่อง', en: 'Machine', ja: 'マシン', ru: 'Машина', zh: '设备' },
  paymentMethod: { th: 'วิธีชำระเงิน', en: 'Payment Method', ja: '支払方法', ru: 'Способ оплаты', zh: '支付方式' },
  memberQuotaDeduct: { th: 'หักชั่วโมงสมาชิก', en: 'Member Quota', ja: '会員枠控除', ru: 'Квота участника', zh: '会员额度' },
  normalPayment: { th: 'จ่ายเงินปกติ', en: 'Normal Payment', ja: '通常支払い', ru: 'Обычная оплата', zh: '普通支付' },
  coachLabel: { th: 'โค้ช', en: 'Coach', ja: 'コーチ', ru: 'Тренер', zh: '教练' },
  netTotal: { th: 'ยอดสุทธิ', en: 'Net Total', ja: '合計金額', ru: 'Итого', zh: '净总额' },
  assignCoach: { th: 'มอบหมายโค้ช', en: 'Assign Coach', ja: 'コーチ割当', ru: 'Назначить тренера', zh: '分配教练' },
  noCoach: { th: 'ไม่มีโค้ช', en: 'No Coach', ja: 'コーチなし', ru: 'Без тренера', zh: '无教练' },
  busy: { th: 'ไม่ว่าง', en: 'Busy', ja: '空きなし', ru: 'Занят', zh: '忙碌' },
  saveCoach: { th: 'บันทึกโค้ช', en: 'Save Coach', ja: 'コーチ保存', ru: 'Сохранить тренера', zh: '保存教练' },
  confirmCheckin: { th: 'ยืนยันลูกค้ามาถึง (Check-in)', en: 'Confirm Check-in', ja: 'チェックイン確認', ru: 'Подтвердить приход', zh: '确认签到' },
  confirmNoShow: { th: 'ลูกค้าไม่มาแสดงตัว (No-show)', en: 'Mark as No-show', ja: '不参加とマーク', ru: 'Отметить неявку', zh: '标记未到' },
  deleteBooking: { th: 'ลบข้อมูลการจองนี้ (คืนสิทธิ์)', en: 'Delete Booking (Refund Quota)', ja: '予約を削除（枠を返却）', ru: 'Удалить бронь (возврат)', zh: '删除预订（退还额度）' },

  // ---- Booking Modal ----
  addBookingAdmin: { th: 'เพิ่มการจอง (แอดมิน)', en: 'Add Booking (Admin)', ja: '予約追加（管理者）', ru: 'Добавить бронь (Админ)', zh: '添加预订（管理员）' },
  bookGolf: { th: 'จองเวลาเล่นกอล์ฟ', en: 'Book Golf Session', ja: 'ゴルフセッション予約', ru: 'Забронировать гольф', zh: '预订高尔夫' },
  dateLabel: { th: 'วันที่:', en: 'Date:', ja: '日付:', ru: 'Дата:', zh: '日期:' },
  machineColonLabel: { th: 'เครื่อง:', en: 'Machine:', ja: 'マシン:', ru: 'Машина:', zh: '设备:' },
  phoneAutoCheck: { th: 'เบอร์ติดต่อ (เช็คสถานะสมาชิกอัตโนมัติ)', en: 'Phone (auto-check membership)', ja: '電話番号（会員自動確認）', ru: 'Телефон (авто-проверка)', zh: '手机号（自动检查会员）' },
  memberCourseRights: { th: 'สิทธิ์คอร์สสมาชิก', en: 'Member Course Rights', ja: '会員コース権利', ru: 'Права курса участника', zh: '会员课程权利' },
  useMemberRight: { th: 'ใช้สิทธิ์', en: 'Use', ja: '利用', ru: 'Использовать', zh: '使用' },
  includesCoach: { th: '(รวมโค้ชแล้ว)', en: '(Coach included)', ja: '（コーチ込み）', ru: '(Тренер включён)', zh: '（含教练）' },
  courseCoach: { th: 'โค้ชประจำคอร์ส:', en: 'Course Coach:', ja: 'コースコーチ:', ru: 'Тренер курса:', zh: '课程教练:' },
  hoursUsedUpShort: { th: 'หมดแล้ว —', en: 'Used up —', ja: '残りなし —', ru: 'Использовано —', zh: '已用完 —' },
  buyCourseMore: { th: 'ซื้อคอร์สเพิ่ม', en: 'Buy more courses', ja: 'コースを追加購入', ru: 'Купить ещё', zh: '购买更多课程' },
  bayNoMemberSupport: { th: 'Bay นี้ไม่รองรับสิทธิ์สมาชิก', en: 'This bay does not support member quota', ja: 'このベイは会員枠に対応していません', ru: 'Бейс не поддерживает квоты', zh: '此球道不支持会员额度' },
  customerNameField: { th: 'ชื่อลูกค้า', en: 'Customer Name', ja: 'お客様名', ru: 'Имя клиента', zh: '客户姓名' },
  email: { th: 'อีเมล', en: 'Email', ja: 'メール', ru: 'Эл. почта', zh: '邮箱' },
  promoCodeLabel: { th: 'โค้ดส่วนลด', en: 'Promo Code', ja: 'プロモコード', ru: 'Промокод', zh: '优惠码' },
  applyCode: { th: 'ใช้โค้ด', en: 'Apply', ja: '適用', ru: 'Применить', zh: '使用' },
  discountLabel: { th: 'ส่วนลด:', en: 'Discount:', ja: '割引:', ru: 'Скидка:', zh: '折扣:' },
  addCoachExtra: { th: 'เพิ่มโค้ชสอน (จ่ายเพิ่ม)', en: 'Add Coach (extra charge)', ja: 'コーチ追加（追加料金）', ru: 'Доп. тренер (доплата)', zh: '添加教练（额外收费）' },
  selectCoach: { th: 'เลือกโค้ช', en: 'Select Coach', ja: 'コーチを選択', ru: 'Выбрать тренера', zh: '选择教练' },
  viewProfile: { th: 'ดูโปรไฟล์', en: 'View Profile', ja: 'プロフィール', ru: 'Профиль', zh: '查看资料' },
  todayScheduleOf: { th: 'ตารางวันนี้ของ', en: "Today's schedule for", ja: '本日のスケジュール:', ru: 'Расписание на сегодня:', zh: '今日课程表:' },
  freeAllDay: { th: 'ว่างทั้งวัน', en: 'Free all day', ja: '終日空き', ru: 'Свободен весь день', zh: '全天空闲' },
  memberCourse: { th: 'คอร์สสมาชิก', en: 'Member Course', ja: '会員コース', ru: 'Курс участника', zh: '会员课程' },
  machineAndCoachIncluded: { th: 'รวมค่าเครื่อง+โค้ชแล้ว', en: 'Machine + Coach included', ja: 'マシン＋コーチ込み', ru: 'Машина + тренер включены', zh: '含设备+教练费' },
  assignedCoach: { th: 'โค้ชประจำ', en: 'Assigned Coach', ja: '担当コーチ', ru: 'Назначенный тренер', zh: '指定教练' },
  totalLabel: { th: 'ยอดรวม', en: 'Total', ja: '合計', ru: 'Итого', zh: '总计' },
  useCourseRight: { th: '(ใช้สิทธิ์คอร์ส)', en: '(Using course quota)', ja: '（コース枠使用）', ru: '(Квота курса)', zh: '（使用课程额度）' },
  machineFee: { th: 'ค่าเครื่อง', en: 'Machine Fee', ja: 'マシン料金', ru: 'Плата за машину', zh: '设备费' },
  coachFee: { th: 'ค่าโค้ช', en: 'Coach Fee', ja: 'コーチ料金', ru: 'Плата за тренера', zh: '教练费' },
  discount: { th: 'ส่วนลด', en: 'Discount', ja: '割引', ru: 'Скидка', zh: '折扣' },
  confirmBooking: { th: 'ยืนยันการจอง', en: 'Confirm Booking', ja: '予約確定', ru: 'Подтвердить бронь', zh: '确认预订' },
  confirmUseRight: { th: 'ยืนยันใช้สิทธิ์', en: 'Confirm Usage', ja: '利用確定', ru: 'Подтвердить', zh: '确认使用' },
  goToPayment: { th: 'ไปชำระเงิน', en: 'Go to Payment', ja: 'お支払いへ', ru: 'К оплате', zh: '去支付' },

  // ---- Package Modal ----
  buyCourseTitle: { th: 'ซื้อคอร์สเรียน/เล่น', en: 'Buy Course/Package', ja: 'コース/パッケージ購入', ru: 'Купить курс/пакет', zh: '购买课程/套餐' },
  coachFeeIncluded: { th: 'รวมค่าโค้ชแล้ว', en: 'Coach fee included', ja: 'コーチ料込み', ru: 'Тренер включён', zh: '含教练费' },
  hoursLabel: { th: 'ชั่วโมง', en: 'hours', ja: '時間', ru: 'часов', zh: '小时' },
  plusCoaching: { th: '+ โค้ชสอน', en: '+ Coaching', ja: '+ コーチング', ru: '+ Тренировка', zh: '+ 教练指导' },
  phoneRefLabel: { th: 'เบอร์โทรศัพท์ (ใช้เป็นรหัสอ้างอิง)', en: 'Phone (used as reference)', ja: '電話番号（参照用）', ru: 'Телефон (как ID)', zh: '手机号（作为参考）' },
  selectCourseCoach: { th: 'เลือกโค้ชผู้สอนประจำคอร์ส', en: 'Select Course Coach', ja: 'コースコーチを選択', ru: 'Выбрать тренера курса', zh: '选择课程教练' },
  addToSystem: { th: 'เพิ่มเข้าระบบ', en: 'Add to System', ja: 'システムに追加', ru: 'Добавить в систему', zh: '添加到系统' },

  // ---- Payment Modal ----
  scanToPay: { th: 'สแกนชำระเงิน', en: 'Scan to Pay', ja: 'QRコードでお支払い', ru: 'Сканировать для оплаты', zh: '扫码支付' },
  packageLabel: { th: 'แพ็กเกจ:', en: 'Package:', ja: 'パッケージ:', ru: 'Пакет:', zh: '套餐:' },
  buyer: { th: 'ผู้ซื้อ:', en: 'Buyer:', ja: '購入者:', ru: 'Покупатель:', zh: '买家:' },
  machineColon: { th: 'เครื่อง:', en: 'Machine:', ja: 'マシン:', ru: 'Машина:', zh: '设备:' },
  memberRightLabel: { th: 'สิทธิ์สมาชิก:', en: 'Member Quota:', ja: '会員枠:', ru: 'Квота участника:', zh: '会员额度:' },
  deduct1Hour: { th: 'หัก 1 ชั่วโมง', en: 'Deduct 1 hour', ja: '1時間控除', ru: 'Списать 1 час', zh: '扣除1小时' },
  machineFeeColon: { th: 'ค่าเครื่อง:', en: 'Machine fee:', ja: 'マシン料金:', ru: 'Плата за машину:', zh: '设备费:' },
  coachFeeColon: { th: 'ค่าโค้ช', en: 'Coach fee', ja: 'コーチ料金', ru: 'Плата за тренера', zh: '教练费' },
  discountColon: { th: 'ส่วนลด:', en: 'Discount:', ja: '割引:', ru: 'Скидка:', zh: '折扣:' },
  netTotalColon: { th: 'ยอดรวมสุทธิ:', en: 'Net Total:', ja: '合計金額:', ru: 'Итого:', zh: '净总额:' },
  confirmPayment: { th: 'แจ้งชำระเงินแล้ว', en: 'Confirm Payment', ja: '支払い確認', ru: 'Подтвердить оплату', zh: '确认支付' },

  // ---- Coach Profile Modal ----
  perHour: { th: '/ ชั่วโมง', en: '/ hour', ja: '/ 時間', ru: '/ час', zh: '/ 小时' },
  educationCert: { th: 'วุฒิการศึกษา / ใบรับรอง', en: 'Education / Certification', ja: '学歴 / 資格', ru: 'Образование / Сертификат', zh: '学历 / 认证' },
  expertiseTitle: { th: 'ความเชี่ยวชาญ', en: 'Expertise', ja: '専門分野', ru: 'Специализация', zh: '专长' },
  close: { th: 'ปิด', en: 'Close', ja: '閉じる', ru: 'Закрыть', zh: '关闭' },

  // ---- Alert messages ----
  alertEnterCoachName: { th: 'กรุณากรอกชื่อโค้ช', en: 'Please enter coach name', ja: 'コーチ名を入力してください', ru: 'Введите имя тренера', zh: '请输入教练姓名' },
  alertDeleteCoach: { th: 'ลบโค้ชนี้?', en: 'Delete this coach?', ja: 'このコーチを削除しますか？', ru: 'Удалить тренера?', zh: '删除该教练？' },
  alertEnterBayName: { th: 'กรุณากรอกชื่อเบย์', en: 'Please enter bay name', ja: 'ベイ名を入力してください', ru: 'Введите название бейса', zh: '请输入球道名称' },
  alertDeleteBay: { th: 'ลบเบย์นี้? (การจองที่มีอยู่แล้วจะไม่ถูกลบ)', en: 'Delete this bay? (Existing bookings will not be removed)', ja: 'このベイを削除しますか？（既存の予約は削除されません）', ru: 'Удалить бейс? (Существующие брони сохранятся)', zh: '删除此球道？（现有预订不会被删除）' },
  alertEnterPkgName: { th: 'กรุณากรอกชื่อแพ็คเกจ', en: 'Please enter package name', ja: 'パッケージ名を入力してください', ru: 'Введите название пакета', zh: '请输入套餐名称' },
  alertDeletePkg: { th: 'ลบแพ็คเกจนี้?', en: 'Delete this package?', ja: 'このパッケージを削除しますか？', ru: 'Удалить пакет?', zh: '删除此套餐？' },
  alertEnterPromoCode: { th: 'กรุณากรอกโค้ดโปรโมชั่น', en: 'Please enter promo code', ja: 'プロモコードを入力してください', ru: 'Введите промокод', zh: '请输入优惠码' },
  alertDeletePromo: { th: 'ลบโปรโมโค้ดนี้?', en: 'Delete this promo code?', ja: 'このプロモコードを削除しますか？', ru: 'Удалить промокод?', zh: '删除此优惠码？' },
  alertImageTooLarge: { th: 'รูปภาพต้องมีขนาดไม่เกิน 500KB', en: 'Image must be under 500KB', ja: '画像は500KB以下にしてください', ru: 'Изображение до 500KB', zh: '图片不超过500KB' },
  alertPromoNoQuota: { th: 'ไม่สามารถใช้โค้ดส่วนลดร่วมกับการหักชั่วโมงสมาชิกได้', en: 'Cannot use promo code with member quota deduction', ja: 'プロモコードと会員枠控除は併用できません', ru: 'Нельзя совмещать промокод с квотой', zh: '优惠码不能与会员额度同时使用' },
  alertPromoInvalid: { th: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ', en: 'Invalid or expired promo code', ja: '無効または期限切れのプロモコード', ru: 'Неверный или просроченный промокод', zh: '优惠码无效或已过期' },
  alertPromoExpired: { th: 'โค้ดส่วนลดนี้หมดอายุแล้ว', en: 'This promo code has expired', ja: 'このプロモコードは期限切れです', ru: 'Этот промокод истёк', zh: '此优惠码已过期' },
  alertPromoSuccessPercent: { th: 'ใช้โค้ดส่วนลดสำเร็จ! ลด', en: 'Promo applied! Discount', ja: 'プロモ適用！割引', ru: 'Промо применён! Скидка', zh: '优惠码使用成功！折扣' },
  alertPromoSuccessFixed: { th: 'ใช้โค้ดส่วนลดสำเร็จ! ลด', en: 'Promo applied! Discount', ja: 'プロモ適用！割引', ru: 'Промо применён! Скидка', zh: '优惠码使用成功！折扣' },
  alertFillNamePhone: { th: 'กรุณากรอกชื่อและเบอร์ติดต่อ', en: 'Please enter name and phone', ja: '名前と電話番号を入力してください', ru: 'Введите имя и телефон', zh: '请输入姓名和手机号' },
  alertBayNoMember: { th: 'Bay นี้ไม่สามารถใช้สิทธิ์สมาชิกได้ (ไม่มีประเภทเครื่อง)', en: 'This bay does not support member quota (no machine type)', ja: 'このベイは会員枠に対応していません（マシン種別なし）', ru: 'Бейс не поддерживает квоты (нет типа)', zh: '此球道不支持会员额度（无设备类型）' },
  alertHoursUsedUp: { th: 'หมดแล้ว กรุณาซื้อเพิ่มในเมนูสมาชิก', en: 'Used up. Please buy more in Members menu', ja: '残りなし。会員メニューで追加購入してください', ru: 'Использовано. Купите ещё', zh: '已用完，请在会员菜单购买更多' },
  alertCourseCoachBusy: { th: '(โค้ชประจำคอร์ส) ไม่ว่างในเวลานี้ กรุณาเลือกเวลาอื่น', en: '(Course coach) is busy at this time. Please choose another time', ja: '（コースコーチ）はこの時間帯は予約済みです。別の時間を選択してください', ru: '(Тренер курса) занят. Выберите другое время', zh: '（课程教练）此时间忙碌，请选择其他时间' },
  alertCoachBusy: { th: 'ไม่ว่างในเวลานี้ กรุณาเลือกโค้ชท่านอื่นหรือเปลี่ยนเวลา', en: 'is busy at this time. Please choose another coach or time', ja: 'はこの時間帯は予約済みです。別のコーチまたは時間を選択してください', ru: 'занят. Выберите другого тренера или время', zh: '此时间忙碌，请选择其他教练或时间' },
  alertTimePassed: { th: 'ไม่สามารถจองเวลาที่ผ่านไปแล้วได้', en: 'Cannot book a time slot that has already passed', ja: '過去の時間帯は予約できません', ru: 'Нельзя забронировать прошедшее время', zh: '无法预订已过去的时间' },
  pastSlot: { th: 'ผ่านไปแล้ว', en: 'Passed', ja: '終了', ru: 'Прошло', zh: '已过' },
  alertMemberBookingSuccess: { th: 'ใช้สิทธิ์สมาชิกเรียบร้อยแล้ว การจองสำเร็จ!', en: 'Member quota used. Booking successful!', ja: '会員枠を使用しました。予約完了！', ru: 'Квота использована. Бронирование успешно!', zh: '会员额度已使用，预订成功！' },
  alertCalendarSent: { th: 'ส่งคำเชิญลงปฏิทินนัดหมายไปยัง', en: 'Calendar invite sent to', ja: 'カレンダー招待を送信しました:', ru: 'Приглашение отправлено:', zh: '日历邀请已发送至' },
  alertCalendarSentSuffix: { th: 'เรียบร้อยแล้ว', en: 'successfully', ja: '', ru: 'успешно', zh: '成功' },
  alertFillNamePhonePkg: { th: 'กรุณากรอกชื่อและเบอร์โทรศัพท์', en: 'Please enter name and phone', ja: '名前と電話番号を入力してください', ru: 'Введите имя и телефон', zh: '请输入姓名和手机号' },
  alertSelectCoach: { th: 'กรุณาเลือกโค้ชผู้สอน', en: 'Please select a coach', ja: 'コーチを選択してください', ru: 'Выберите тренера', zh: '请选择教练' },
  alertPkgSuccess: { th: 'สั่งซื้อ', en: 'Purchased', ja: '購入完了', ru: 'Куплено', zh: '购买成功' },
  alertPkgSuccessSuffix: { th: 'สำเร็จ! โค้ชผู้สอน:', en: 'successfully! Coach:', ja: '！コーチ:', ru: 'успешно! Тренер:', zh: '成功！教练:' },
  alertPkgAddedHours: { th: 'เพิ่ม', en: 'Added', ja: '追加', ru: 'Добавлено', zh: '添加' },
  alertPkgAddedSuffix: { th: 'เข้าสู่ระบบแล้ว', en: 'to system', ja: 'をシステムに追加', ru: 'в систему', zh: '到系统' },
  alertCustomerCannotEdit: { th: 'ลูกค้าไม่สามารถแก้ไขการจองได้ กรุณาติดต่อหน้าร้าน', en: 'Customers cannot modify bookings. Please contact the front desk.', ja: 'お客様は予約を変更できません。フロントにお問い合わせください。', ru: 'Клиенты не могут менять бронь. Обратитесь на рецепцию.', zh: '客户无法修改预订，请联系前台。' },
  alertCoachSaved: { th: 'บันทึกโค้ชสำเร็จ', en: 'Coach saved successfully', ja: 'コーチを保存しました', ru: 'Тренер сохранён', zh: '教练保存成功' },
  alertCoachBusyManage: { th: 'ไม่ว่างในเวลานี้', en: 'is busy at this time', ja: 'はこの時間帯は予約済みです', ru: 'занят в это время', zh: '此时间忙碌' },
  alertChooseAnotherCoach: { th: 'กรุณาเลือกโค้ชท่านอื่น', en: 'Please choose another coach', ja: '別のコーチを選択してください', ru: 'Выберите другого тренера', zh: '请选择其他教练' },
  alertConfirmCancel: { th: 'คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?', en: 'Do you want to cancel this booking?', ja: 'この予約をキャンセルしますか？', ru: 'Отменить бронирование?', zh: '确定取消此预订吗？' },

  // ---- CSV export headers ----
  csvId: { th: 'รหัส', en: 'ID', ja: 'ID', ru: 'ID', zh: 'ID' },
  csvDate: { th: 'วันที่', en: 'Date', ja: '日付', ru: 'Дата', zh: '日期' },
  csvTime: { th: 'เวลา', en: 'Time', ja: '時間', ru: 'Время', zh: '时间' },
  csvMachine: { th: 'เครื่อง', en: 'Machine', ja: 'マシン', ru: 'Машина', zh: '设备' },
  csvCustomer: { th: 'ชื่อลูกค้า', en: 'Customer', ja: 'お客様', ru: 'Клиент', zh: '客户' },
  csvPhone: { th: 'เบอร์โทร', en: 'Phone', ja: '電話', ru: 'Телефон', zh: '电话' },
  csvCoach: { th: 'โค้ช', en: 'Coach', ja: 'コーチ', ru: 'Тренер', zh: '教练' },
  csvCoachName: { th: 'ชื่อโค้ช', en: 'Coach Name', ja: 'コーチ名', ru: 'Имя тренера', zh: '教练姓名' },
  csvMemberQuota: { th: 'สิทธิ์สมาชิก', en: 'Member Quota', ja: '会員枠', ru: 'Квота участника', zh: '会员额度' },
  csvStatus: { th: 'สถานะ', en: 'Status', ja: 'ステータス', ru: 'Статус', zh: '状态' },
  csvDiscount: { th: 'ส่วนลด', en: 'Discount', ja: '割引', ru: 'Скидка', zh: '折扣' },
  csvNetAmount: { th: 'ยอดสุทธิ', en: 'Net Amount', ja: '合計金額', ru: 'Сумма', zh: '净金额' },
  csvHasCoach: { th: 'มี', en: 'Yes', ja: 'あり', ru: 'Да', zh: '有' },
  csvNoCoach: { th: 'ไม่มี', en: 'No', ja: 'なし', ru: 'Нет', zh: '无' },
  csvDeductHours: { th: 'หักชั่วโมง', en: 'Deducted', ja: '控除', ru: 'Списано', zh: '扣除' },
  csvNormalPay: { th: 'จ่ายปกติ', en: 'Normal', ja: '通常', ru: 'Обычная', zh: '正常' },

  // ---- Calendar view ----
  bookingsCount: { th: 'รายการ', en: 'bookings', ja: '件', ru: 'бронирований', zh: '预订' },

  // ---- Misc ----
  bahtUnit: { th: 'บาท', en: 'THB', ja: 'バーツ', ru: 'бат', zh: '泰铢' },

  // ---- Lesson Notes ----
  uniqueClients: { th: 'ลูกค้า', en: 'Clients', ja: '生徒数', ru: 'Клиенты', zh: '学员' },
  lessonNotes: { th: 'บันทึกการสอน', en: 'Lesson Notes', ja: 'レッスンノート', ru: 'Заметки урока', zh: '课程笔记' },
  addNotes: { th: 'เพิ่มบันทึก', en: 'Add Notes', ja: 'ノート追加', ru: 'Добавить заметку', zh: '添加笔记' },
  editNotes: { th: 'แก้ไขบันทึก', en: 'Edit Notes', ja: 'ノート編集', ru: 'Редактировать', zh: '编辑笔记' },
  viewNotes: { th: 'ดูบันทึก', en: 'View Notes', ja: 'ノート閲覧', ru: 'Просмотр', zh: '查看笔记' },
  lessonNumber: { th: 'ครั้งที่', en: 'Lesson #', ja: 'レッスン#', ru: 'Урок #', zh: '第' },
  topicTaught: { th: 'หัวข้อที่สอน', en: 'Topic Taught', ja: '指導内容', ru: 'Тема', zh: '教学主题' },
  homeworkAssigned: { th: 'การบ้าน', en: 'Homework', ja: '宿題', ru: 'Домашнее задание', zh: '作业' },
  generalNotes: { th: 'บันทึกทั่วไป', en: 'General Notes', ja: 'メモ', ru: 'Заметки', zh: '备注' },
  attachments: { th: 'ไฟล์แนบ', en: 'Attachments', ja: '添付ファイル', ru: 'Вложения', zh: '附件' },
  addAttachment: { th: 'แนบไฟล์/รูป', en: 'Attach File/Image', ja: 'ファイル添付', ru: 'Прикрепить файл', zh: '添加附件/图片' },
  saveNotes: { th: 'บันทึก', en: 'Save Notes', ja: 'ノート保存', ru: 'Сохранить', zh: '保存笔记' },
  noNotesYet: { th: 'ยังไม่มีบันทึก', en: 'No notes yet', ja: 'ノートなし', ru: 'Нет заметок', zh: '暂无笔记' },
  learningHistory: { th: 'ประวัติการเรียน', en: 'Learning History', ja: '学習履歴', ru: 'История обучения', zh: '学习历史' },
  noLearningHistory: { th: 'ยังไม่มีประวัติการเรียน', en: 'No learning history yet', ja: '学習履歴なし', ru: 'Нет истории', zh: '暂无学习记录' },
  topicPlaceholder: { th: 'เช่น Swing Basic, Short Game', en: 'e.g. Swing Basic, Short Game', ja: '例: スイング基礎', ru: 'напр. Свинг, Паттинг', zh: '例如：挥杆基础' },
  homeworkPlaceholder: { th: 'เช่น ฝึก Putting 30 นาที/วัน', en: 'e.g. Practice putting 30 min/day', ja: '例: パッティング30分/日', ru: 'напр. Паттинг 30 мин/день', zh: '例如：每天练习推杆30分钟' },
  notesPlaceholder: { th: 'บันทึกเพิ่มเติม...', en: 'Additional notes...', ja: '追加メモ...', ru: 'Дополнительные заметки...', zh: '额外备注...' },
  fileTooLarge: { th: 'ไฟล์ต้องมีขนาดไม่เกิน 2MB', en: 'File must be under 2MB', ja: 'ファイルは2MB以下', ru: 'Файл до 2МБ', zh: '文件不超过2MB' },

  // ---- Coach Clients Page ----
  myClients: { th: 'ลูกค้าของฉัน', en: 'My Clients', ja: '担当生徒', ru: 'Мои клиенты', zh: '我的学员' },
  totalClients: { th: 'ลูกค้าทั้งหมด', en: 'Total Clients', ja: '生徒総数', ru: 'Всего клиентов', zh: '学员总数' },
  totalLessons: { th: 'สอนทั้งหมด', en: 'Total Lessons', ja: '総レッスン数', ru: 'Всего уроков', zh: '总课程数' },
  clientLessonLog: { th: 'บันทึกการสอน', en: 'Lesson Log', ja: 'レッスン記録', ru: 'Журнал уроков', zh: '课程记录' },
  addNewNote: { th: 'เพิ่มบันทึกใหม่', en: 'Add New Note', ja: '新規ノート', ru: 'Новая заметка', zh: '添加新笔记' },
  lastLesson: { th: 'สอนล่าสุด', en: 'Last Lesson', ja: '最終レッスン', ru: 'Последний урок', zh: '最近课程' },
  lessonsCount: { th: 'สอนแล้ว', en: 'Lessons', ja: 'レッスン', ru: 'Уроков', zh: '已上课' },
  timesUnit: { th: 'ครั้ง', en: 'times', ja: '回', ru: 'раз', zh: '次' },
  noClients: { th: 'ยังไม่มีลูกค้า', en: 'No clients yet', ja: '生徒がいません', ru: 'Нет клиентов', zh: '暂无学员' },
  noClientsDesc: { th: 'เมื่อมีการจองเรียนกับคุณ ลูกค้าจะแสดงที่นี่', en: 'Clients will appear here when they book lessons with you', ja: 'レッスン予約が入ると生徒が表示されます', ru: 'Клиенты появятся после бронирования уроков', zh: '当学员预约您的课程后将显示在这里' },
  backToList: { th: 'กลับ', en: 'Back', ja: '戻る', ru: 'Назад', zh: '返回' },
  lessonOf: { th: 'ของ', en: 'for', ja: 'の', ru: 'для', zh: '的' },

  // ---- Customer My Lessons Page ----
  myLessons: { th: 'บทเรียนของฉัน', en: 'My Lessons', ja: 'マイレッスン', ru: 'Мои уроки', zh: '我的课程' },
  completedLessons: { th: 'เรียนแล้ว', en: 'Completed', ja: '受講済み', ru: 'Завершено', zh: '已完成' },
  myCoaches: { th: 'โค้ชของฉัน', en: 'My Coaches', ja: '担当コーチ', ru: 'Мои тренеры', zh: '我的教练' },
  allLessonsFromCoach: { th: 'บทเรียนจาก', en: 'Lessons from', ja: 'レッスン:', ru: 'Уроки от', zh: '来自' },
  noLessonsYet: { th: 'คุณยังไม่มีบทเรียน', en: 'No lessons yet', ja: 'レッスンなし', ru: 'Уроков пока нет', zh: '暂无课程' },
  noLessonsDesc: { th: 'เมื่อโค้ชบันทึกการสอน จะแสดงที่นี่', en: 'Lessons will appear here when your coach adds notes', ja: 'コーチがノートを追加すると表示されます', ru: 'Появится после добавления заметок тренером', zh: '当教练添加笔记后将显示在这里' },
  viewAll: { th: 'ดูทั้งหมด', en: 'View All', ja: 'すべて表示', ru: 'Показать все', zh: '查看全部' },
  lessonDetail: { th: 'รายละเอียดการสอน', en: 'Lesson Details', ja: 'レッスン詳細', ru: 'Детали урока', zh: '课程详情' },
  homeworkSection: { th: 'การบ้าน', en: 'Homework', ja: '宿題', ru: 'Домашнее задание', zh: '作业' },
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

  // ========== Toast System ==========
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  // ========== Confirm Dialog System ==========
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', type: 'warning', confirmLabel: '', cancelLabel: '', onConfirm: null });
  const showConfirm = useCallback(({ title, message, type = 'warning', confirmLabel, cancelLabel }) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true, title, message, type,
        confirmLabel: confirmLabel || t('confirm') || 'ยืนยัน',
        cancelLabel: cancelLabel || t('cancel') || 'ยกเลิก',
        onConfirm: () => { setConfirmState(prev => ({ ...prev, open: false })); resolve(true); },
      });
    });
  }, [lang]);
  const cancelConfirm = useCallback(() => { setConfirmState(prev => ({ ...prev, open: false })); }, []);

  // ========== Logo State ==========
  const [companyLogo, setCompanyLogo] = useState(() => localStorage.getItem('golf_company_logo') || '');
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) { showToast(t('alertImageTooLarge'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCompanyLogo(dataUrl);
      localStorage.setItem('golf_company_logo', dataUrl);
      showToast(t('logoUpdated') || 'อัปเดตโลโก้แล้ว', 'success');
    };
    reader.readAsDataURL(file);
  };

  const timeSlots = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00 - ${(i + 1).toString().padStart(2, '0')}:00`);
  }

  // Check if a time slot has already passed for a given date
  const isSlotPassed = (date, time) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (date < today) return true;
    if (date > today) return false;
    // Same day: check if the start hour has passed
    const startHour = parseInt(time.split(':')[0], 10);
    return now.getHours() >= startHour;
  };

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
  const [userSearch, setUserSearch] = useState('');
  const [coachSearch, setCoachSearch] = useState('');
  const [showBayFormModal, setShowBayFormModal] = useState(false);
  const [showCoachFormModal, setShowCoachFormModal] = useState(false);
  const [showPromoFormModal, setShowPromoFormModal] = useState(false);
  const [showPkgFormModal, setShowPkgFormModal] = useState(false);
  const [bayForm, setBayForm] = useState({ name: '', type: 'foresight', price: 1000 });
  const [editingBayId, setEditingBayId] = useState(null);
  const [pkgForm, setPkgForm] = useState({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' });
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: 0, expiryDate: '' });
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [coachForm, setCoachForm] = useState({ name: '', price: 1500, education: '', expertise: '', bio: '', phone: '', password: '1234' });
  const [editingCoachId, setEditingCoachId] = useState(null);

  // Coach CRUD
  const handleSaveCoach = async () => {
    if (!coachForm.name.trim()) { showToast(t('alertEnterCoachName'), 'warning'); return; }
    try {
      if (editingCoachId) {
        const updated = await api(`/api/coaches/${editingCoachId}`, { method: 'PUT', body: { name: coachForm.name.trim(), price: Number(coachForm.price) || 1500, education: coachForm.education, expertise: coachForm.expertise, bio: coachForm.bio } });
        setCoaches(coaches.map(c => c.id === editingCoachId ? updated : c));
        setEditingCoachId(null);
        showToast(t('saved') || 'บันทึกแล้ว', 'success');
      } else {
        if (!coachForm.phone.trim()) { showToast(t('coachPhone'), 'warning'); return; }
        const created = await api('/api/coaches', { method: 'POST', body: { name: coachForm.name.trim(), price: Number(coachForm.price) || 1500, education: coachForm.education, expertise: coachForm.expertise, bio: coachForm.bio } });
        setCoaches([...coaches, created]);
        const newUser = await api('/api/auth/register', { method: 'POST', body: { name: coachForm.name.trim(), phone: coachForm.phone.trim(), password: coachForm.password || '1234', role: 'coach', coachName: coachForm.name.trim() } });
        setAppUsers([...appUsers, newUser]);
        showToast(`${t('coachAccountCreated')} — ${coachForm.phone.trim()}`, 'success');
      }
    } catch (err) { console.error('Save coach error:', err); showToast(err.message, 'error'); }
    setCoachForm({ name: '', price: 1500, education: '', expertise: '', bio: '', phone: '', password: '1234' });
  };
  const handleEditCoach = (coach) => {
    setEditingCoachId(coach.id);
    setCoachForm({ name: coach.name, price: coach.price, education: coach.education || '', expertise: coach.expertise || '', bio: coach.bio || '', phone: '', password: '' });
  };
  const handleToggleCoach = async (id) => {
    const coach = coaches.find(c => c.id === id);
    if (!coach) return;
    try {
      const updated = await api(`/api/coaches/${id}`, { method: 'PUT', body: { active: !coach.active } });
      setCoaches(coaches.map(c => c.id === id ? updated : c));
    } catch (err) { console.error(err); }
  };
  const handleDeleteCoach = async (id) => {
    const ok = await showConfirm({ title: t('deleteConfirmTitle') || 'ยืนยันการลบ', message: t('alertDeleteCoach'), type: 'danger', confirmLabel: t('delete') || 'ลบ' });
    if (ok) { try { await api(`/api/coaches/${id}`, { method: 'DELETE' }); setCoaches(coaches.filter(c => c.id !== id)); showToast(t('deleted') || 'ลบแล้ว', 'success'); } catch (err) { console.error(err); } }
  };

  // Bay CRUD
  const handleSaveBay = async () => {
    if (!bayForm.name.trim()) { showToast(t('alertEnterBayName'), 'warning'); return; }
    try {
      if (editingBayId) {
        const updated = await api(`/api/bays/${editingBayId}`, { method: 'PUT', body: { name: bayForm.name.trim(), type: bayForm.type || null, price: Number(bayForm.price) || 1000 } });
        setBays(bays.map(b => b.id === editingBayId ? updated : b));
        setEditingBayId(null);
      } else {
        const created = await api('/api/bays', { method: 'POST', body: { name: bayForm.name.trim(), type: bayForm.type || null, price: Number(bayForm.price) || 1000 } });
        setBays([...bays, created]);
      }
    } catch (err) { console.error(err); }
    setBayForm({ name: '', type: 'foresight', price: 1000 });
  };
  const handleEditBay = (bay) => {
    setEditingBayId(bay.id);
    setBayForm({ name: bay.name, type: bay.type || '', price: bay.price });
  };
  const handleToggleBay = async (id) => {
    const bay = bays.find(b => b.id === id);
    if (!bay) return;
    try { const updated = await api(`/api/bays/${id}`, { method: 'PUT', body: { active: !bay.active } }); setBays(bays.map(b => b.id === id ? updated : b)); } catch (err) { console.error(err); }
  };
  const handleDeleteBay = async (id) => {
    const ok = await showConfirm({ title: t('deleteConfirmTitle') || 'ยืนยันการลบ', message: t('alertDeleteBay'), type: 'danger', confirmLabel: t('delete') || 'ลบ' });
    if (ok) { try { await api(`/api/bays/${id}`, { method: 'DELETE' }); setBays(bays.filter(b => b.id !== id)); showToast(t('deleted') || 'ลบแล้ว', 'success'); } catch (err) { console.error(err); } }
  };

  // User Delete (admin)
  const handleDeleteUser = async (id) => {
    const ok = await showConfirm({ title: t('deleteUser'), message: t('confirmDeleteUser'), type: 'danger', confirmLabel: t('delete') || 'ลบ' });
    if (ok) {
      try { await api(`/api/users/${id}`, { method: 'DELETE' }); setAppUsers(appUsers.filter(u => u.id !== id)); showToast(t('userDeleted'), 'success'); } catch (err) { console.error(err); }
    }
  };

  // Package CRUD
  const handleSavePackage = async () => {
    if (!pkgForm.name.trim()) { showToast(t('alertEnterPkgName'), 'warning'); return; }
    try {
      if (editingPkgId) {
        const updated = await api(`/api/packages/${editingPkgId}`, { method: 'PUT', body: { ...pkgForm, name: pkgForm.name.trim(), hours: Number(pkgForm.hours), price: Number(pkgForm.price) } });
        setPackages(packages.map(p => p.id === editingPkgId ? updated : p));
        setEditingPkgId(null);
      } else {
        const created = await api('/api/packages', { method: 'POST', body: { ...pkgForm, name: pkgForm.name.trim(), hours: Number(pkgForm.hours), price: Number(pkgForm.price) } });
        setPackages([...packages, created]);
      }
    } catch (err) { console.error(err); }
    setPkgForm({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' });
  };
  const handleEditPackage = (pkg) => {
    setEditingPkgId(pkg.id);
    setPkgForm({ name: pkg.name, hours: pkg.hours, price: pkg.price, machineType: pkg.machineType, highlight: pkg.highlight, save: pkg.save || '', desc: pkg.desc || '' });
  };
  const handleTogglePackage = async (id) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    try { const updated = await api(`/api/packages/${id}`, { method: 'PUT', body: { active: !pkg.active } }); setPackages(packages.map(p => p.id === id ? updated : p)); } catch (err) { console.error(err); }
  };
  const handleDeletePackage = async (id) => {
    const ok = await showConfirm({ title: t('deleteConfirmTitle') || 'ยืนยันการลบ', message: t('alertDeletePkg'), type: 'danger', confirmLabel: t('delete') || 'ลบ' });
    if (ok) { try { await api(`/api/packages/${id}`, { method: 'DELETE' }); setPackages(packages.filter(p => p.id !== id)); showToast(t('deleted') || 'ลบแล้ว', 'success'); } catch (err) { console.error(err); } }
  };

  // Promo CRUD
  const handleSavePromo = async () => {
    if (!promoForm.code.trim()) { showToast(t('alertEnterPromoCode'), 'warning'); return; }
    try {
      if (editingPromoId) {
        const updated = await api(`/api/promo-codes/${editingPromoId}`, { method: 'PUT', body: { ...promoForm, code: promoForm.code.trim().toUpperCase(), value: Number(promoForm.value) } });
        setPromoCodes(promoCodes.map(p => p.id === editingPromoId ? updated : p));
        setEditingPromoId(null);
      } else {
        const created = await api('/api/promo-codes', { method: 'POST', body: { ...promoForm, code: promoForm.code.trim().toUpperCase(), value: Number(promoForm.value) } });
        setPromoCodes([...promoCodes, created]);
      }
    } catch (err) { console.error(err); }
    setPromoForm({ code: '', type: 'percent', value: 0, expiryDate: '' });
  };
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo.id);
    setPromoForm({ code: promo.code, type: promo.type, value: promo.value, expiryDate: promo.expiryDate || '' });
  };
  const handleTogglePromo = async (id) => {
    const promo = promoCodes.find(p => p.id === id);
    if (!promo) return;
    try { const updated = await api(`/api/promo-codes/${id}`, { method: 'PUT', body: { active: !promo.active } }); setPromoCodes(promoCodes.map(p => p.id === id ? updated : p)); } catch (err) { console.error(err); }
  };
  const handleDeletePromo = async (id) => {
    const ok = await showConfirm({ title: t('deleteConfirmTitle') || 'ยืนยันการลบ', message: t('alertDeletePromo'), type: 'danger', confirmLabel: t('delete') || 'ลบ' });
    if (ok) { try { await api(`/api/promo-codes/${id}`, { method: 'DELETE' }); setPromoCodes(promoCodes.filter(p => p.id !== id)); showToast(t('deleted') || 'ลบแล้ว', 'success'); } catch (err) { console.error(err); } }
  };

  // Coach profile modal
  const [viewingCoach, setViewingCoach] = useState(null);

  // Avatar upload helper
  const handleAvatarUpload = (file, callback) => {
    if (!file) return;
    if (file.size > 500000) { showToast(t('alertImageTooLarge'), 'error'); return; }
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

  // ---------------- LESSON NOTES HANDLERS ----------------
  const getLessonNotesForBooking = (bookingId) => lessonNotes.find(n => n.bookingId === bookingId);
  const getNextLessonNumber = (customerPhone, coachName) => {
    const existing = lessonNotes.filter(n => n.customerPhone === customerPhone && n.coachName === coachName);
    return existing.length > 0 ? Math.max(...existing.map(n => n.lessonNumber)) + 1 : 1;
  };
  const openLessonNoteModal = (booking, existingNote = null) => {
    if (existingNote) {
      setEditingLessonNote(existingNote);
      setLessonNoteForm({
        bookingId: existingNote.bookingId, coachName: existingNote.coachName,
        customerPhone: existingNote.customerPhone, customerName: existingNote.customerName,
        date: existingNote.date, lessonNumber: existingNote.lessonNumber,
        topic: existingNote.topic, homework: existingNote.homework,
        notes: existingNote.notes, attachments: existingNote.attachments || [],
      });
    } else {
      setEditingLessonNote(null);
      setLessonNoteForm({
        bookingId: booking.id, coachName: booking.coachName,
        customerPhone: booking.phone, customerName: booking.customerName,
        date: booking.date, lessonNumber: getNextLessonNumber(booking.phone, booking.coachName),
        topic: '', homework: '', notes: '', attachments: [],
      });
    }
    setIsLessonNoteModalOpen(true);
  };
  const handleSaveLessonNote = async () => {
    try {
      if (editingLessonNote) {
        const updated = await api(`/api/lesson-notes/${editingLessonNote.id}`, { method: 'PUT', body: lessonNoteForm });
        setLessonNotes(lessonNotes.map(n => n.id === editingLessonNote.id ? updated : n));
      } else {
        const created = await api('/api/lesson-notes', { method: 'POST', body: lessonNoteForm });
        setLessonNotes([...lessonNotes, created]);
      }
      setIsLessonNoteModalOpen(false);
    } catch (err) {
      console.error('Save lesson note error:', err);
    }
  };
  const handleLessonNoteAttachment = (file) => {
    if (!file) return;
    if (file.size > 2000000) { showToast(t('fileTooLarge'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setLessonNoteForm(prev => ({
        ...prev, attachments: [...prev.attachments, { name: file.name, type: file.type, dataUrl: e.target.result }]
      }));
    };
    reader.readAsDataURL(file);
  };
  const removeLessonNoteAttachment = (index) => {
    setLessonNoteForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };
  // Open lesson note modal for a client (no specific booking - for adding from clients page)
  const openNewNoteForClient = (clientPhone, clientName, coachName) => {
    setEditingLessonNote(null);
    setLessonNoteForm({
      bookingId: `manual_${Date.now()}`, coachName,
      customerPhone: clientPhone, customerName: clientName,
      date: getTodayString(), lessonNumber: getNextLessonNumber(clientPhone, coachName),
      topic: '', homework: '', notes: '', attachments: [],
    });
    setIsLessonNoteModalOpen(true);
  };

  // ---------------- AUTH STATE ----------------
  const [appUsers, setAppUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [authBirthdate, setAuthBirthdate] = useState('');
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

  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [lessonNotes, setLessonNotes] = useState([]);

  // Load all data from API
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadAllData = async () => {
    try {
      const [usersData, coachesData, baysData, bookingsData, membersData, notesData, packagesData, promosData] = await Promise.all([
        api('/api/users'),
        api('/api/coaches'),
        api('/api/bays'),
        api('/api/bookings'),
        api('/api/members'),
        api('/api/lesson-notes'),
        api('/api/packages'),
        api('/api/promo-codes'),
      ]);
      setAppUsers(usersData);
      setCoaches(coachesData);
      setBays(baysData);
      setBookings(bookingsData);
      setMembers(membersData);
      setLessonNotes(notesData);
      setPackages(packagesData);
      setPromoCodes(promosData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load data:', err);
      setDataLoaded(true); // still show UI
    }
  };
  useEffect(() => { loadAllData(); }, []);

  // REMOVED HARDCODED DATA - now loaded from API
  // Old bookings data removed (was line 720-754)
  const [isLessonNoteModalOpen, setIsLessonNoteModalOpen] = useState(false);
  const [editingLessonNote, setEditingLessonNote] = useState(null);
  const [lessonNoteForm, setLessonNoteForm] = useState({
    bookingId: null, coachName: '', customerPhone: '', customerName: '', date: '',
    lessonNumber: 1, topic: '', homework: '', notes: '', attachments: [],
  });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // { phone, name } for coach-clients detail view
  const [expandedLessons, setExpandedLessons] = useState({}); // { noteId: 'detail' | 'homework' | null } for accordion
  const [selectedLessonCoach, setSelectedLessonCoach] = useState(null); // coach name for customer lesson detail view
  const [viewingLessonNote, setViewingLessonNote] = useState(null); // lesson note detail view

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
  const [bookingSearch, setBookingSearch] = useState('');

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
      showToast(t('alertPromoNoQuota'), 'warning');
      return;
    }
    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : 1000;
    const coachP = withCoach && selectedCoach ? getCoachPrice(selectedCoach) : 0;
    const foundPromo = promoCodes.find(p => p.code === promoCode.trim().toUpperCase() && p.active);
    if (!foundPromo) {
      setDiscountAmount(0);
      showToast(t('alertPromoInvalid'), 'error');
      return;
    }
    if (foundPromo.expiryDate && new Date(foundPromo.expiryDate) < new Date()) {
      setDiscountAmount(0);
      showToast(t('alertPromoExpired'), 'error');
      return;
    }
    if (foundPromo.type === 'percent') {
      const subtotal = basePrice + coachP;
      setDiscountAmount(subtotal * (foundPromo.value / 100));
      showToast(`${t('alertPromoSuccessPercent')} ${foundPromo.value}%`, 'success');
    } else {
      setDiscountAmount(foundPromo.value);
      showToast(`${t('alertPromoSuccessFixed')} ${foundPromo.value.toLocaleString()} ${t('bahtUnit')}`, 'success');
    }
  };

  const openBookingModal = (machine, time) => {
    if (isSlotPassed(currentDate, time)) {
      showToast(t('alertTimePassed'), 'warning');
      return;
    }
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
      showToast(t('alertFillNamePhone'), 'warning');
      return;
    }

    const basePrice = selectedSlot ? getBasePrice(selectedSlot.machine) : 1000;

    // Validate member quota usage
    if (useMemberQuota && foundMember && selectedSlot) {
      const machineType = getMachineType(selectedSlot.machine);
      if (!machineType) {
        showToast(t('alertBayNoMember'), 'warning');
        setUseMemberQuota(false);
        return;
      }
      const availableHours = getMemberHoursForMachine(foundMember, selectedSlot.machine);
      if (availableHours <= 0) {
        showToast(`${machineType === 'trackman' ? 'Trackman' : 'Foresight'} ${t('alertHoursUsedUp')}`, 'warning');
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
        showToast(`${bookingCoach} ${t('alertCourseCoachBusy')}`, 'warning');
        return;
      }
    } else if (withCoach && selectedCoach) {
      // Bay booking with optional coach add-on
      bookingCoach = selectedCoach;
      coachPrice = getCoachPrice(selectedCoach);
      if (isCoachBusy(selectedCoach, currentDate, selectedTime)) {
        showToast(`${selectedCoach} ${t('alertCoachBusy')}`, 'warning');
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
        showToast(t('alertMemberBookingSuccess'), 'success');
      }
    }
  };

  const saveBooking = async (bookingData) => {
    try {
      const created = await api('/api/bookings', { method: 'POST', body: bookingData });
      setBookings([...bookings, created]);

      if (bookingData.usedQuota) {
        const machineType = getMachineType(bookingData.machine);
        const member = members.find(m => m.phone === bookingData.phone);
        if (member) {
          const updateData = {};
          if (machineType === 'trackman') updateData.trackmanHours = Math.max(0, member.trackmanHours - 1);
          else if (machineType === 'foresight') updateData.foresightHours = Math.max(0, member.foresightHours - 1);
          const updated = await api(`/api/members/${member.phone}`, { method: 'PUT', body: updateData });
          setMembers(members.map(m => m.phone === member.phone ? updated : m));
        }
      }

      if (bookingData.email) {
        showToast(`${t('alertCalendarSent')} ${bookingData.email} ${t('alertCalendarSentSuffix')}`, 'success');
      }
    } catch (err) {
      console.error('Save booking error:', err);
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
      showToast(t('alertFillNamePhonePkg'), 'warning');
      return;
    }
    if (!pkgCoach) {
      showToast(t('alertSelectCoach'), 'warning');
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

  const savePackagePurchase = async (data) => {
    const pkg = data.package;
    const machineType = pkg.machineType;
    const coachName = data.coachName || '';
    const existingMember = members.find(m => m.phone === data.phone);

    try {
      if (existingMember) {
        const updateData = { name: data.name, email: data.email || existingMember.email, lineId: data.lineId || existingMember.lineId };
        if (machineType === 'trackman') {
          updateData.trackmanHours = existingMember.trackmanHours + pkg.hours;
          updateData.trackmanBought = existingMember.trackmanBought + pkg.hours;
          updateData.trackmanCoach = coachName;
        } else {
          updateData.foresightHours = existingMember.foresightHours + pkg.hours;
          updateData.foresightBought = existingMember.foresightBought + pkg.hours;
          updateData.foresightCoach = coachName;
        }
        const updated = await api(`/api/members/${data.phone}`, { method: 'PUT', body: updateData });
        setMembers(members.map(m => m.phone === data.phone ? updated : m));
      } else {
        const newMember = {
          phone: data.phone, name: data.name, email: data.email, lineId: data.lineId,
          trackmanHours: 0, trackmanBought: 0, trackmanCoach: '',
          foresightHours: 0, foresightBought: 0, foresightCoach: '',
        };
        if (machineType === 'trackman') {
          newMember.trackmanHours = pkg.hours; newMember.trackmanBought = pkg.hours; newMember.trackmanCoach = coachName;
        } else {
          newMember.foresightHours = pkg.hours; newMember.foresightBought = pkg.hours; newMember.foresightCoach = coachName;
        }
        const created = await api('/api/members', { method: 'POST', body: newMember });
        setMembers([...members, created]);
      }
    } catch (err) { console.error('Save purchase error:', err); }
    showToast(`${t('alertPkgSuccess')} ${data.package.name} — ${coachName} • ${pkg.hours} ${t('hrsUnit')} ${machineType === 'trackman' ? 'Trackman' : 'Foresight'}`, 'success', 5000);
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
      showToast(t('alertCustomerCannotEdit'), 'warning');
      return;
    }
    setSelectedBooking(booking);
    setManageCoach(booking.coachName || '');
    setIsManageModalOpen(true);
  };

  const updateBookingStatus = async (id, newStatus) => {
    try {
      const updated = await api(`/api/bookings/${id}`, { method: 'PUT', body: { status: newStatus } });
      setBookings(bookings.map(b => b.id === id ? updated : b));
      setIsManageModalOpen(false);
    } catch (err) { console.error('Update status error:', err); }
  };

  const saveCoachAssignment = async () => {
    if (!selectedBooking) return;
    if (manageCoach && isCoachBusy(manageCoach, selectedBooking.date, selectedBooking.time, selectedBooking.id)) {
      showToast(`${manageCoach} ${t('alertCoachBusyManage')} (${selectedBooking.time}) ${t('alertChooseAnotherCoach')}`, 'warning');
      return;
    }
    try {
      const updated = await api(`/api/bookings/${selectedBooking.id}`, { method: 'PUT', body: { coachName: manageCoach, withCoach: manageCoach ? true : selectedBooking.withCoach } });
      setBookings(bookings.map(b => b.id === selectedBooking.id ? updated : b));
      setSelectedBooking(updated);
      showToast(t('alertCoachSaved'), 'success');
    } catch (err) { console.error('Save coach error:', err); }
  };

  const handleCancelBooking = async (booking) => {
    const ok = await showConfirm({ title: t('cancelBookingTitle') || 'ยกเลิกการจอง', message: t('alertConfirmCancel'), type: 'danger', confirmLabel: t('confirmCancel') || 'ยกเลิก' });
    if (ok) {
      try {
        if (booking.usedQuota && booking.status !== 'checked-in') {
          const machineType = getMachineType(booking.machine);
          const member = members.find(m => m.phone === booking.phone);
          if (member) {
            const updateData = {};
            if (machineType === 'trackman') updateData.trackmanHours = member.trackmanHours + 1;
            else if (machineType === 'foresight') updateData.foresightHours = member.foresightHours + 1;
            const updatedMember = await api(`/api/members/${member.phone}`, { method: 'PUT', body: updateData });
            setMembers(members.map(m => m.phone === member.phone ? updatedMember : m));
          }
        }
        await api(`/api/bookings/${booking.id}`, { method: 'DELETE' });
        setBookings(bookings.filter((b) => b.id !== booking.id));
        setIsManageModalOpen(false);
      } catch (err) { console.error('Cancel booking error:', err); }
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
      if (!byDay[b.date]) byDay[b.date] = { date: b.date, total: 0, revenue: 0, checkedIn: 0, noShow: 0, member: 0, walkIn: 0 };
      byDay[b.date].total++;
      if (b.status !== 'no-show') byDay[b.date].revenue += b.price;
      if (b.status === 'checked-in') byDay[b.date].checkedIn++;
      if (b.status === 'no-show') byDay[b.date].noShow++;
      if (b.usedQuota) byDay[b.date].member++;
      else byDay[b.date].walkIn++;
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
    const uniqueClients = new Set(myBookings.map(b => b.phone)).size;

    // Calendar grid data
    const calBlanks = Array.from({ length: new Date(calY, calM, 1).getDay() }, (_, i) => i);
    const calDays = Array.from({ length: new Date(calY, calM + 1, 0).getDate() }, (_, i) => i + 1);

    return {
      today, upcoming, past, uniqueClients,
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
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = await api('/api/auth/login', { method: 'POST', body: { phone: authPhone.trim(), password: authPassword } });
      setCurrentUser(user);
      if (user.role === 'coach') setViewMode('coach-schedule');
      else if (user.role === 'admin') setViewMode('daily');
      else setViewMode('daily');
      setAuthPhone('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(t('errPhoneOrPassword'));
    }
  };

  const hasSpecialChar = (pw) => /[^A-Za-z0-9]/.test(pw);
  const isPasswordStrong = (pw) => {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && hasSpecialChar(pw);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authLastName.trim() || !authNickname.trim() || !authBirthdate || !authPhone.trim() || !authPassword.trim()) {
      setAuthError(t('errFillAll'));
      return;
    }
    if (!isPasswordStrong(authPassword)) {
      setAuthError(t('errPasswordWeak'));
      return;
    }
    const fullName = `${authName.trim()} ${authLastName.trim()} (${authNickname.trim()})`;
    try {
      const newUser = await api('/api/auth/register', {
        method: 'POST',
        body: { name: fullName, phone: authPhone.trim(), password: authPassword, role: 'customer', nickname: authNickname.trim(), birthdate: authBirthdate },
      });
      setAppUsers([...appUsers, newUser]);
      setCurrentUser(newUser);
      setViewMode('daily');
      setAuthPhone('');
      setAuthPassword('');
      setAuthName('');
      setAuthLastName('');
      setAuthNickname('');
      setAuthBirthdate('');
      setAuthCoachName('');
    } catch (err) {
      setAuthError(t('errPhoneUsed'));
    }
  };

  // Social Login
  const LINE_CHANNEL_ID = import.meta.env.VITE_LINE_CHANNEL_ID || '';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const OAUTH_REDIRECT_URI = `${window.location.origin}/`;

  const handleLineLogin = () => {
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('line_state', state);
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}&state=${state}&scope=profile%20openid`;
    window.location.href = lineAuthUrl;
  };

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('google_state', state);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}&state=${state}&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  // Handle OAuth callbacks on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return;

    const savedLineState = sessionStorage.getItem('line_state');
    const savedGoogleState = sessionStorage.getItem('google_state');

    let provider = null;
    if (state === savedLineState) { provider = 'line'; sessionStorage.removeItem('line_state'); }
    else if (state === savedGoogleState) { provider = 'google'; sessionStorage.removeItem('google_state'); }
    else return;

    window.history.replaceState({}, '', '/');

    (async () => {
      try {
        const endpoint = provider === 'line' ? '/api/auth/line/callback' : '/api/auth/google/callback';
        const user = await api(endpoint, {
          method: 'POST',
          body: { code, redirectUri: OAUTH_REDIRECT_URI },
        });
        setCurrentUser(user);
        if (!appUsers.find(u => u.id === user.id)) {
          setAppUsers(prev => [...prev, user]);
        }
        setViewMode('daily');
      } catch (err) {
        console.error(`${provider} login error:`, err);
        setAuthError(t(provider === 'line' ? 'lineLoginError' : 'googleLoginError'));
      }
    })();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
    setAuthError('');
    setShowPassword(false);
  };

  // Language dropdown component
  const LANGUAGE_OPTIONS = [
    { key: 'th', label: 'TH', name: 'ไทย', flag: '🇹🇭' },
    { key: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
    { key: 'ja', label: 'JP', name: '日本語', flag: '🇯🇵' },
    { key: 'ru', label: 'RU', name: 'Русский', flag: '🇷🇺' },
    { key: 'zh', label: 'ZH', name: '中文', flag: '🇨🇳' },
  ];
  const LanguageDropdown = ({ className = '' }) => (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white ring-1 ring-gray-200 hover:ring-gray-300 text-sm font-medium text-gray-600 transition-all"
      >
        <Globe size={14} />
        {LANGUAGE_OPTIONS.find(l => l.key === lang)?.flag} {LANGUAGE_OPTIONS.find(l => l.key === lang)?.label || 'TH'}
        <ChevronDown size={12} className={`transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {langDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 py-1 z-50 min-w-[160px]">
            {LANGUAGE_OPTIONS.map(l => (
              <button
                key={l.key}
                onClick={() => { setLang(l.key); setLangDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  lang === l.key ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
                <span className="ml-auto text-xs text-gray-400">{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ---------------- LOGIN / REGISTER PAGE ----------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="flex justify-center mb-4">
            <LanguageDropdown />
          </div>
          {/* Logo */}
          <div className="text-center mb-8">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="w-20 h-20 object-contain mx-auto mb-4 rounded-2xl" />
            ) : (
              <div className="bg-gradient-to-br from-[#FF7A05] to-[#ff9a3c] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                <Monitor size={32} className="text-white" />
              </div>
            )}
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

                {/* Social Login */}
                {(LINE_CHANNEL_ID || GOOGLE_CLIENT_ID) && (
                  <>
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-xs text-gray-400">{t('orDivider')}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-2">
                      {GOOGLE_CLIENT_ID && (
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full py-3 rounded-xl font-medium text-gray-700 text-base flex items-center justify-center gap-2 transition-all hover:bg-gray-50 ring-1 ring-gray-200 bg-white"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          {t('loginWithGoogle')}
                        </button>
                      )}
                      {LINE_CHANNEL_ID && (
                        <button
                          type="button"
                          onClick={handleLineLogin}
                          className="w-full py-3 rounded-xl font-medium text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ backgroundColor: '#06C755' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                          {t('loginWithLine')}
                        </button>
                      )}
                    </div>
                  </>
                )}

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
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <User size={14} /> {t('firstName')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder={t('enterFirstName')}
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-1.5 block">
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={authLastName}
                      onChange={(e) => setAuthLastName(e.target.value)}
                      placeholder={t('enterLastName')}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <Star size={14} className="text-yellow-500" /> {t('nickname')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={authNickname}
                      onChange={(e) => setAuthNickname(e.target.value)}
                      placeholder={t('enterNickname')}
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1.5">
                      <CalendarDays size={14} className="text-blue-500" /> {t('birthdate')}
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={authBirthdate}
                      onChange={(e) => setAuthBirthdate(e.target.value)}
                      required
                    />
                  </div>
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
                  <p className="text-[11px] text-gray-400 mt-1">{t('passwordRequirements')}</p>
                  {authPassword && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {[
                        { ok: authPassword.length >= 8, label: '8+' },
                        { ok: /[A-Z]/.test(authPassword), label: 'A-Z' },
                        { ok: /[0-9]/.test(authPassword), label: '0-9' },
                        { ok: hasSpecialChar(authPassword), label: '!@#' },
                      ].map((r, i) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${r.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                          {r.ok ? '✓' : '✗'} {r.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {authError && (
                  <div className="bg-red-50 ring-1 ring-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                    <XCircle size={16} /> {authError}
                  </div>
                )}

                <button type="submit" className="w-full py-3 btn-primary flex items-center justify-center gap-2 text-base">
                  <UserPlus size={18} /> {t('register')}
                </button>

                {/* Social Login */}
                {(LINE_CHANNEL_ID || GOOGLE_CLIENT_ID) && (
                  <>
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-xs text-gray-400">{t('orDivider')}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-2">
                      {GOOGLE_CLIENT_ID && (
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full py-3 rounded-xl font-medium text-gray-700 text-base flex items-center justify-center gap-2 transition-all hover:bg-gray-50 ring-1 ring-gray-200 bg-white"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          {t('loginWithGoogle')}
                        </button>
                      )}
                      {LINE_CHANNEL_ID && (
                        <button
                          type="button"
                          onClick={handleLineLogin}
                          className="w-full py-3 rounded-xl font-medium text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ backgroundColor: '#06C755' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                          {t('loginWithLine')}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // ==================== MAIN APP (LOGGED IN) ====================
  return (
    <div className="min-h-screen bg-[#f8f8fa] p-4 md:p-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Top Header - User Info & Logout */}
        <div className="flex justify-end mb-1 gap-2">
          <LanguageDropdown />
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
                <ShoppingCart size={16} /> {t('membersAndCourses')}
              </button>
            )}
            {role === 'customer' && (
              <button
                onClick={() => { setViewMode('my-lessons'); setSelectedLessonCoach(null); setViewingLessonNote(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'my-lessons'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen size={16} /> {t('myLessons')}
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
            {role === 'coach' && (
              <button
                onClick={() => { setViewMode('coach-clients'); setSelectedClient(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'coach-clients'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users size={16} /> {t('myClients')}
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
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[72px] md:w-[90px]" />
                    {activeBayNames.map((m) => <col key={m} />)}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-2 py-3 font-medium text-gray-500 text-xs md:text-sm border-r border-gray-100 text-center sticky left-0 bg-white z-10">
                        <Clock size={13} className="inline mr-1 -mt-0.5"/> {t('time')}
                      </th>
                      {activeBayNames.map((machine) => (
                        <th key={machine} className="px-1.5 py-3 font-medium text-gray-800 text-center text-xs md:text-sm truncate">
                          {machine}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-b border-gray-50 table-row-hover">
                        <td className="px-1.5 py-2 font-medium text-gray-500 text-[11px] md:text-sm border-r border-gray-100 text-center sticky left-0 bg-white z-10 whitespace-nowrap">
                          {time.split(' - ')[0]}
                        </td>
                        {activeBayNames.map((machine) => {
                          const booking = getBooking(machine, time);
                          return (
                            <td key={`${machine}-${time}`} className="p-1 md:p-1.5 text-center">
                              {booking ? (
                                <div
                                  onClick={() => openManageModal(booking)}
                                  className={`p-1.5 md:p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 group relative min-h-[60px] cursor-pointer overflow-hidden ${
                                    role === 'admin'
                                      ? getStatusColor(booking.status)
                                      : (role === 'coach' && booking.withCoach && booking.coachName === selectedRoleCoach)
                                        ? getStatusColor(booking.status)
                                        : currentUser && booking.phone === currentUser.phone
                                          ? 'bg-emerald-50 ring-1 ring-emerald-200 cursor-default'
                                          : 'bg-gray-50 ring-1 ring-gray-100 cursor-default opacity-60'
                                  }`}
                                >
                                  {role === 'admin' ? (
                                    <>
                                      <span className="font-medium text-xs md:text-sm flex items-center gap-1 truncate max-w-full">
                                        {booking.status === 'checked-in' && <CheckCircle2 size={12} className="text-emerald-500 shrink-0"/>}
                                        {booking.status === 'no-show' && <XCircle size={12} className="text-gray-400 shrink-0"/>}
                                        <span className="truncate">{booking.customerName}</span>
                                      </span>
                                      <span className="text-[10px] text-gray-400 truncate max-w-full">{booking.phone}</span>
                                      <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                                        <span className={`badge text-[9px] md:text-[10px] ${
                                          booking.status === 'booked' ? 'badge-booked' :
                                          booking.status === 'checked-in' ? 'badge-checked-in' : 'badge-no-show'
                                        }`}>
                                          {booking.status === 'booked' ? t('statusBooked') : booking.status === 'checked-in' ? t('statusCheckedIn') : t('statusNoShow')}
                                        </span>
                                        {booking.usedQuota && <span className="badge badge-member text-[9px]"><Award size={9}/> M</span>}
                                        {booking.withCoach && <span className="badge badge-coach text-[9px]"><GraduationCap size={9} /> <span className="truncate max-w-[50px]">{booking.coachName || t('coach')}</span></span>}
                                      </div>
                                    </>
                                  ) : (role === 'coach' && booking.withCoach && booking.coachName === selectedRoleCoach) ? (
                                    <>
                                      <span className="font-medium text-sm flex items-center gap-1">
                                        {booking.status === 'checked-in' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                                        {booking.customerName}
                                      </span>
                                      <span className="text-[10px] text-gray-400 truncate max-w-full">{booking.phone}</span>
                                      <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                                        <span className={`badge text-[9px] ${
                                          booking.status === 'booked' ? 'badge-booked' :
                                          booking.status === 'checked-in' ? 'badge-checked-in' : 'badge-no-show'
                                        }`}>
                                          {booking.status === 'booked' ? t('statusBooked') : booking.status === 'checked-in' ? t('statusCheckedIn') : t('statusNoShow')}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    currentUser && booking.phone === currentUser.phone ? (
                                      <div className="flex flex-col items-center gap-0.5 overflow-hidden">
                                        <span className="text-emerald-600 font-medium text-xs">{t('myBooking')}</span>
                                        {booking.withCoach && <span className="badge badge-coach text-[9px] truncate max-w-full"><GraduationCap size={9} /> {booking.coachName || t('hasCoach')}</span>}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-gray-300 font-medium text-xs">{t('notAvailable')}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : isSlotPassed(currentDate, time) ? (
                                <div className="p-1.5 md:p-2 text-center min-h-[60px] flex items-center justify-center">
                                  <span className="text-[10px] md:text-xs text-gray-300 font-medium">{t('pastSlot')}</span>
                                </div>
                              ) : (
                                <div
                                  onClick={() => openBookingModal(machine, time)}
                                  className="slot-available p-1.5 md:p-2 group min-h-[60px]"
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
                <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium bg-white">{t('customerName')}</th>
                        <th className="px-4 py-3 font-medium bg-white">{t('contactPhone')}</th>
                        <th className="px-4 py-3 font-medium bg-white">{t('lineEmail')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('trackmanRemBought')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('foresightRemBought')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Merge all customers (from appUsers) with their member/course data
                        const customerUsers = appUsers.filter(u => u.role === 'customer');
                        const allRows = customerUsers.map(u => {
                          const m = members.find(mb => mb.phone === u.phone);
                          return {
                            name: u.name,
                            phone: u.phone,
                            lineId: m?.lineId || '',
                            email: m?.email || '',
                            trackmanHours: m?.trackmanHours || 0,
                            trackmanBought: m?.trackmanBought || 0,
                            trackmanCoach: m?.trackmanCoach || '',
                            foresightHours: m?.foresightHours || 0,
                            foresightBought: m?.foresightBought || 0,
                            foresightCoach: m?.foresightCoach || '',
                          };
                        });
                        // Also add members that aren't registered users (walk-in purchases)
                        members.forEach(m => {
                          if (!allRows.some(r => r.phone === m.phone)) {
                            allRows.push({ ...m });
                          }
                        });
                        return allRows.length > 0 ? allRows.map((member, idx) => (
                          <tr key={idx} className="border-b border-gray-50 table-row-hover">
                            <td className="px-4 py-3.5 font-medium text-gray-800">{member.name}</td>
                            <td className="px-4 py-3.5 text-gray-600 text-sm">{member.phone}</td>
                            <td className="px-4 py-3.5 text-gray-400 text-sm">
                              {member.lineId && <div className="flex items-center gap-1.5"><MessageCircle size={13}/> {member.lineId}</div>}
                              {member.email && <div className="flex items-center gap-1.5 mt-0.5"><Mail size={13}/> {member.email}</div>}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {member.trackmanBought > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`badge ${member.trackmanHours > 0 ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                    {member.trackmanHours} / {member.trackmanBought} {t('hoursUnit')}
                                  </span>
                                  {member.trackmanCoach && <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5"><GraduationCap size={10}/> {member.trackmanCoach}</span>}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {member.foresightBought > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`badge ${member.foresightHours > 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                    {member.foresightHours} / {member.foresightBought} {t('hoursUnit')}
                                  </span>
                                  {member.foresightCoach && <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5"><GraduationCap size={10}/> {member.foresightCoach}</span>}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="p-8 text-center text-gray-400">{t('noMembers')}</td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Customer My Lessons View */}
        {viewMode === 'my-lessons' && role === 'customer' && currentUser && (() => {
          const myNotes = lessonNotes
            .filter(n => n.customerPhone === currentUser.phone)
            .sort((a, b) => b.lessonNumber - a.lessonNumber);
          const byCoach = {};
          myNotes.forEach(n => {
            if (!byCoach[n.coachName]) byCoach[n.coachName] = [];
            byCoach[n.coachName].push(n);
          });
          const coachList = Object.keys(byCoach);
          const myBookings = bookings.filter(b => b.phone === currentUser.phone && b.withCoach);

          // === Level 3: Viewing a single lesson note ===
          if (viewingLessonNote) {
            const note = viewingLessonNote;
            return (
              <div className="space-y-5">
                <div className="card p-5">
                  {/* Back */}
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setViewingLessonNote(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{note.topic || `${t('lessonNumber')} ${note.lessonNumber}`}</h2>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{new Date(note.date).toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1"><GraduationCap size={11} /> {note.coachName}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {note.lessonNumber}
                    </div>
                  </div>

                  {/* Topic */}
                  {note.topic && (
                    <div className="mb-5">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{t('topicTaught')}</div>
                      <div className="text-base font-medium text-gray-900">{note.topic}</div>
                    </div>
                  )}

                  {/* Detail / Notes */}
                  {note.notes && (
                    <div className="mb-5">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{t('lessonDetail')}</div>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{note.notes}</p>
                    </div>
                  )}

                  {/* Homework */}
                  {note.homework && (
                    <div className="mb-5 bg-amber-50/50 rounded-xl p-4 ring-1 ring-amber-100">
                      <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1.5">{t('homeworkSection')}</div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.homework}</p>
                    </div>
                  )}

                  {/* Attachments / Images */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t('attachments')}</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {note.attachments.map((att, i) => (
                          att.type.startsWith('image/') ? (
                            <img key={i} src={att.dataUrl} alt={att.name} className="w-full aspect-square rounded-xl object-cover ring-1 ring-gray-200 cursor-pointer hover:ring-purple-300 hover:shadow-md transition-all" onClick={() => window.open(att.dataUrl)} />
                          ) : (
                            <a key={i} href={att.dataUrl} download={att.name} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 ring-1 ring-gray-200 hover:bg-gray-100 transition-colors aspect-square">
                              <Paperclip size={20} className="text-gray-400" />
                              <span className="text-xs text-gray-600 text-center truncate w-full">{att.name}</span>
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // === Level 2: Viewing lessons from a specific coach ===
          if (selectedLessonCoach) {
            const coachNotes = (byCoach[selectedLessonCoach] || []).sort((a, b) => a.lessonNumber - b.lessonNumber);
            const coachInfo = getCoachInfo(selectedLessonCoach);
            const coachBookings = myBookings.filter(b => b.coachName === selectedLessonCoach).sort((a, b) => b.date.localeCompare(a.date));

            return (
              <div className="space-y-5">
                {/* Header */}
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setSelectedLessonCoach(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                      <GraduationCap size={18} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900">{selectedLessonCoach}</div>
                      <div className="text-xs text-gray-400">{coachNotes.length} {t('lessonNotes')} &middot; {coachBookings.length} {t('sessions')}</div>
                    </div>
                    {coachInfo && (
                      <button onClick={() => setViewingCoach(coachInfo)} className="text-xs text-purple-600 hover:text-purple-700 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                        {t('viewProfile')}
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-semibold text-purple-700">{coachNotes.length}</div>
                      <div className="text-[11px] text-purple-500">{t('lessonNotes')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-semibold text-gray-700">{coachBookings.length}</div>
                      <div className="text-[11px] text-gray-500">{t('sessions')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-sm font-semibold text-gray-700">{coachBookings[0] ? new Date(coachBookings[0].date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' }) : '-'}</div>
                      <div className="text-[11px] text-gray-500">{t('lastLesson')}</div>
                    </div>
                  </div>
                </div>

                {/* Lesson list */}
                <div className="space-y-3">
                  {coachNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setViewingLessonNote(note)}
                      className="card p-4 cursor-pointer hover:ring-purple-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                          {note.lessonNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{note.topic || `${t('lessonNumber')} ${note.lessonNumber}`}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(note.date).toLocaleDateString(currentLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {note.homework && (
                            <div className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                              <BookOpen size={10} /> {t('homeworkSection')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {note.attachments && note.attachments.length > 0 && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Paperclip size={10} /> {note.attachments.length}</span>
                          )}
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {coachNotes.length === 0 && (
                  <div className="card p-8 text-center">
                    <FileText size={28} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">{t('noNotesYet')}</p>
                  </div>
                )}
              </div>
            );
          }

          // === Level 1: Coach list (main view) ===
          return (
            <div className="space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-purple-600">{myNotes.length}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('completedLessons')}</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">{coachList.length}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('myCoaches')}</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">{myBookings.length}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('sessions')}</div>
                </div>
              </div>

              {coachList.length > 0 ? (
                <div className="space-y-3">
                  {coachList.map(coachName => {
                    const coachNotes = byCoach[coachName].sort((a, b) => b.lessonNumber - a.lessonNumber);
                    const coachInfo = getCoachInfo(coachName);
                    const latestNote = coachNotes[0];
                    return (
                      <div
                        key={coachName}
                        className="card p-4 cursor-pointer hover:ring-purple-200 transition-all group"
                        onClick={() => setSelectedLessonCoach(coachName)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                            <GraduationCap size={20} className="text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{coachName}</span>
                              <span className="bg-purple-100 text-purple-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                {coachNotes.length} {t('lessonNotes')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {t('lastLesson')} {new Date(latestNote.date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' })}
                            </div>
                            {latestNote.topic && (
                              <div className="text-xs text-gray-500 mt-0.5 truncate">
                                {t('lessonNumber')}{latestNote.lessonNumber}: {latestNote.topic}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-400 transition-colors shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400 text-sm font-medium">{t('noLessonsYet')}</p>
                  <p className="text-gray-300 text-xs mt-1">{t('noLessonsDesc')}</p>
                </div>
              )}
            </div>
          );
        })()}

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
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              <div className="card p-4 text-center">
                <div className="text-2xl font-semibold text-purple-600">{coachSchedule.uniqueClients}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{t('uniqueClients')}</div>
              </div>
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
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`badge text-[11px] ${
                          b.status === 'checked-in' ? 'badge-checked-in' : 'badge-booked'
                        }`}>
                          {b.status === 'checked-in' ? t('statusCheckedIn') : t('waitingCustomer')}
                        </span>
                        {b.withCoach && (() => {
                          const note = getLessonNotesForBooking(b.id);
                          return (
                            <button onClick={() => openLessonNoteModal(b, note || null)} className={`p-1.5 rounded-lg transition-colors ${note ? 'text-purple-500 hover:bg-purple-50' : 'text-gray-300 hover:text-purple-600 hover:bg-purple-50'}`} title={note ? t('editNotes') : t('addNotes')}>
                              <FileText size={14} />
                            </button>
                          );
                        })()}
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
                          {b.withCoach && (() => {
                            const note = getLessonNotesForBooking(b.id);
                            return (
                              <button onClick={() => openLessonNoteModal(b, note || null)} className={`p-1.5 rounded-lg transition-colors ${note ? 'text-purple-500 hover:text-purple-700 hover:bg-purple-50' : 'text-gray-300 hover:text-purple-600 hover:bg-purple-50'}`} title={note ? t('editNotes') : t('addNotes')}>
                                <FileText size={14} />
                              </button>
                            );
                          })()}
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
                      {b.withCoach && (() => {
                        const note = getLessonNotesForBooking(b.id);
                        return (
                          <button onClick={() => openLessonNoteModal(b, note || null)} className={`p-1 rounded shrink-0 transition-colors ${note ? 'text-purple-500 hover:bg-purple-50' : 'text-gray-300 hover:text-purple-600 hover:bg-gray-100'}`} title={note ? t('editNotes') : t('addNotes')}>
                            <FileText size={13} />
                          </button>
                        );
                      })()}
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

        {/* Coach Clients View */}
        {viewMode === 'coach-clients' && role === 'coach' && (() => {
          const myBookings = bookings.filter(b => b.withCoach && b.coachName === selectedRoleCoach);
          // Build unique clients list with stats
          const clientMap = {};
          myBookings.forEach(b => {
            if (!clientMap[b.phone]) {
              clientMap[b.phone] = { phone: b.phone, name: b.customerName, email: b.email || '', sessions: 0, lastDate: b.date, dates: [] };
            }
            clientMap[b.phone].sessions++;
            clientMap[b.phone].dates.push(b.date);
            if (b.date > clientMap[b.phone].lastDate) { clientMap[b.phone].lastDate = b.date; clientMap[b.phone].name = b.customerName; }
          });
          const clientList = Object.values(clientMap).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
          const totalNotes = lessonNotes.filter(n => n.coachName === selectedRoleCoach).length;

          // If a client is selected, show their detail
          if (selectedClient) {
            const clientNotes = lessonNotes
              .filter(n => n.customerPhone === selectedClient.phone && n.coachName === selectedRoleCoach)
              .sort((a, b) => a.lessonNumber - b.lessonNumber);
            const clientBookings = myBookings.filter(b => b.phone === selectedClient.phone).sort((a, b) => b.date.localeCompare(a.date));

            return (
              <div className="space-y-5">
                {/* Back + Client Header */}
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setSelectedClient(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{selectedClient.name}</h2>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Phone size={11} /> {selectedClient.phone}</span>
                        {selectedClient.email && <span className="flex items-center gap-1"><Mail size={11} /> {selectedClient.email}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => openNewNoteForClient(selectedClient.phone, selectedClient.name, selectedRoleCoach)}
                      className="flex items-center gap-2 px-4 py-2 btn-primary text-sm"
                    >
                      <Plus size={16} /> {t('addNewNote')}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-semibold text-purple-700">{clientNotes.length}</div>
                      <div className="text-[11px] text-purple-500">{t('lessonNotes')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-semibold text-gray-700">{clientBookings.length}</div>
                      <div className="text-[11px] text-gray-500">{t('sessions')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-sm font-semibold text-gray-700">{clientBookings[0] ? new Date(clientBookings[0].date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' }) : '-'}</div>
                      <div className="text-[11px] text-gray-500">{t('lastLesson')}</div>
                    </div>
                  </div>
                </div>

                {/* Lesson Notes Log */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={15} className="text-purple-500" /> {t('clientLessonLog')}
                  </h3>
                  {clientNotes.length > 0 ? (
                    <div className="space-y-4">
                      {clientNotes.map(note => (
                        <div key={note.id} className="p-4 rounded-xl ring-1 ring-gray-200 bg-white hover:ring-purple-200 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-purple-100 text-purple-700 text-xs font-semibold w-8 h-8 rounded-lg flex items-center justify-center">
                                {note.lessonNumber}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{t('lessonNumber')} {note.lessonNumber}</div>
                                <div className="text-[11px] text-gray-400">
                                  {new Date(note.date).toLocaleDateString(currentLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => openLessonNoteModal({ id: note.bookingId, phone: note.customerPhone, customerName: note.customerName, coachName: note.coachName, date: note.date }, note)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                              title={t('editNotes')}
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                          {note.topic && (
                            <div className="mb-1.5 flex items-start gap-2">
                              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">{t('topicTaught')}</span>
                              <span className="text-sm text-gray-800 font-medium">{note.topic}</span>
                            </div>
                          )}
                          {note.homework && (
                            <div className="mb-1.5 flex items-start gap-2">
                              <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">{t('homeworkAssigned')}</span>
                              <span className="text-sm text-gray-600">{note.homework}</span>
                            </div>
                          )}
                          {note.notes && (
                            <div className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg p-2.5">{note.notes}</div>
                          )}
                          {note.attachments && note.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {note.attachments.map((att, i) => (
                                att.type.startsWith('image/') ? (
                                  <img key={i} src={att.dataUrl} alt={att.name} className="w-20 h-20 rounded-lg object-cover ring-1 ring-gray-200 cursor-pointer hover:ring-purple-300 transition-all" onClick={() => window.open(att.dataUrl)} />
                                ) : (
                                  <a key={i} href={att.dataUrl} download={att.name} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Paperclip size={12} /> {att.name}
                                  </a>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-300">
                      <FileText size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-3">{t('noNotesYet')}</p>
                      <button
                        onClick={() => openNewNoteForClient(selectedClient.phone, selectedClient.name, selectedRoleCoach)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                      >
                        <Plus size={14} /> {t('addNewNote')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Booking History for this client */}
                {clientBookings.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar size={15} className="text-gray-400" /> {t('teachingHistory')}
                      <span className="text-xs text-gray-400 font-normal ml-auto">{clientBookings.length} {t('sessions')}</span>
                    </h3>
                    <div className="space-y-1">
                      {clientBookings.slice(0, 20).map(b => {
                        const note = getLessonNotesForBooking(b.id);
                        return (
                          <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-xs text-gray-400 w-16 shrink-0">
                              {new Date(b.date).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' })}
                            </div>
                            <div className="text-xs text-gray-400 w-20 shrink-0">{b.time}</div>
                            <div className="flex-1 min-w-0 text-xs text-gray-500 truncate">{b.machine}</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.status === 'checked-in' ? 'bg-emerald-50 text-emerald-600' : b.status === 'no-show' ? 'bg-gray-100 text-gray-400' : 'bg-amber-50 text-amber-600'}`}>
                              {b.status === 'checked-in' ? t('statusCheckedIn') : b.status === 'no-show' ? t('statusNoShow') : t('statusBooked')}
                            </span>
                            {note && <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" title={t('lessonNotes')}></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Client list view
          return (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-purple-600">{clientList.length}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('totalClients')}</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">{totalNotes}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('totalLessons')}</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900">{myBookings.length}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t('sessions')}</div>
                </div>
              </div>

              {/* Client Cards */}
              {clientList.length > 0 ? (
                <div className="space-y-3">
                  {clientList.map(client => {
                    const clientNoteCount = lessonNotes.filter(n => n.customerPhone === client.phone && n.coachName === selectedRoleCoach).length;
                    const latestNote = lessonNotes
                      .filter(n => n.customerPhone === client.phone && n.coachName === selectedRoleCoach)
                      .sort((a, b) => b.lessonNumber - a.lessonNumber)[0];
                    return (
                      <div
                        key={client.phone}
                        className="card p-4 hover:ring-purple-200 cursor-pointer transition-all group"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg shrink-0 group-hover:bg-purple-200 transition-colors">
                            {(client.name || '?').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{client.name}</span>
                              {clientNoteCount > 0 && (
                                <span className="bg-purple-100 text-purple-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                  {clientNoteCount} {t('lessonNotes')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                              <span className="flex items-center gap-1"><Phone size={10} /> {client.phone}</span>
                              <span>{t('lessonsCount')} {client.sessions} {t('timesUnit')}</span>
                              <span>{t('lastLesson')} {new Date(client.lastDate).toLocaleDateString(currentLocale, { day: 'numeric', month: 'short' })}</span>
                            </div>
                            {latestNote && latestNote.topic && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                <span className="text-purple-500">{t('lessonNumber')}{latestNote.lessonNumber}:</span> {latestNote.topic}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); openNewNoteForClient(client.phone, client.name, selectedRoleCoach); }}
                              className="p-2 rounded-lg text-gray-300 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                              title={t('addNewNote')}
                            >
                              <Plus size={18} />
                            </button>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <Users size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400 text-sm font-medium">{t('noClients')}</p>
                  <p className="text-gray-300 text-xs mt-1">{t('noClientsDesc')}</p>
                </div>
              )}
            </div>
          );
        })()}

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
                <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium bg-white">{t('date')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('bookingCount')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('memberCol')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('walkInCol')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('checkinCount')}</th>
                        <th className="px-4 py-3 font-medium text-center bg-white">{t('noShowCol')}</th>
                        <th className="px-4 py-3 font-medium text-right bg-white">{t('revenue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyBreakdown.map(day => (
                        <tr key={day.date} className="border-b border-gray-50 table-row-hover">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {new Date(day.date).toLocaleDateString(currentLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">{day.total}</td>
                          <td className="px-4 py-3 text-sm text-center text-blue-600 font-medium">{day.member}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-500">{day.walkIn}</td>
                          <td className="px-4 py-3 text-sm text-center text-emerald-600 font-medium">{day.checkedIn}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-400">{day.noShow}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-[#FF7A05]">฿{day.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t('grandTotal')}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{reportData.totalBookings}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">{reportData.memberQuotaUsed}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-500">{reportData.totalBookings - reportData.memberQuotaUsed}</td>
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
            {reportData.filtered.length > 0 && (() => {
              const filteredBookings = bookingSearch.trim()
                ? reportData.filtered.filter(b => {
                    const q = bookingSearch.toLowerCase();
                    return b.customerName.toLowerCase().includes(q) || b.phone.toLowerCase().includes(q);
                  })
                : reportData.filtered;
              return (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" /> {t('allBookings')} ({filteredBookings.length} {t('items')})
                  </h3>
                  <div className="relative">
                    <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" className="input-field pl-8 py-1.5 text-xs w-48" placeholder={t('searchBookingPlaceholder') || 'ค้นหาชื่อ / เบอร์โทร...'} value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="px-3 py-3 font-medium bg-white">{t('date')}</th>
                        <th className="px-3 py-3 font-medium bg-white">{t('timeCol')}</th>
                        <th className="px-3 py-3 font-medium bg-white">{t('machine')}</th>
                        <th className="px-3 py-3 font-medium bg-white">{t('customerCol')}</th>
                        <th className="px-3 py-3 font-medium bg-white">{t('phone')}</th>
                        <th className="px-3 py-3 font-medium text-center bg-white">{t('coachLabel') || 'โค้ช'}</th>
                        <th className="px-3 py-3 font-medium text-center bg-white">{t('statusCol')}</th>
                        <th className="px-3 py-3 font-medium text-right bg-white">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="border-b border-gray-50 table-row-hover">
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.date}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.time}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">{b.machine}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{b.customerName}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-500">{b.phone}</td>
                          <td className="px-3 py-2.5 text-sm text-center text-purple-600">{b.withCoach ? b.coachName : '-'}</td>
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
                  {filteredBookings.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noDataForRange') || 'ไม่พบข้อมูล'}</div>}
                </div>
              </div>
              );
            })()}
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

              {/* Company Logo */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl ring-1 ring-gray-100">
                <div className="w-14 h-14 rounded-xl bg-white ring-1 ring-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Monitor size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{t('companyLogo') || 'โลโก้บริษัท'}</p>
                  <p className="text-xs text-gray-400">{t('logoHint') || 'อัปโหลดโลโก้ (สูงสุด 500KB)'}</p>
                </div>
                <label className="btn-ghost px-3 py-2 text-sm cursor-pointer flex items-center gap-1.5">
                  <Upload size={14} /> {t('upload') || 'อัปโหลด'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {companyLogo && (
                  <button onClick={() => { setCompanyLogo(''); localStorage.removeItem('golf_company_logo'); showToast('ลบโลโก้แล้ว', 'success'); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Settings Tabs */}
              <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl mb-6 overflow-x-auto custom-scrollbar">
                {[
                  { key: 'bays', label: t('baysTab'), icon: <Monitor size={15} /> },
                  { key: 'coaches', label: t('coachesTab'), icon: <GraduationCap size={15} /> },
                  { key: 'packages', label: t('packagesTab'), icon: <ShoppingCart size={15} /> },
                  { key: 'promos', label: t('promosTab'), icon: <Percent size={15} /> },
                  { key: 'users', label: t('usersTab'), icon: <Users size={15} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAdminTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-fit ${
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Monitor size={15} className="text-blue-500" /> {t('baysTab')} <span className="text-xs font-normal text-gray-400">({bays.length})</span></h4>
                    <button onClick={() => { setEditingBayId(null); setBayForm({ name: '', type: 'foresight', price: 1000 }); setShowBayFormModal(true); }} className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-sm"><Plus size={14} /> {t('addBay')}</button>
                  </div>
                  <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="px-3 py-2.5 font-medium bg-white">{t('bayNamePlaceholder') || 'ชื่อเบย์'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('machineType') || 'ประเภท'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-right">{t('pricePerHour') || 'ราคา'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('statusCol') || 'สถานะ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('actions') || 'จัดการ'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bays.map(bay => (
                          <tr key={bay.id} className={`border-b border-gray-50 table-row-hover ${!bay.active ? 'opacity-50' : ''}`}>
                            <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{bay.name}</td>
                            <td className="px-3 py-2.5">{bay.type ? <span className={`badge text-[10px] ${bay.type === 'trackman' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'}`}>{bay.type === 'trackman' ? 'Trackman' : 'Foresight'}</span> : <span className="text-xs text-gray-300">—</span>}</td>
                            <td className="px-3 py-2.5 text-sm text-right text-gray-700">฿{bay.price.toLocaleString()}/ชม.</td>
                            <td className="px-3 py-2.5 text-center"><button onClick={() => handleToggleBay(bay.id)} className={`transition-colors ${bay.active ? 'text-emerald-500' : 'text-gray-300'}`}>{bay.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></td>
                            <td className="px-3 py-2.5 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { handleEditBay(bay); setShowBayFormModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button><button onClick={() => handleDeleteBay(bay.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bays.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noBays')}</div>}
                  </div>
                </div>
              )}

              {/* ========== COACHES TAB ========== */}
              {adminTab === 'coaches' && (() => {
                const filteredCoaches = coaches.filter(c => { if (!coachSearch.trim()) return true; const q = coachSearch.toLowerCase(); return c.name.toLowerCase().includes(q) || (c.expertise||'').toLowerCase().includes(q); });
                return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><GraduationCap size={15} className="text-purple-500" /> {t('coachesTab')} <span className="text-xs font-normal text-gray-400">({filteredCoaches.length})</span></h4>
                    <div className="flex items-center gap-2">
                      <div className="relative"><Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" className="input-field pl-8 py-1.5 text-xs w-40" placeholder={t('searchCoachPlaceholder') || 'ค้นหา...'} value={coachSearch} onChange={(e) => setCoachSearch(e.target.value)} /></div>
                      <button onClick={() => { setEditingCoachId(null); setCoachForm({ name: '', price: 1500, education: '', expertise: '', bio: '', phone: '', password: '1234' }); setShowCoachFormModal(true); }} className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-sm shrink-0"><Plus size={14} /> {t('addCoach')}</button>
                    </div>
                  </div>
                  <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="px-3 py-2.5 font-medium bg-white">{t('coachNamePH') || 'ชื่อโค้ช'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-right">{t('pricePerHourBaht') || 'ราคา/ชม.'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('expertisePH') || 'ความเชี่ยวชาญ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('statusCol') || 'สถานะ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('actions') || 'จัดการ'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCoaches.map(coach => (
                          <tr key={coach.id} className={`border-b border-gray-50 table-row-hover ${!coach.active ? 'opacity-50' : ''}`}>
                            <td className="px-3 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={coach.avatar} name={coach.name} size={30} /><div><div className="text-sm font-medium text-gray-900">{coach.name}</div>{coach.education && <div className="text-[11px] text-gray-400">{coach.education}</div>}</div></div></td>
                            <td className="px-3 py-2.5 text-sm text-right text-gray-700">฿{coach.price.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-xs text-gray-500">{coach.expertise || <span className="text-gray-300">—</span>}</td>
                            <td className="px-3 py-2.5 text-center"><button onClick={() => handleToggleCoach(coach.id)} className={`transition-colors ${coach.active ? 'text-emerald-500' : 'text-gray-300'}`}>{coach.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></td>
                            <td className="px-3 py-2.5 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { handleEditCoach(coach); setShowCoachFormModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button><button onClick={() => handleDeleteCoach(coach.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredCoaches.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noCoaches')}</div>}
                  </div>
                </div>
                );
              })()}

              {/* ========== PACKAGES TAB ========== */}
              {adminTab === 'packages' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><ShoppingCart size={15} className="text-orange-500" /> {t('packagesTab')} <span className="text-xs font-normal text-gray-400">({packages.length})</span></h4>
                    <button onClick={() => { setEditingPkgId(null); setPkgForm({ name: '', hours: 1, price: 0, machineType: 'trackman', highlight: false, save: '', desc: '' }); setShowPkgFormModal(true); }} className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-sm"><Plus size={14} /> {t('addPkg')}</button>
                  </div>
                  <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="px-3 py-2.5 font-medium bg-white">{t('pkgNamePH') || 'ชื่อแพ็กเกจ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('machineType') || 'ประเภท'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('numHours') || 'ชั่วโมง'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-right">{t('priceBaht') || 'ราคา'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('statusCol') || 'สถานะ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('actions') || 'จัดการ'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map(pkg => (
                          <tr key={pkg.id} className={`border-b border-gray-50 table-row-hover ${pkg.active === false ? 'opacity-50' : ''}`}>
                            <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{pkg.name} {pkg.highlight && <span className="badge text-[10px] bg-orange-50 text-orange-600 ring-1 ring-orange-200 ml-1">{t('popular')}</span>}</td>
                            <td className="px-3 py-2.5"><span className={`badge text-[10px] ${pkg.machineType === 'trackman' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'}`}>{pkg.machineType === 'trackman' ? 'Trackman' : 'Foresight'}</span></td>
                            <td className="px-3 py-2.5 text-sm text-center text-gray-700">{pkg.hours}</td>
                            <td className="px-3 py-2.5 text-sm text-right font-medium text-gray-800">฿{pkg.price.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-center"><button onClick={() => handleTogglePackage(pkg.id)} className={`transition-colors ${pkg.active !== false ? 'text-emerald-500' : 'text-gray-300'}`}>{pkg.active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></td>
                            <td className="px-3 py-2.5 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { handleEditPackage(pkg); setShowPkgFormModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button><button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {packages.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noPackages')}</div>}
                  </div>
                </div>
              )}

              {/* ========== PROMOS TAB ========== */}
              {adminTab === 'promos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Tag size={15} className="text-amber-500" /> {t('promosTab')} <span className="text-xs font-normal text-gray-400">({promoCodes.length})</span></h4>
                    <button onClick={() => { setEditingPromoId(null); setPromoForm({ code: '', type: 'percent', value: 0, expiryDate: '' }); setShowPromoFormModal(true); }} className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-sm"><Plus size={14} /> {t('addPromo')}</button>
                  </div>
                  <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="px-3 py-2.5 font-medium bg-white">{t('promoCodePH') || 'โค้ด'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('discountType') || 'ส่วนลด'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('expiryDate') || 'วันหมดอายุ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('statusCol') || 'สถานะ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('actions') || 'จัดการ'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promoCodes.map(promo => (
                          <tr key={promo.id} className={`border-b border-gray-50 table-row-hover ${!promo.active ? 'opacity-50' : ''}`}>
                            <td className="px-3 py-2.5 text-sm font-mono font-semibold text-gray-900">{promo.code}</td>
                            <td className="px-3 py-2.5 text-sm font-medium text-[#FF7A05]">{promo.type === 'percent' ? `${promo.value}%` : `฿${promo.value.toLocaleString()}`}</td>
                            <td className="px-3 py-2.5 text-sm">{promo.expiryDate ? <span className={new Date(promo.expiryDate) < new Date() ? 'text-red-500' : 'text-gray-500'}>{new Date(promo.expiryDate).toLocaleDateString(currentLocale)}{new Date(promo.expiryDate) < new Date() && ` (${t('alreadyExpired')})`}</span> : <span className="text-gray-300">{t('noExpiry')}</span>}</td>
                            <td className="px-3 py-2.5 text-center"><button onClick={() => handleTogglePromo(promo.id)} className={`transition-colors ${promo.active ? 'text-emerald-500' : 'text-gray-300'}`}>{promo.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></td>
                            <td className="px-3 py-2.5 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { handleEditPromo(promo); setShowPromoFormModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button><button onClick={() => handleDeletePromo(promo.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {promoCodes.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noPromos')}</div>}
                  </div>
                </div>
              )}

              {/* ========== USERS TAB ========== */}
              {adminTab === 'users' && (() => {
                const filteredUsers = appUsers.filter(u => u.id !== currentUser?.id).filter(u => { if (!userSearch.trim()) return true; const q = userSearch.toLowerCase(); return u.name.toLowerCase().includes(q) || u.phone.toLowerCase().includes(q); });
                return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Users size={15} className="text-sky-500" /> {t('usersTab')} <span className="text-xs font-normal text-gray-400">({filteredUsers.length})</span></h4>
                    <div className="relative"><Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" className="input-field pl-8 py-1.5 text-xs w-44" placeholder={t('searchUserPlaceholder') || 'ค้นหา...'} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} /></div>
                  </div>
                  <div className="overflow-auto custom-scrollbar max-h-[50vh]">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-xs text-gray-500">
                          <th className="px-3 py-2.5 font-medium bg-white">{t('fullName') || 'ชื่อ'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white">{t('phone') || 'เบอร์โทร'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('accountType') || 'ประเภท'}</th>
                          <th className="px-3 py-2.5 font-medium bg-white text-center">{t('actions') || 'จัดการ'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="border-b border-gray-50 table-row-hover">
                            <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-3 py-2.5 text-sm text-gray-500">{user.phone}</td>
                            <td className="px-3 py-2.5 text-center"><span className={`badge text-[10px] ${user.role === 'admin' ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : user.role === 'coach' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'}`}>{user.role}</span></td>
                            <td className="px-3 py-2.5 text-center"><button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">{t('noUsers')}</div>}
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Modal จัดการการจอง (แอดมิน) */}
      {isManageModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setIsManageModalOpen(false)}>
          <div className="modal-panel p-6 max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar animate-in" onClick={(e) => e.stopPropagation()}>
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
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
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
          <div className="modal-panel p-6 max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
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
                <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
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
          <div className="modal-panel p-6 max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar text-center" onClick={(e) => e.stopPropagation()}>
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
      {/* Lesson Note Modal */}
      {isLessonNoteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLessonNoteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-purple-500" />
                  {editingLessonNote ? t('editNotes') : t('addNotes')}
                </h3>
                <button onClick={() => setIsLessonNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Customer info header */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                <div className="font-medium text-gray-900">{lessonNoteForm.customerName}</div>
                <div className="text-xs text-gray-400">{lessonNoteForm.date} &middot; {t('lessonNumber')} {lessonNoteForm.lessonNumber}</div>
              </div>

              {/* Lesson Number */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('lessonNumber')}</label>
                <input type="number" min="1" className="input-field" value={lessonNoteForm.lessonNumber}
                  onChange={e => setLessonNoteForm({...lessonNoteForm, lessonNumber: parseInt(e.target.value) || 1})} />
              </div>

              {/* Topic */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('topicTaught')}</label>
                <input type="text" className="input-field" placeholder={t('topicPlaceholder')} value={lessonNoteForm.topic}
                  onChange={e => setLessonNoteForm({...lessonNoteForm, topic: e.target.value})} />
              </div>

              {/* Homework */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('homeworkAssigned')}</label>
                <input type="text" className="input-field" placeholder={t('homeworkPlaceholder')} value={lessonNoteForm.homework}
                  onChange={e => setLessonNoteForm({...lessonNoteForm, homework: e.target.value})} />
              </div>

              {/* General Notes */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('generalNotes')}</label>
                <textarea className="input-field min-h-[80px]" placeholder={t('notesPlaceholder')} value={lessonNoteForm.notes}
                  onChange={e => setLessonNoteForm({...lessonNoteForm, notes: e.target.value})} />
              </div>

              {/* Attachments */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">{t('attachments')}</label>
                {lessonNoteForm.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {lessonNoteForm.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 ring-1 ring-gray-200">
                        {att.type.startsWith('image/') ? (
                          <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <Paperclip size={14} className="text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600 max-w-[100px] truncate">{att.name}</span>
                        <button onClick={() => removeLessonNoteAttachment(i)} className="text-gray-400 hover:text-red-500 p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 text-sm text-purple-600 cursor-pointer hover:text-purple-700 transition-colors">
                  <Paperclip size={14} /> {t('addAttachment')}
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.mp4,.mov" className="hidden" onChange={e => { handleLessonNoteAttachment(e.target.files[0]); e.target.value = ''; }} />
                </label>
              </div>

              {/* Save Button */}
              <button onClick={handleSaveLessonNote} className="w-full py-3 btn-primary flex items-center justify-center gap-2">
                {t('saveNotes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingCoach && (
        <div className="modal-overlay" onClick={() => setViewingCoach(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
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

      {/* ========== Bay Form Modal ========== */}
      {showBayFormModal && (
        <div className="modal-overlay" onClick={() => setShowBayFormModal(false)}>
          <div className="modal-panel max-w-md p-6 modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingBayId ? t('editBay') : t('addBay')}</h3>
              <button onClick={() => setShowBayFormModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('bayNamePlaceholder')}</label><input type="text" className="input-field" value={bayForm.name} onChange={(e) => setBayForm({ ...bayForm, name: e.target.value })} autoFocus /></div>
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('machineType') || 'ประเภทเครื่อง'}</label><select className="input-field" value={bayForm.type || ''} onChange={(e) => setBayForm({ ...bayForm, type: e.target.value || null })}><option value="">{t('noType')}</option><option value="trackman">Trackman</option><option value="foresight">Foresight</option></select></div>
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('pricePerHour')}</label><input type="number" className="input-field" value={bayForm.price} onChange={(e) => setBayForm({ ...bayForm, price: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBayFormModal(false)} className="flex-1 py-3 btn-secondary">{t('cancel')}</button>
              <button onClick={() => { handleSaveBay(); setShowBayFormModal(false); }} className="flex-1 py-3 btn-primary">{editingBayId ? t('save') : t('add')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Coach Form Modal ========== */}
      {showCoachFormModal && (
        <div className="modal-overlay" onClick={() => setShowCoachFormModal(false)}>
          <div className="modal-panel max-w-md p-6 modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingCoachId ? t('editCoach') : t('addCoach')}</h3>
              <button onClick={() => setShowCoachFormModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('coachNamePH')}</label><input type="text" className="input-field" value={coachForm.name} onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })} autoFocus /></div>
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('pricePerHourBaht')}</label><input type="number" className="input-field" value={coachForm.price} onChange={(e) => setCoachForm({ ...coachForm, price: e.target.value })} /></div>
              </div>
              {!editingCoachId && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('coachPhone')}</label><input type="tel" className="input-field" value={coachForm.phone} onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('coachPassword')}</label><input type="text" className="input-field" value={coachForm.password} onChange={(e) => setCoachForm({ ...coachForm, password: e.target.value })} /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('educationPH')}</label><input type="text" className="input-field" value={coachForm.education} onChange={(e) => setCoachForm({ ...coachForm, education: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('expertisePH')}</label><input type="text" className="input-field" value={coachForm.expertise} onChange={(e) => setCoachForm({ ...coachForm, expertise: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('bioPH')}</label><input type="text" className="input-field" value={coachForm.bio} onChange={(e) => setCoachForm({ ...coachForm, bio: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCoachFormModal(false)} className="flex-1 py-3 btn-secondary">{t('cancel')}</button>
              <button onClick={() => { handleSaveCoach(); setShowCoachFormModal(false); }} className="flex-1 py-3 btn-primary">{editingCoachId ? t('save') : t('addCoachBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Package Form Modal ========== */}
      {showPkgFormModal && (
        <div className="modal-overlay" onClick={() => setShowPkgFormModal(false)}>
          <div className="modal-panel max-w-md p-6 modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingPkgId ? t('editPkg') : t('addPkg')}</h3>
              <button onClick={() => setShowPkgFormModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('pkgNamePH')}</label><input type="text" className="input-field" value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} autoFocus /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('machineType') || 'ประเภท'}</label><select className="input-field" value={pkgForm.machineType} onChange={(e) => setPkgForm({ ...pkgForm, machineType: e.target.value })}><option value="trackman">Trackman</option><option value="foresight">Foresight</option></select></div>
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('numHours')}</label><input type="number" className="input-field" value={pkgForm.hours} onChange={(e) => setPkgForm({ ...pkgForm, hours: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('priceBaht')}</label><input type="number" className="input-field" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('savingText')}</label><input type="text" className="input-field" value={pkgForm.save} onChange={(e) => setPkgForm({ ...pkgForm, save: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('descText')}</label><input type="text" className="input-field" value={pkgForm.desc} onChange={(e) => setPkgForm({ ...pkgForm, desc: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={pkgForm.highlight} onChange={(e) => setPkgForm({ ...pkgForm, highlight: e.target.checked })} className="rounded accent-[#FF7A05]" /> {t('showAsPopular')}</label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPkgFormModal(false)} className="flex-1 py-3 btn-secondary">{t('cancel')}</button>
              <button onClick={() => { handleSavePackage(); setShowPkgFormModal(false); }} className="flex-1 py-3 btn-primary">{editingPkgId ? t('save') : t('addPkgBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Promo Form Modal ========== */}
      {showPromoFormModal && (
        <div className="modal-overlay" onClick={() => setShowPromoFormModal(false)}>
          <div className="modal-panel max-w-md p-6 modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingPromoId ? t('editPromo') : t('addPromo')}</h3>
              <button onClick={() => setShowPromoFormModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('promoCodePH')}</label><input type="text" className="input-field uppercase" value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} autoFocus /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('discountType') || 'ประเภทส่วนลด'}</label><select className="input-field" value={promoForm.type} onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}><option value="percent">{t('discountPercent')}</option><option value="fixed">{t('discountFixed')}</option></select></div>
                <div><label className="text-sm font-medium text-gray-600 mb-1 block">{promoForm.type === 'percent' ? t('discountPercentPH') : t('discountFixedPH')}</label><input type="number" className="input-field" value={promoForm.value} onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })} /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-600 mb-1 block">{t('expiryDate')}</label><input type="date" className="input-field" value={promoForm.expiryDate} onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPromoFormModal(false)} className="flex-1 py-3 btn-secondary">{t('cancel')}</button>
              <button onClick={() => { handleSavePromo(); setShowPromoFormModal(false); }} className="flex-1 py-3 btn-primary">{editingPromoId ? t('save') : t('addPromoBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={confirmState.onConfirm}
        onCancel={cancelConfirm}
      />
    </div>
  );
}
