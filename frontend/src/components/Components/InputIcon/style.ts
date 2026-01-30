import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 48px;
  display: flex;
  border-radius: 12px;
  align-items: center;
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.neutro20};
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-right: 12px;
  margin-left: 12px;
`;

export const Input = styled.input`
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.neutro100};

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutro60};
  }
`;
