
import React from 'react';

interface IconProps {
  className?: string;
}

const createIcon = (path: React.ReactNode): React.FC<IconProps> => ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {path}
  </svg>
);

const createSolidIcon = (path: React.ReactNode): React.FC<IconProps> => ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        {path}
    </svg>
);

export const MenuIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
);

export const XMarkIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
);

export const SearchIcon = createSolidIcon(
  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
);

export const ClipboardDocumentListIcon = createSolidIcon(
  <path d="M11 2a1 1 0 00-1-1H5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011 2zm4 10a1 1 0 100-2h-3a1 1 0 100 2h3zM9 14a1 1 0 11-2 0 1 1 0 012 0z" />
);

export const TruckIcon = createSolidIcon(
    <path fillRule="evenodd" d="M18.316 6.364a1 1 0 01.684.949V16a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-1.382l-1.94-1.119a1 1 0 01-.44-1.263l.83-2.285A2.5 2.5 0 0012.5 7H11V6a1 1 0 011-1h5.316zM5 17a2 2 0 100-4 2 2 0 000 4zM15 17a2 2 0 100-4 2 2 0 000 4zM11 6H4a1 1 0 00-1 1v8a1 1 0 001 1h1.056A4.002 4.002 0 0111 13V6z" clipRule="evenodd" />
);

export const ChartBarIcon = createSolidIcon(
  <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM4.5 5.25a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM18 9.75a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM8.25 9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
);

export const DocumentTextIcon = createSolidIcon(
  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0011.586 2H4zm8.5 7a.5.5 0 00-1 0v4.5a.5.5 0 001 0V9zM8 9a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2A.5.5 0 018 9z" clipRule="evenodd" />
);

export const ChartBarSquareIcon = createSolidIcon(
    <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 00-.75.75v14.5a.75.75 0 00.75.75h14.5a.75.75 0 00.75-.75V11.25a.75.75 0 00-1.5 0v6.5h-13V3.75h6.5a.75.75 0 000-1.5h-6.5zM9.75 3.75a.75.75 0 00-.75.75v6.25a.75.75 0 001.5 0V4.5a.75.75 0 00-.75-.75zm3 2.25a.75.75 0 00-.75.75v4.25a.75.75 0 001.5 0V6.75a.75.75 0 00-.75-.75zm3 2.25a.75.75 0 00-.75.75v2.25a.75.75 0 001.5 0v-2.25a.75.75 0 00-.75-.75z" clipRule="evenodd" />
);

export const ChevronDownIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
);

export const UserCircleIcon = createIcon(
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
);

export const CheckCircleIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const XCircleIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const ClockIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const LogoutIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
);

export const PrinterIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h2m8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4m4 0h6" />
);

export const MailIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
);

export const CalendarDaysIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
);

export const ExclamationTriangleIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
);

export const GavelIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.5L16.5 9.75M16.5 9.75L18.75 7.5M16.5 9.75V16.5M6 16.5H12M6 16.5L6 9.75M6 9.75L6.375 9.375c1.125-1.125 2.875-1.125 4 0l.375.375M6 9.75L2.25 6l4.125-4.125a2.25 2.25 0 013.182 0l2.625 2.625a2.25 2.25 0 010 3.182L6 9.75z" />
);
