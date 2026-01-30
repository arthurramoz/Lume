import styled from 'styled-components';

export const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 0 auto;
`;

export const ScrollContainer = styled.div`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 0;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const ArrowButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => (props.$position === 'left' ? 'left: -5px;' : 'right: -5px;')}
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-50%) scale(1.1);
  }

  img {
    width: 48px;
    height: 48px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;
