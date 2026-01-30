import { useState, useRef, useEffect } from 'react';
import {
  ContainerDropdown,
  SelectButtonDropdown,
  LabelDropdown,
  SelectedValueDropdown,
  IconDropdown,
  DropdownList,
  DropdownItem,
} from './style';

interface Option {
  value: string | number;
  label: string;
}

interface SortDropdownProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string | number) => void;
  label?: string;
}

const SortDropdown = ({
  options,
  onChange,
  placeholder = 'Selecione',
  label = 'Ordenar por',
}: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  return (
    <ContainerDropdown ref={containerRef}>
      <SelectButtonDropdown onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <LabelDropdown>{label}</LabelDropdown>

        <SelectedValueDropdown $isPlaceholder={!selectedOption}>
          {selectedOption ? selectedOption.label : placeholder}
        </SelectedValueDropdown>

        <IconDropdown
          src="/icons/arrow-close-dropdown.svg"
          alt="Seta"
          $isOpen={isOpen}
        />
      </SelectButtonDropdown>

      {isOpen && (
        <DropdownList>
          {options.map(option => (
            <DropdownItem
              key={option.value}
              onClick={() => handleSelect(option)}
              $isSelected={selectedOption?.value === option.value}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </ContainerDropdown>
  );
};

export default SortDropdown;
