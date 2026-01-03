import styled from 'styled-components';

export const TopbarContainer = styled.div`
  width: 100%;
  height: 50px;

  display: flex;
  justify-content: center;
  padding: 0 50px;
`;

export const TopbarCenter = styled.div`
  width: 100%;
  max-width: 1400px;
  height: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TopbarDiv = styled.div`
  flex: 1;

  display: flex;
  gap: 20px;

  &.first {
    justify-content: start;
  }

  &.second {
    justify-content: center;
  }

  &.third {
    justify-content: end;
  }
`;
