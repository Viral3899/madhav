'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string;
  iconName?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const AppLogo = memo(function AppLogo({
  src = '',
  iconName = 'SparklesIcon',
  size = 64,
  className = '',
  onClick,
  href,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  const logo = (
    <div className={containerClassName} onClick={onClick}>
      {src ? (
        <AppImage
          src={src}
          alt="Logo"
          width={size}
          height={size}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith('.svg')}
        />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}
    </div>
  );

  return href ? (
    <Link href={href} aria-label="Go to Madhav Fashion Studio home">
      {logo}
    </Link>
  ) : (
    logo
  );
});

export default AppLogo;
