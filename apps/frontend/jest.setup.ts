import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion to prevent animation-related errors in JSDOM
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div {...props} ref={ref}>{children}</div>
    )),
    h1: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h1 {...props} ref={ref}>{children}</h1>
    )),
  },
  AnimatePresence: ({ children }: any) => children,
}));