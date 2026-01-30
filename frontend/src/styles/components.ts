import styled from 'styled-components';

export const TitleSection = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaria100};
`;

export const SubtitleSection = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.neutro80};
`;
