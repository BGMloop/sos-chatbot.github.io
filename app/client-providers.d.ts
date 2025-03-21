import { ReactNode } from 'react';

declare module './client-providers' {
  export default function ClientProviders({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element;
} 