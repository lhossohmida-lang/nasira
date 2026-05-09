import { useRef, useEffect, useState, useCallback } from 'react';
import { FiUpload, FiX, FiMove } from 'react-icons/fi';

const W = 500, H = 500;

export default function TshirtCustomizer({ tshirtImageUrl, onUpdate }) {
  const canvasRef = useRef(null);
  const [tshirtImg, setTshirtImg] = useState(null);
  const [designImg, setDesignImg] = useState(null);
  const [designDataUrl, setDesignDataUrl] = useState(null);
  const [pos, setPos] = useState({ x: 150, y: 110 });
  const [scale, setScale] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!tshirtImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setTshirtImg(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => setTshirtImg(img2);
      img2.src = tshirtImageUrl;
    };
    img.src = tshirtImageUrl;
  }, [tshirtImageUrl]);

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, W, H);

    if (tshirtImg) {
      ctx.drawImage(tshirtImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#d1d5db';
      ctx.font = 'bold 100px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👕', W / 2, H / 2 + 35);
    }

    if (designImg) {
      const dw = designImg.naturalWidth * scale;
      const dh = designImg.naturalHeight * scale;
      ctx.save();
      ctx.translate(pos.x + dw / 2, pos.y + dh / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(99,102,241,0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 4]);
      ctx.strokeRect(W * 0.25, H * 0.2, W * 0.5, H * 0.45);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(99,102,241,0.55)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('منطقة الطباعة — ارفع صورة أدناه', W / 2, H * 0.47);
    }
  }, [tshirtImg, designImg, pos, scale, rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    draw(ctx);

    if (designImg && designDataUrl) {
      try {
        const composite = canvas.toDataURL('image/jpeg', 0.9);
        onUpdate(designDataUrl, composite);
      } catch {
        onUpdate(designDataUrl, null);
      }
    } else if (!designImg) {
      onUpdate(null, null);
    }
  }, [draw, designImg, designDataUrl, onUpdate]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        const s = Math.min((W * 0.5) / img.naturalWidth, (H * 0.45) / img.naturalHeight, 1);
        setScale(s);
        setPos({ x: (W - img.naturalWidth * s) / 2, y: H * 0.22 });
        setRotation(0);
        setDesignImg(img);
        setDesignDataUrl(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches?.[0] ?? e;
    return {
      x: ((src.clientX - rect.left) / rect.width) * W,
      y: ((src.clientY - rect.top) / rect.height) * H,
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

  const remove = () => {
    setDesignImg(null);
    setDesignDataUrl(null);
    onUpdate(null, null);
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className={`w-full rounded-2xl border border-dark-200 shadow-sm ${designImg ? 'cursor-move' : 'cursor-default'}`}
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />

      <div className="flex gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-600 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors border border-primary-200 text-sm font-medium">
          <FiUpload size={16} />
          {designImg ? 'تغيير التصميم' : 'رفع صورة التصميم'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {designImg && (
          <button type="button" onClick={remove}
            className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-200">
            <FiX size={16} />
          </button>
        )}
      </div>

      {designImg && (
        <div className="bg-dark-50 rounded-xl p-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium text-dark-600 mb-1">
              <span>الحجم</span>
              <span>{Math.round(scale * 100)}%</span>
            </div>
            <input
              type="range" min="5" max="200" value={Math.round(scale * 100)}
              onChange={e => setScale(Number(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-medium text-dark-600 mb-1">
              <span>الدوران</span>
              <span>{rotation}°</span>
            </div>
            <input
              type="range" min="-180" max="180" value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <p className="text-xs text-dark-400 flex items-center gap-1">
            <FiMove size={11} />
            اسحب الصورة على التيشيرت لتغيير موضعها
          </p>
        </div>
      )}
    </div>
  );
}
