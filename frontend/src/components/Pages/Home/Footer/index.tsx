import { IconButton } from '../style';
import {
  FooterCenter,
  FooterLeft,
  FooterMain,
  FooterRight,
  FooterText,
} from './style';
import { TopbarLogo } from '@/components/Components/Topbar/style';

const Footer = () => {
  return (
    <FooterMain>
      <FooterCenter>
        <FooterLeft>
          <FooterText>
            <strong>Fale conosco</strong>
          </FooterText>
          <FooterText>
            <IconButton src="/icons/email.svg" />
            www.contato@lume.com
          </FooterText>
        </FooterLeft>
        <FooterRight>
          <TopbarLogo src="/logo/logoGrandeWhite.svg" alt="Logo do Lume" />
        </FooterRight>
      </FooterCenter>
    </FooterMain>
  );
};

export default Footer;
