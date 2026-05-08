import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

const sampleProducts = [
  {
    name: 'تيشرت كلاسيك أبيض',
    description: 'تيشرت قطن 100% عالي الجودة، مثالي للطباعة بجميع التقنيات. قماش ناعم ومريح.',
    category: 'تيشرت رجالي',
    basePrice: 2500,
    tshirtCost: 800,
    printingCost: 400,
    packagingCost: 100,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['أبيض', 'أسود', 'رمادي'],
    isActive: true,
    imageUrl: '',
    stock: {
      S: { 'أبيض': 15, 'أسود': 12, 'رمادي': 8 },
      M: { 'أبيض': 20, 'أسود': 18, 'رمادي': 10 },
      L: { 'أبيض': 25, 'أسود': 20, 'رمادي': 12 },
      XL: { 'أبيض': 15, 'أسود': 10, 'رمادي': 5 },
      XXL: { 'أبيض': 8, 'أسود': 6, 'رمادي': 3 },
    },
  },
  {
    name: 'تيشرت بريميوم أسود',
    description: 'تيشرت بريميوم من القطن المصري، نعومة استثنائية وثبات لون ممتاز بعد الغسيل.',
    category: 'تيشرت رجالي',
    basePrice: 3200,
    tshirtCost: 1200,
    printingCost: 500,
    packagingCost: 150,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['أسود', 'أبيض', 'أزرق داكن'],
    isActive: true,
    imageUrl: '',
    stock: {
      S: { 'أسود': 10, 'أبيض': 8, 'أزرق داكن': 5 },
      M: { 'أسود': 15, 'أبيض': 12, 'أزرق داكن': 8 },
      L: { 'أسود': 18, 'أبيض': 15, 'أزرق داكن': 10 },
      XL: { 'أسود': 10, 'أبيض': 8, 'أزرق داكن': 4 },
    },
  },
  {
    name: 'تيشرت نسائي فت',
    description: 'تيشرت نسائي بقصة أنيقة ومريحة، مثالي للتصاميم العصرية.',
    category: 'تيشرت نسائي',
    basePrice: 2800,
    tshirtCost: 900,
    printingCost: 450,
    packagingCost: 120,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['أبيض', 'أسود', 'وردي', 'أحمر'],
    isActive: true,
    imageUrl: '',
    stock: {
      XS: { 'أبيض': 6, 'أسود': 5, 'وردي': 8, 'أحمر': 4 },
      S: { 'أبيض': 10, 'أسود': 8, 'وردي': 12, 'أحمر': 6 },
      M: { 'أبيض': 15, 'أسود': 12, 'وردي': 15, 'أحمر': 8 },
      L: { 'أبيض': 12, 'أسود': 10, 'وردي': 10, 'أحمر': 5 },
      XL: { 'أبيض': 5, 'أسود': 4, 'وردي': 3, 'أحمر': 2 },
    },
  },
  {
    name: 'تيشرت أطفال ملون',
    description: 'تيشرت أطفال من القطن الطبيعي، آمن على البشرة وألوان زاهية.',
    category: 'تيشرت أطفال',
    basePrice: 1800,
    tshirtCost: 500,
    printingCost: 300,
    packagingCost: 80,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['أبيض', 'أزرق', 'أصفر', 'أخضر'],
    isActive: true,
    imageUrl: '',
    stock: {
      XS: { 'أبيض': 8, 'أزرق': 6, 'أصفر': 5, 'أخضر': 4 },
      S: { 'أبيض': 12, 'أزرق': 10, 'أصفر': 8, 'أخضر': 6 },
      M: { 'أبيض': 15, 'أزرق': 12, 'أصفر': 10, 'أخضر': 8 },
      L: { 'أبيض': 10, 'أزرق': 8, 'أصفر': 6, 'أخضر': 4 },
    },
  },
  {
    name: 'هودي شتوي',
    description: 'هودي سميك ودافئ مع كابوش وجيب أمامي، مثالي للطباعة الكبيرة.',
    category: 'هودي',
    basePrice: 5500,
    tshirtCost: 2500,
    printingCost: 700,
    packagingCost: 200,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['أسود', 'رمادي', 'أزرق داكن'],
    isActive: true,
    imageUrl: '',
    stock: {
      M: { 'أسود': 8, 'رمادي': 6, 'أزرق داكن': 4 },
      L: { 'أسود': 10, 'رمادي': 8, 'أزرق داكن': 5 },
      XL: { 'أسود': 6, 'رمادي': 4, 'أزرق داكن': 3 },
      XXL: { 'أسود': 3, 'رمادي': 2, 'أزرق داكن': 1 },
    },
  },
  {
    name: 'بولو رجالي أنيق',
    description: 'بولو رجالي بياقة كلاسيكية وخامة ممتازة، يجمع بين الأناقة والراحة.',
    category: 'بولو',
    basePrice: 3500,
    tshirtCost: 1500,
    printingCost: 500,
    packagingCost: 150,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['أبيض', 'أسود', 'أزرق'],
    isActive: true,
    imageUrl: '',
    stock: {
      M: { 'أبيض': 10, 'أسود': 8, 'أزرق': 6 },
      L: { 'أبيض': 12, 'أسود': 10, 'أزرق': 8 },
      XL: { 'أبيض': 8, 'أسود': 6, 'أزرق': 4 },
      XXL: { 'أبيض': 4, 'أسود': 3, 'أزرق': 2 },
    },
  },
];

export async function seedProducts() {
  try {
    // Check if products already exist
    const existing = await getDocs(collection(db, 'products'));
    if (!existing.empty) {
      console.log('Products already exist, skipping seed');
      return false;
    }

    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log('✅ Sample products seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding products:', error);
    return false;
  }
}
