'use client';

import { PropsWithChildren } from 'react';
import Topbar from '@/components/Components/Topbar/Topbar';
import { MasterLayoutContainer, MasterLayoutContent } from './styles';
import Footer from '@/components/Components/Footer';

const MasterLayout = ({ children }: PropsWithChildren) => {
  return (
    <MasterLayoutContainer>
      <Topbar />
      <MasterLayoutContent>{children}</MasterLayoutContent>
      <Footer />
    </MasterLayoutContainer>
  );
};

export default MasterLayout;
