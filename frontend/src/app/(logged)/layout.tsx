'use client';

import { PropsWithChildren } from 'react';
import Topbar from '@/components/Topbar/Topbar';
import { MasterLayoutContainer, MasterLayoutContent } from './styles';

const MasterLayout = ({ children }: PropsWithChildren) => {
  return (
    <MasterLayoutContainer>
      <Topbar />
      <MasterLayoutContent>{children}</MasterLayoutContent>
    </MasterLayoutContainer>
  );
};

export default MasterLayout;
