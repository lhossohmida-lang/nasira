import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiMove, FiRotateCw, FiMaximize2, FiShoppingBag, FiRefreshCw, FiImage, FiZoomIn, FiScissors, FiLayers, FiPhone, FiSend, FiRepeat } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { removeBackground } from '@imgly/background-removal';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { wilayas, generateOrderNumber, tshirtSizes } from '../utils/constants';

const CANVAS_W = 600;
const CANVAS_H = 600;
const TSHIRT_TEMPLATE_FRONT_SRC = '/tshirt-front.jpg';
const TSHIRT_TEMPLATE_BACK_SRC = '/tshirt-back.jpg';
const SINGLE_SIDE_PRICE = 3500;
const DOUBLE_SIDE_PRICE = 4500;

// Print zone relative to canvas (where the design can be placed on the tshirt)
const PRINT_ZONE = { x: 0.32, y: 0.25, w: 0.36, h: 0.34 };

const createEmptySideDesign = () => ({
  img: null,
  dataUrl: null,
  originalDataUrl: null,
  bgRemoved: true,
  pos: { x: CANVAS_W * PRINT_ZONE.x, y: CANVAS_H * PRINT_ZONE.y },
  scale: 0.5,
  rotation: 0,
});

const TSHIRT_COLORS = [
  { name: 'أبيض', value: '#FFFFFF', dark: false },
  { name: 'أسود', value: '#1a1a1a', dark: true },
  { name: 'رمادي', value: '#6b7280', dark: true },
  { name: 'أزرق بحري', value: '#1e3a5f', dark: true },
  { name: 'أحمر', value: '#dc2626', dark: true },
  { name: 'أخضر', value: '#16a34a', dark: true },
  { name: 'بنفسجي', value: '#7c3aed', dark: true },
  { name: 'وردي', value: '#ec4899', dark: true },
];

export default function DesignPage() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [sideDesigns, setSideDesigns] = useState({
    front: createEmptySideDesign(),
    back: createEmptySideDesign(),
  });
  const [removingBg, setRemovingBg] = useState(false);
  const [removingProgress, setRemovingProgress] = useState(0);
  const [tshirtColor] = useState(TSHIRT_COLORS[0]);
  const [tshirtTemplates, setTshirtTemplates] = useState({ front: null, back: null });
  const [side, setSide] = useState('front');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState('L');
  const [orderStep, setOrderStep] = useState(1);
  const [deliveryPrices, setDeliveryPrices] = useState({});
  const [defaultDeliveryPrice, setDefaultDeliveryPrice] = useState(0);
  const [form, setForm] = useState({ customerName: '', phone: '', wilaya: '', commune: '', address: '', note: '' });

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const currentDesign = sideDesigns[side];
  const designImg = currentDesign.img;
  const designDataUrl = currentDesign.dataUrl;
  const originalDataUrl = currentDesign.originalDataUrl;
  const bgRemoved = currentDesign.bgRemoved;
  const pos = currentDesign.pos;
  const scale = currentDesign.scale;
  const rotation = currentDesign.rotation;
  const hasAnyDesign = Object.values(sideDesigns).some((design) => design.dataUrl);
  const designedSideLabels = Object.entries(sideDesigns)
    .filter(([, design]) => design.dataUrl)
    .map(([sideKey]) => sideKey === 'front' ? 'أمام' : 'خلف')
    .join(' + ');
  const getSideLabel = (sideKey) => sideKey === 'front' ? 'أمام' : 'خلف';
  const printedSidesCount = Object.values(sideDesigns).filter((design) => design.dataUrl).length;
  const productPrice = printedSidesCount > 1 ? DOUBLE_SIDE_PRICE : SINGLE_SIDE_PRICE;
  const selectedDeliveryPrice = deliveryPrices?.[form.wilaya];
  const deliveryCost = Number(
    selectedDeliveryPrice === '' || selectedDeliveryPrice === null || selectedDeliveryPrice === undefined
      ? defaultDeliveryPrice
      : selectedDeliveryPrice
  );
  const orderTotal = productPrice + deliveryCost;

  useEffect(() => {
    const frontImg = new Image();
    frontImg.onload = () => setTshirtTemplates(prev => ({ ...prev, front: frontImg }));
    frontImg.src = TSHIRT_TEMPLATE_FRONT_SRC;

    const backImg = new Image();
    backImg.onload = () => setTshirtTemplates(prev => ({ ...prev, back: backImg }));
    backImg.src = TSHIRT_TEMPLATE_BACK_SRC;
  }, []);

  useEffect(() => {
    async function fetchDeliverySettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (!snap.exists()) return;
        const data = snap.data();
        setDeliveryPrices(data.deliveryPrices || {});
        setDefaultDeliveryPrice(Number(data.deliveryPrice || 0));
      } catch (err) {
        console.error('Delivery settings fetch failed:', err);
      }
    }

    fetchDeliverySettings();
  }, []);

  const updateSideDesign = useCallback((updates, targetSide = side) => {
    setSideDesigns((prev) => ({
      ...prev,
      [targetSide]: {
        ...prev[targetSide],
        ...(typeof updates === 'function' ? updates(prev[targetSide]) : updates),
      },
    }));
  }, [side]);

  const setDesignImg = (img) => updateSideDesign({ img });
  const setDesignDataUrl = (dataUrl) => updateSideDesign({ dataUrl });
  const setOriginalDataUrl = (originalDataUrl) => updateSideDesign({ originalDataUrl });
  const setBgRemoved = (value) => updateSideDesign({ bgRemoved: value });
  const setPos = (value) => updateSideDesign({ pos: value });
  const setScale = (value) => updateSideDesign({ scale: value });
  const setRotation = (value) => updateSideDesign({ rotation: value });

  // Draw the T-shirt shape using paths
  const drawTshirt = useCallback((ctx, tshirtSide = side) => {
    const w = CANVAS_W;
    const h = CANVAS_H;
    const template = tshirtTemplates[tshirtSide];

    if (template) {
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      const scale = Math.min((w * 0.94) / template.naturalWidth, (h * 0.94) / template.naturalHeight);
      const dw = template.naturalWidth * scale;
      const dh = template.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(template, dx, dy, dw, dh);
      ctx.shadowColor = 'transparent';

      ctx.restore();
      return;
    }

    ctx.save();

    // T-shirt body shape
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.08);
    ctx.lineTo(w * 0.02, h * 0.22);
    ctx.lineTo(w * 0.12, h * 0.35);
    ctx.lineTo(w * 0.22, h * 0.25);
    ctx.lineTo(w * 0.22, h * 0.88);
    ctx.lineTo(w * 0.78, h * 0.88);
    ctx.lineTo(w * 0.78, h * 0.25);
    ctx.lineTo(w * 0.88, h * 0.35);
    ctx.lineTo(w * 0.98, h * 0.22);
    ctx.lineTo(w * 0.85, h * 0.08);
    if (tshirtSide === 'front') {
      ctx.quadraticCurveTo(w * 0.7, h * 0.02, w * 0.5, h * 0.06);
      ctx.quadraticCurveTo(w * 0.3, h * 0.02, w * 0.15, h * 0.08);
    } else {
      ctx.quadraticCurveTo(w * 0.7, h * 0.04, w * 0.5, h * 0.045);
      ctx.quadraticCurveTo(w * 0.3, h * 0.04, w * 0.15, h * 0.08);
    }
    ctx.closePath();

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = tshirtColor.value;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Outline
    ctx.strokeStyle = tshirtColor.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fabric texture
    ctx.strokeStyle = tshirtColor.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < h; i += 4) {
      ctx.beginPath();
      ctx.moveTo(w * 0.22, i);
      ctx.lineTo(w * 0.78, i);
      ctx.stroke();
    }

    // Seam lines
    const seamColor = tshirtColor.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    ctx.strokeStyle = seamColor; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    // Side seams
    ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.25); ctx.lineTo(w * 0.22, h * 0.88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.25); ctx.lineTo(w * 0.78, h * 0.88); ctx.stroke();
    // Bottom hem
    ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.86); ctx.lineTo(w * 0.78, h * 0.86); ctx.stroke();
    // Sleeve seams
    ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.33); ctx.lineTo(w * 0.22, h * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.88, h * 0.33); ctx.lineTo(w * 0.78, h * 0.25); ctx.stroke();
    ctx.setLineDash([]);

    // Collar
    if (tshirtSide === 'front') {
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.065);
      ctx.quadraticCurveTo(w * 0.5, h * 0.13, w * 0.65, h * 0.065);
      ctx.strokeStyle = tshirtColor.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 3;
      ctx.setLineDash([]); ctx.stroke();
    } else {
      // Back collar tag
      ctx.fillStyle = tshirtColor.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(w * 0.46, h * 0.05, w * 0.08, h * 0.03);
      ctx.beginPath();
      ctx.moveTo(w * 0.38, h * 0.05);
      ctx.quadraticCurveTo(w * 0.5, h * 0.075, w * 0.62, h * 0.05);
      ctx.strokeStyle = tshirtColor.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 2; ctx.stroke();
    }

    // Light/shadow gradient overlay
    const grad = ctx.createLinearGradient(w * 0.22, 0, w * 0.78, 0);
    grad.addColorStop(0, tshirtColor.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)');
    grad.addColorStop(0.4, 'transparent');
    grad.addColorStop(0.6, 'transparent');
    grad.addColorStop(1, tshirtColor.dark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }, [tshirtColor, side, tshirtTemplates]);

  // Main draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background checkerboard (transparent indicator)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const sz = 20;
    ctx.fillStyle = '#e8ecf1';
    for (let y = 0; y < CANVAS_H; y += sz * 2) {
      for (let x = 0; x < CANVAS_W; x += sz * 2) {
        ctx.fillRect(x, y, sz, sz);
        ctx.fillRect(x + sz, y + sz, sz, sz);
      }
    }

    // Draw T-shirt
    drawTshirt(ctx);

    // Draw design image
    if (designImg) {
      const dw = designImg.naturalWidth * scale;
      const dh = designImg.naturalHeight * scale;
      ctx.save();
      ctx.translate(pos.x + dw / 2, pos.y + dh / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      // Bounding box
      ctx.save();
      ctx.translate(pos.x + dw / 2, pos.y + dh / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(99,102,241,0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-dw / 2 - 2, -dh / 2 - 2, dw + 4, dh + 4);
      ctx.setLineDash([]);
      // Corner handles
      const corners = [[-dw/2, -dh/2], [dw/2, -dh/2], [-dw/2, dh/2], [dw/2, dh/2]];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    } else {
      // Print zone placeholder
      const pz = {
        x: CANVAS_W * PRINT_ZONE.x,
        y: CANVAS_H * PRINT_ZONE.y,
        w: CANVAS_W * PRINT_ZONE.w,
        h: CANVAS_H * PRINT_ZONE.h,
      };
      ctx.strokeStyle = tshirtColor.dark ? 'rgba(255,255,255,0.3)' : 'rgba(99,102,241,0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(pz.x, pz.y, pz.w, pz.h);
      ctx.setLineDash([]);

      ctx.fillStyle = tshirtColor.dark ? 'rgba(255,255,255,0.5)' : 'rgba(99,102,241,0.5)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷 ارفع صورتك هنا', CANVAS_W / 2, CANVAS_H * 0.4);
      ctx.font = '13px Inter, sans-serif';
      ctx.fillStyle = tshirtColor.dark ? 'rgba(255,255,255,0.35)' : 'rgba(99,102,241,0.35)';
      ctx.fillText('اضغط على زر رفع الصورة أدناه', CANVAS_W / 2, CANVAS_H * 0.45);
    }
  }, [designImg, pos, scale, rotation, drawTshirt, tshirtColor]);

  useEffect(() => { draw(); }, [draw]);

  const loadDesignFromUrl = useCallback((dataUrl, targetSide = side) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(
        (CANVAS_W * PRINT_ZONE.w) / img.naturalWidth,
        (CANVAS_H * PRINT_ZONE.h) / img.naturalHeight,
        1
      );
      updateSideDesign({
        img,
        dataUrl,
        scale: s,
        rotation: 0,
        pos: {
          x: CANVAS_W * PRINT_ZONE.x + (CANVAS_W * PRINT_ZONE.w - img.naturalWidth * s) / 2,
          y: CANVAS_H * PRINT_ZONE.y + (CANVAS_H * PRINT_ZONE.h - img.naturalHeight * s) / 2,
        },
      }, targetSide);
    };
    img.src = dataUrl;
  }, [side, updateSideDesign]);

  const renderPreviewDataUrl = useCallback((targetSide, design) => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const sz = 20;
    ctx.fillStyle = '#e8ecf1';
    for (let y = 0; y < CANVAS_H; y += sz * 2) {
      for (let x = 0; x < CANVAS_W; x += sz * 2) {
        ctx.fillRect(x, y, sz, sz);
        ctx.fillRect(x + sz, y + sz, sz, sz);
      }
    }

    drawTshirt(ctx, targetSide);

    if (design.img) {
      const dw = design.img.naturalWidth * design.scale;
      const dh = design.img.naturalHeight * design.scale;
      ctx.save();
      ctx.translate(design.pos.x + dw / 2, design.pos.y + dh / 2);
      ctx.rotate((design.rotation * Math.PI) / 180);
      ctx.drawImage(design.img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [drawTshirt]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10MB)');
      return;
    }
    e.target.value = '';
    const activeSide = side;

    // Read original
    const origUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    updateSideDesign({ originalDataUrl: origUrl }, activeSide);

    // Remove background
    setRemovingBg(true);
    setRemovingProgress(0);
    setBgRemoved(true);
    const toastId = toast.loading('جاري إزالة الخلفية بالذكاء الاصطناعي...');
    try {
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setRemovingProgress(Math.round((current / total) * 100));
        },
      });
      const noBgUrl = URL.createObjectURL(blob);
      // Convert blob URL to data URL for persistence
      const noBgDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      loadDesignFromUrl(noBgDataUrl, activeSide);
      updateSideDesign({ bgRemoved: true }, activeSide);
      toast.success('تم إزالة الخلفية بنجاح!', { id: toastId });
      URL.revokeObjectURL(noBgUrl);
    } catch (err) {
      console.error('Background removal failed:', err);
      toast.error('فشل إزالة الخلفية، سيتم استخدام الصورة الأصلية', { id: toastId });
      loadDesignFromUrl(origUrl, activeSide);
      updateSideDesign({ bgRemoved: false }, activeSide);
    } finally {
      setRemovingBg(false);
      setRemovingProgress(0);
    }
  };

  // Toggle between original and bg-removed
  const toggleBackground = async () => {
    if (!originalDataUrl || !designDataUrl) return;
    if (bgRemoved) {
      // Switch to original
      loadDesignFromUrl(originalDataUrl);
      setBgRemoved(false);
      toast.success('تم إظهار الصورة الأصلية');
    } else {
      // Re-remove background
      setRemovingBg(true);
      setRemovingProgress(0);
      const toastId = toast.loading('جاري إزالة الخلفية...');
      try {
        const resp = await fetch(originalDataUrl);
        const origBlob = await resp.blob();
        const blob = await removeBackground(origBlob, {
          progress: (key, current, total) => {
            if (total > 0) setRemovingProgress(Math.round((current / total) * 100));
          },
        });
        const noBgDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        loadDesignFromUrl(noBgDataUrl);
        setBgRemoved(true);
        toast.success('تم إزالة الخلفية!', { id: toastId });
      } catch {
        toast.error('فشل إزالة الخلفية', { id: toastId });
      } finally {
        setRemovingBg(false);
        setRemovingProgress(0);
      }
    }
  };

  // Canvas coordinate helpers
  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches?.[0] ?? e;
    return {
      x: ((src.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((src.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const onStart = (e) => {
    if (!designImg) return;
    const { x, y } = getCoords(e);
    const dw = designImg.naturalWidth * scale;
    const dh = designImg.naturalHeight * scale;
    if (x >= pos.x && x <= pos.x + dw && y >= pos.y && y <= pos.y + dh) {
      dragging.current = true;
      dragOffset.current = { x: x - pos.x, y: y - pos.y };
    }
  };

  const onMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    setPos({ x: x - dragOffset.current.x, y: y - dragOffset.current.y });
  };

  const onEnd = () => { dragging.current = false; };

  const removeDesign = () => {
    updateSideDesign(createEmptySideDesign());
  };

  const centerDesign = () => {
    if (!designImg) return;
    const dw = designImg.naturalWidth * scale;
    const dh = designImg.naturalHeight * scale;
    setPos({
      x: CANVAS_W * PRINT_ZONE.x + (CANVAS_W * PRINT_ZONE.w - dw) / 2,
      y: CANVAS_H * PRINT_ZONE.y + (CANVAS_H * PRINT_ZONE.h - dh) / 2,
    });
  };

  const handleProceed = () => {
    if (!hasAnyDesign) {
      toast.error('الرجاء رفع صورة التصميم أولاً');
      return;
    }
    setOrderStep(1);
    setShowOrderForm(true);
  };

  const handleNextOrderStep = () => {
    if (orderStep === 1 && (!form.customerName || !form.wilaya)) {
      toast.error('يرجى إدخال الاسم واختيار الولاية');
      return;
    }
    if (orderStep === 2 && !form.phone) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    setOrderStep((step) => Math.min(step + 1, 3));
  };

  const dataUrlToBlob = (dataUrl) => {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const uploadWithTimeout = (promise, ms = 5000) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

  const createCompressedImage = (dataUrl, maxSize = 900, quality = 0.78) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.wilaya) {
      toast.error('يرجى ملء الحقول المطلوبة'); return;
    }
    setSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      let designImageUrl = '', customizedTshirtUrl = '';
      const customDesigns = {};
      const designedSides = Object.entries(sideDesigns).filter(([, design]) => design.dataUrl && design.img);
      const shouldUploadToStorage = !['localhost', '127.0.0.1'].includes(window.location.hostname);

      // Try uploading images with a 15s timeout so the order is never blocked
      for (const [sideKey, design] of designedSides) {
        const designRecord = {
          side: sideKey,
          sideLabel: getSideLabel(sideKey),
          bgRemoved: design.bgRemoved,
          position: design.pos,
          scale: design.scale,
          rotation: design.rotation,
          designImageUrl: '',
          designImageDataUrl: '',
          customizedTshirtUrl: '',
          customizedTshirtDataUrl: '',
        };
        const composite = renderPreviewDataUrl(sideKey, design);
        designRecord.designImageDataUrl = await createCompressedImage(design.dataUrl, 900, 0.75);
        designRecord.customizedTshirtDataUrl = composite;

        if (shouldUploadToStorage) {
          try {
            const blob = dataUrlToBlob(design.dataUrl);
            const fileRef = ref(storage, `designs/${sideKey}_original_${orderNumber}_${Date.now()}.png`);
            await uploadWithTimeout(uploadBytes(fileRef, blob));
            designRecord.designImageUrl = await uploadWithTimeout(getDownloadURL(fileRef));
          } catch (uploadErr) {
            console.warn(`${sideKey} design upload failed:`, uploadErr.message);
          }
        }

        if (shouldUploadToStorage) {
          try {
            const blob = dataUrlToBlob(composite);
            const fileRef = ref(storage, `designs/${sideKey}_preview_${orderNumber}_${Date.now()}.jpg`);
            await uploadWithTimeout(uploadBytes(fileRef, blob));
            designRecord.customizedTshirtUrl = await uploadWithTimeout(getDownloadURL(fileRef));
          } catch (uploadErr) {
            console.warn(`${sideKey} composite upload failed:`, uploadErr.message);
          }
        }

        customDesigns[sideKey] = designRecord;
        if (!designImageUrl) designImageUrl = designRecord.designImageUrl || designRecord.designImageDataUrl;
        if (!customizedTshirtUrl) customizedTshirtUrl = designRecord.customizedTshirtUrl || designRecord.customizedTshirtDataUrl;
      }

      const orderData = {
        orderNumber,
        customerName: form.customerName,
        phone: form.phone,
        wilaya: form.wilaya,
        commune: form.commune || '',
        address: form.address || '',
        note: form.note || '',
        items: [{
          productName: 'تيشرت مخصص',
          size: selectedSize,
          color: 'أبيض',
          quantity: 1,
          price: productPrice,
          side: designedSides.map(([sideKey]) => getSideLabel(sideKey)).join(' + '),
        }],
        productPrice,
        deliveryCost,
        totalPrice: orderTotal,
        totalCost: 0,
        netProfit: productPrice,
        status: 'new',
        designImageUrl,
        customizedTshirtUrl,
        customDesigns,
        designedSides: designedSides.map(([sideKey]) => sideKey),
        tshirtColor: 'أبيض',
        tshirtColorHex: '#FFFFFF',
        designSide: designedSides.map(([sideKey]) => sideKey).join(','),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
      setShowOrderForm(false);
      navigate('/order-success', { state: { orderNumber } });
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error('حدث خطأ: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900 animate-gradient-shift"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-[10%] w-64 h-64 bg-primary-500/15 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-5 left-[20%] w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
          <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-sm mb-4 text-white/80 animate-fade-in-up">
            <FiImage size={14} />
            أداة تصميم التيشرت
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
            صمّم تيشرتك <span className="bg-gradient-to-r from-accent-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">بنفسك</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-lg mx-auto animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
            ارفع صورتك وحركها على التيشرت حتى تحصل على التصميم المثالي
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas area */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl shadow-premium-lg p-4 md:p-6 animate-scale-in relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className={`w-full rounded-2xl ${designImg ? 'cursor-move' : 'cursor-default'}`}
                style={{ maxHeight: '70vh', aspectRatio: '1/1' }}
                onMouseDown={onStart}
                onMouseMove={onMove}
                onMouseUp={onEnd}
                onMouseLeave={onEnd}
                onTouchStart={onStart}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
              />

              {/* Background removal loading overlay */}
              {removingBg && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-30">
                  <div className="relative w-20 h-20 mb-5">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                      <circle cx="40" cy="40" r="35" fill="none" stroke="url(#grad)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - removingProgress / 100)}`}
                        className="transition-all duration-300" />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiScissors size={24} className="text-primary-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-dark-700 font-bold text-base">جاري إزالة الخلفية...</p>
                  <p className="text-dark-400 text-sm mt-1">الذكاء الاصطناعي يعالج صورتك</p>
                  {removingProgress > 0 && (
                    <div className="mt-3 w-48 h-2 bg-dark-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300"
                        style={{ width: `${removingProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload + Toggle + Remove buttons */}
            <div className="flex gap-3 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              <label className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20 font-semibold text-sm ${removingBg ? 'opacity-50 pointer-events-none' : ''}`}>
                <FiUpload size={18} />
                {designImg ? 'تغيير الصورة' : 'رفع صورة التصميم'}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={removingBg} />
              </label>
              {designImg && (
                <>
                  <button onClick={toggleBackground} disabled={removingBg || !originalDataUrl}
                    className={`px-4 py-4 rounded-full transition-colors border text-sm font-medium ${
                      bgRemoved
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    } disabled:opacity-50`}
                    title={bgRemoved ? 'إظهار الخلفية الأصلية' : 'إزالة الخلفية'}>
                    <FiLayers size={18} />
                  </button>
                  <button onClick={centerDesign}
                    className="px-4 py-4 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors border border-primary-200"
                    title="توسيط">
                    <FiMaximize2 size={18} />
                  </button>
                  <button onClick={removeDesign}
                    className="px-4 py-4 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors border border-red-200"
                    title="حذف">
                    <FiX size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Background status badge */}
            {designImg && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
                bgRemoved
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                <FiScissors size={13} />
                {bgRemoved ? 'تم إزالة الخلفية تلقائياً ✓' : 'الصورة بالخلفية الأصلية'}
                <button onClick={toggleBackground} disabled={removingBg}
                  className="mr-auto underline hover:no-underline text-xs disabled:opacity-50">
                  {bgRemoved ? 'استرجاع الخلفية' : 'إزالة الخلفية'}
                </button>
              </div>
            )}
          </div>

          {/* Controls sidebar */}
          <div className="space-y-5 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
            {/* Front/Back Toggle */}
            <div className="bg-white rounded-3xl shadow-premium p-5">
              <h3 className="font-bold text-dark-800 text-base mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs"><FiRepeat size={14} /></span>
                الوجه
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSide('front')}
                  className={`py-3 rounded-full text-sm font-semibold transition-all ${side === 'front' ? 'bg-primary-500 text-white shadow-lg' : 'bg-dark-50 text-dark-500 hover:bg-dark-100'}`}>
                  أمام 👕
                </button>
                <button onClick={() => setSide('back')}
                  className={`py-3 rounded-full text-sm font-semibold transition-all ${side === 'back' ? 'bg-primary-500 text-white shadow-lg' : 'bg-dark-50 text-dark-500 hover:bg-dark-100'}`}>
                  خلف 🔄
                </button>
              </div>
              <p className="mt-3 text-xs text-dark-400 leading-relaxed">
                يمكن الطباعة على الأمام فقط أو الخلف فقط أو الاثنين معًا. اترك الوجه بدون صورة إذا لا تريد الطباعة عليه.
              </p>
            </div>

            {/* Design controls */}
            {designImg && (
              <div className="bg-white rounded-3xl shadow-premium p-6 space-y-5 animate-scale-in">
                <h3 className="font-bold text-dark-800 text-base flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white text-xs">⚙️</span>
                  أدوات التعديل
                </h3>

                {/* Scale */}
                <div>
                  <div className="flex justify-between text-sm font-medium text-dark-600 mb-2">
                    <span className="flex items-center gap-1"><FiZoomIn size={14} /> الحجم</span>
                    <span className="bg-dark-100 px-2.5 py-0.5 rounded-lg text-xs font-bold">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range" min="5" max="200" value={Math.round(scale * 100)}
                    onChange={e => setScale(Number(e.target.value) / 100)}
                    className="w-full accent-primary-500 h-2 rounded-full"
                  />
                  <div className="flex justify-between text-[10px] text-dark-300 mt-1">
                    <span>صغير</span>
                    <span>كبير</span>
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-sm font-medium text-dark-600 mb-2">
                    <span className="flex items-center gap-1"><FiRotateCw size={14} /> الدوران</span>
                    <span className="bg-dark-100 px-2.5 py-0.5 rounded-lg text-xs font-bold">{rotation}°</span>
                  </div>
                  <input
                    type="range" min="-180" max="180" value={rotation}
                    onChange={e => setRotation(Number(e.target.value))}
                    className="w-full accent-primary-500 h-2 rounded-full"
                  />
                  <div className="flex justify-between text-[10px] text-dark-300 mt-1">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>180°</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button onClick={() => setRotation(0)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-dark-50 text-dark-600 rounded-full hover:bg-dark-100 transition-colors text-xs font-medium">
                    <FiRefreshCw size={12} /> إعادة الدوران
                  </button>
                  <button onClick={centerDesign}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-dark-50 text-dark-600 rounded-full hover:bg-dark-100 transition-colors text-xs font-medium">
                    <FiMaximize2 size={12} /> توسيط
                  </button>
                </div>

                {/* Drag hint */}
                <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-2 text-xs text-primary-600">
                  <FiMove size={14} className="shrink-0" />
                  <span>اسحب الصورة مباشرة على التيشرت لتغيير موضعها</span>
                </div>
              </div>
            )}

            {/* Proceed / Order button */}
            <button
              onClick={handleProceed}
              disabled={!hasAnyDesign}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 animate-gradient-shift text-white py-4 rounded-full font-bold text-base hover:opacity-90 transition-all shadow-2xl shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiSend size={20} />
              إرسال الطلب
            </button>

            {!designImg && (
              <div className="bg-gradient-to-br from-dark-50 to-white rounded-3xl shadow-premium p-6 text-center space-y-3">
                <div className="text-5xl animate-float">👕</div>
                <h4 className="font-bold text-dark-700">كيف تستخدم المصمم؟</h4>
                <ol className="text-sm text-dark-400 space-y-2 text-right list-decimal list-inside">
                  <li>اختر الوجه المطلوب للطباعة (أمام/خلف)</li>
                  <li>ارفع صورة التصميم الخاص بك</li>
                  <li>ستُزال الخلفية تلقائياً بالذكاء الاصطناعي</li>
                  <li>اسحب وعدّل حجم ومكان الصورة</li>
                  <li>اضغط "إرسال الطلب" لإتمام الطلبية</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowOrderForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scale-in" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2"><FiShoppingBag /> إتمام الطلب</h2>
              <button onClick={() => setShowOrderForm(false)} className="p-2 rounded-xl hover:bg-dark-100 text-dark-400"><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className={`rounded-2xl py-2 ${orderStep === stepNumber ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-dark-50 text-dark-400'}`}>
                    {stepNumber === 1 ? 'المعلومات' : stepNumber === 2 ? 'الهاتف' : 'الفاتورة'}
                  </div>
                ))}
              </div>

              {orderStep === 1 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-700 leading-relaxed">
                    اختر المقاس والولاية أولا حتى نحسب سعر التوصيل في الفاتورة.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">الاسم الكامل *</label>
                      <input name="customerName" value={form.customerName} onChange={e => setForm(p => ({...p, customerName: e.target.value}))} required
                        placeholder="اكتب اسمك" className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">المقاس</label>
                      <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}
                        className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                        {tshirtSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">الولاية *</label>
                    <select name="wilaya" value={form.wilaya} onChange={e => setForm(p => ({...p, wilaya: e.target.value}))} required
                      className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                      <option value="">اختر الولاية</option>
                      {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {orderStep === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  <h3 className="font-semibold text-dark-700 flex items-center gap-2 text-sm"><FiPhone size={14} /> معلومات التواصل</h3>
                  <input name="phone" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} required type="tel"
                    placeholder="رقم الهاتف *" className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input name="commune" value={form.commune} onChange={e => setForm(p => ({...p, commune: e.target.value}))}
                      placeholder="البلدية (اختياري)" className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                    <input name="address" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))}
                      placeholder="العنوان (اختياري)" className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <textarea name="note" value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))} rows={3}
                    placeholder="ملاحظة للطلب (اختياري)" className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" />
                </div>
              )}

              {orderStep === 3 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="bg-dark-50 rounded-2xl p-4 text-sm space-y-3">
                    <div className="flex justify-between"><span className="text-dark-500">الاسم</span><span className="font-semibold text-dark-800">{form.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-dark-500">الولاية</span><span className="font-semibold text-dark-800">{form.wilaya}</span></div>
                    <div className="flex justify-between"><span className="text-dark-500">المقاس</span><span className="font-semibold text-dark-800">{selectedSize}</span></div>
                    <div className="flex justify-between"><span className="text-dark-500">الوجه</span><span className="font-semibold text-dark-800">{designedSideLabels || 'لم يتم اختيار وجه'}</span></div>
                  </div>

                  <div className="rounded-2xl border border-primary-100 overflow-hidden">
                    <div className="bg-primary-600 text-white px-4 py-3 font-bold">الفاتورة</div>
                    <div className="p-4 text-sm space-y-3">
                      <div className="flex justify-between"><span className="text-dark-500">سعر التيشرت</span><span className="font-bold">{productPrice.toLocaleString('fr-DZ')} دج</span></div>
                      <div className="flex justify-between"><span className="text-dark-500">حقوق التوصيل</span><span className="font-bold">{deliveryCost.toLocaleString('fr-DZ')} دج</span></div>
                      <div className="border-t border-dark-100 pt-3 flex justify-between text-base"><span className="font-bold text-dark-800">الإجمالي</span><span className="font-extrabold text-primary-700">{orderTotal.toLocaleString('fr-DZ')} دج</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {orderStep > 1 && (
                  <button type="button" onClick={() => setOrderStep((step) => Math.max(step - 1, 1))}
                    className="px-5 py-3 rounded-full bg-dark-100 text-dark-600 font-semibold hover:bg-dark-200 transition-colors">
                    رجوع
                  </button>
                )}
                {orderStep < 3 ? (
                  <button type="button" onClick={handleNextOrderStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-full font-semibold hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-600/20">
                    التالي
                  </button>
                ) : (
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-full font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 shadow-lg shadow-primary-600/20">
                    {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> جاري الإرسال...</> : <><FiSend size={18} /> تأكيد وإرسال الطلب</>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
