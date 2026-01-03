import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { TopbarCenter, TopbarContainer, TopbarDiv, TopbarLogo } from './style';

const Topbar = () => {
  const { logout } = useAuth();

  return (
    <TopbarContainer>
      <TopbarCenter>
        <TopbarDiv className="first">
          <TopbarLogo src="/logo/logoGrande.svg" alt="Logotipo" />
        </TopbarDiv>
        <TopbarDiv className="second">teste</TopbarDiv>
        <TopbarDiv className="third">teste</TopbarDiv>
      </TopbarCenter>
    </TopbarContainer>
  );
};

export default Topbar;
