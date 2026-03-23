import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export const useCaptcha = () => {
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef(null);

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    
    // Background based on theme
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc'; // slate-800 or slate-50
    ctx.fillRect(0, 0, width, height);

    // Generate text
    const text = generateRandomString(6);
    setCaptchaText(text);

    // Add noise patterns
    const noiseColors = isDark ? ['#334155', '#475569', '#1e293b'] : ['#cbd5e1', '#94a3b8', '#e2e8f0'];
    
    // Draw lines
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)];
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw dots
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)];
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Text with varying properties
    const textColors = isDark ? ['#f8fafc', '#e2e8f0', '#cbd5e1'] : ['#0f172a', '#1e293b', '#334155'];
    ctx.font = 'bold 28px sans-serif';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const color = textColors[Math.floor(Math.random() * textColors.length)];
      ctx.fillStyle = color;
      
      const x = 20 + i * 25;
      const y = height / 2 + (Math.random() * 10 - 5);
      
      const angle = (Math.random() * 0.4 - 0.2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // add slight scale variation
      const scale = 1 + (Math.random() * 0.2 - 0.1);
      ctx.scale(scale, scale);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  return { canvasRef, captchaText, reloadCaptcha: drawCaptcha };
};

export const CaptchaCanvas = ({ canvasRef, onReload, className = '' }) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <canvas 
          ref={canvasRef} 
          width={180} 
          height={50} 
          className="cursor-pointer"
          onClick={onReload}
          title="Klik gambar untuk ganti captcha"
        />
      </div>
      <button 
        type="button" 
        onClick={onReload}
        className="p-2.5 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
        title="Refresh Captcha"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
};
