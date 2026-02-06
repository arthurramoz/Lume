import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  TopbarCenter,
  TopbarContainer,
  TopbarDiv,
  TopbarLogo,
  TopbarText,
} from './style';
import { InputIcon } from '../InputIcon';
import { useGoToHome } from '@/hooks/functions';

const Topbar = () => {
  const { logout, isAuthenticated } = useAuth();

  const GoToHome = useGoToHome();

  return (
    <TopbarContainer>
      <TopbarCenter>
        <TopbarDiv className="first">
          <TopbarLogo
            src="/logo/logoGrande.svg"
            alt="Logotipo"
            onClick={GoToHome}
          />
        </TopbarDiv>
        <TopbarDiv className="second">
          <InputIcon
            iconSrc="/icons/search.svg"
            placeholder="Pesquise por autores, gêneros..."
          />
        </TopbarDiv>

        {isAuthenticated ? (
          <TopbarDiv className="third">
            <TopbarText>Bianca Codo</TopbarText>
          </TopbarDiv>
        ) : (
          <TopbarDiv className="third">
            <TopbarText>Deslogado</TopbarText>
          </TopbarDiv>
        )}
      </TopbarCenter>
    </TopbarContainer>
  );
};

export default Topbar;
