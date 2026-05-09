// Algerian Wilayas
export const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة",
  "بشار", "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت",
  "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية",
  "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف",
  "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس", "تيبازة",
  "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية",
  "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال",
  "بني عباس", "إن صالح", "إن قزام", "توقرت", "جانت",
  "المغير", "المنيعة"
];

export const orderStatuses = [
  { value: 'new', label: 'طلب جديد', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'تم التأكيد', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'printing', label: 'قيد الطباعة', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ready', label: 'جاهز', color: 'bg-green-100 text-green-800' },
  { value: 'shipped', label: 'تم الشحن', color: 'bg-sky-100 text-sky-800' },
  { value: 'delivered', label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-800' },
];

export const printTypes = [
  'طباعة DTF',
  'طباعة حرارية',
  'طباعة سيريغرافيا',
  'طباعة سبليميشن',
  'تطريز',
];

export const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const tshirtColors = [
  { name: 'أبيض', hex: '#FFFFFF' },
  { name: 'أسود', hex: '#1a1a1a' },
  { name: 'رمادي', hex: '#6B7280' },
  { name: 'أحمر', hex: '#EF4444' },
  { name: 'أزرق', hex: '#3B82F6' },
  { name: 'أزرق داكن', hex: '#1E3A5F' },
  { name: 'أخضر', hex: '#22C55E' },
  { name: 'أصفر', hex: '#EAB308' },
  { name: 'برتقالي', hex: '#F97316' },
  { name: 'وردي', hex: '#EC4899' },
  { name: 'بنفسجي', hex: '#8B5CF6' },
  { name: 'بني', hex: '#92400E' },
];

export const categories = [
  'تيشرت رجالي',
  'تيشرت نسائي',
  'تيشرت أطفال',
  'بولو',
  'هودي',
  'سويتشيرت',
];

export function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `NT-${y}${m}${d}-${rand}`;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' د.ج';
}

export function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusInfo(status) {
  return orderStatuses.find(s => s.value === status) || orderStatuses[0];
}
