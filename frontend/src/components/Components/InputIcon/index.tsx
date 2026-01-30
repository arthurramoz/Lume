import { InputHTMLAttributes } from 'react';
import { Container, Icon, Input } from './style';

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconSrc: string;
}

export function InputIcon({ iconSrc, ...props }: IconInputProps) {
  return (
    <Container>
      <Icon src={iconSrc} />
      <Input {...props} />
    </Container>
  );
}
