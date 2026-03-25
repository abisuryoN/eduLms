import { useState } from 'react';
import { User } from 'lucide-react';
import api from '../../lib/api';

export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const [error, setError] = useState(false);

  const getInitials = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const baseClass = `relative flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800 ${sizeClasses[size]} ${className}`;

  if (!src || error) {
    return (
      <div className={baseClass}>
        {name ? (
          <span className="font-bold text-brand-700 dark:text-brand-300">
            {getInitials(name)}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-brand-500 dark:text-brand-400" />
        )}
      </div>
    );
  }

  const getAvatarSrc = () => {
    if (!src) return null;
    if (src.startsWith('http')) return src;
    const base = api.defaults.baseURL.replace('/api', '');
    return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  return (
    <div className={baseClass}>
      <img
        src={getAvatarSrc()}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};
