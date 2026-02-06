import styled from 'styled-components';

export const FooterMain = styled.div`
  width: 100%;
  height: 120px;

  background: ${({ theme }) => theme.colors.primaria100};
  padding: 20px 50px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FooterCenter = styled.div`
  width: 100%;
  ${({ theme }) => theme.limit.screen};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FooterLeft = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
  gap: 10px;
`;

export const FooterRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: end;
  align-items: center;
`;

export const FooterText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.white};

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
