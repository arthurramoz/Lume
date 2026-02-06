import styled from 'styled-components';

export const Center = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Sections = styled.div`
  width: 100%;
  height: auto;

  ${({ theme }) => theme.limit.screen};

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Banner = styled.div`
  width: 100%;
  height: 360px;
  background: ${({ theme }) => theme.colors.neutro20};
`;

export const Section = styled.div`
  width: 100%;
  height: auto;

  padding: 30px 20px;

  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
`;

export const CardsBook = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: auto;
`;

export const CardBook = styled.div`
  min-width: 263px;
  height: 482px;

  padding: 14px;

  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;

  gap: 10px;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  cursor: pointer;
`;

export const CardBookFilter = styled.div`
  height: 482px;
  padding: 14px;

  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;

  gap: 10px;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
  cursor: pointer;
`;

export const ImageCardBook = styled.img`
  width: 100%;
  height: 213px;
  object-fit: cover;
  border-radius: 12px;
`;

export const IconButton = styled.img`
  width: 24px;
  height: 24px;
`;

export const MiddleCardBook = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const EndCardBook = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const TextsCardBook = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NameCardBook = styled.p`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.neutro100};
`;

export const ByCardBook = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.neutro80};
`;

export const PriceCardBook = styled.p`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secundaria100};
`;

export const ButtonCardBook = styled.button`
  width: 100%;
  height: 48px;

  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secundaria100};

  display: flex;
  justify-content: center;
  align-items: center;

  outline: 0;
  border: 0;
  gap: 10px;

  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

export const FilterSection = styled.div`
  width: 100%;
  height: auto;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: start;
  gap: 20px;
`;

export const FilterTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaria100};
`;

export const FilterLeft = styled.div`
  flex: 1;
  height: auto;

  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding-right: 20px;
  border-right: 1px solid ${({ theme }) => theme.colors.neutro20};
`;

export const FilterLeftTop = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FilterRightTop = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

export const FilterRight = styled.div`
  flex: 5;
  height: auto;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

export const FilterRightMiddle = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
`;

export const FilterSearch = styled.input`
  width: 100%;
  height: 48px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const IconInput = styled.img`
  width: 24px;
  height: 24px;
  position: absolute;
  left: 0;
`;
