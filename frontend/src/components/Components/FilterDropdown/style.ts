import styled from 'styled-components';

export const ContainerDropdown = styled.div`
  position: relative;
  width: 100%;
  font-family: sans-serif;
`;

export const SelectButtonDropdown = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease;
`;

export const LabelDropdown = styled.span`
  display: flex;
  align-items: center;
  font-size: 16px;
  height: 100%;
  padding: 0 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.neutro100};
  border-right: 1px solid ${({ theme }) => theme.colors.neutro20};
  white-space: nowrap;
  font-family: var(--font-nunito), sans-serif;
`;

export const SelectedValueDropdown = styled.span<{ $isPlaceholder: boolean }>`
  flex: 1;
  padding: 0 16px;
  color: ${({ $isPlaceholder, theme }) =>
    $isPlaceholder ? theme.colors.neutro60 : theme.colors.neutro100};
  font-weight: 400;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-nunito), sans-serif;
`;

export const IconDropdown = styled.img<{ $isOpen: boolean }>`
  width: 20px;
  height: 20px;
  margin-right: 16px;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

export const DropdownList = styled.ul`
  position: absolute;
  top: 56px;
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.neutro20};
  border-radius: 12px;
  list-style: none;
  padding: 8px 0;
  z-index: 10;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
  max-height: 200px;
  overflow-y: auto;
`;

export const DropdownItem = styled.li<{ $isSelected: boolean }>`
  font-size: 16px;
  padding: 10px 16px;
  font-family: var(--font-nunito), sans-serif;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutro100};
  background-color: ${({ $isSelected }) =>
    $isSelected ? '#F5F5F5' : 'transparent'};
  font-weight: ${({ $isSelected }) => ($isSelected ? '600' : '400')};
`;
