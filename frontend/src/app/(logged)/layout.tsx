'use client';

import { PropsWithChildren } from 'react';
import Navbar from '@/components/Topbar/Topbar';
import { MasterLayoutContainer, MasterLayoutContent } from './styles';

const MasterLayout = ({ children }: PropsWithChildren) => {
  return (
    <MasterLayoutContainer>
      <Navbar />
      <MasterLayoutContent>{children}</MasterLayoutContent>
    </MasterLayoutContainer>
  );
};

export default MasterLayout;
