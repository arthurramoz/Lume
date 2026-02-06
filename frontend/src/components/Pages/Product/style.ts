import styled from 'styled-components';

export const ProductBody = styled.div`
  width: 100%;
  height: 100%;
  ${({ theme }) => theme.limit.screen};

  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
`;
