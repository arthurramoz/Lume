import styled from 'styled-components';

export const MasterLayoutContainer = styled.div`
  width: 100%;

  padding: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: ${({ theme }) => theme.colors.white};
`;

export const MasterLayoutContent = styled.div`
  width: 100%;
  overflow: auto;

  display: flex;
  flex-direction: column;
`;
