import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::after, *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  * {
   scroll-behavior: smooth;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  html {
    @media (max-width: 1440px) {
      font-size: 93.75%;
    }
  }
  button{
    cursor: pointer;
    }
  body {
    height: 100vh;
    text-rendering: optimizeLegibility;
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.black};
  }
  .simplebar-track.simplebar-vertical {
    background: ${({ theme }) => theme.colors.orange4};
    width: 11px;
    border-radius: 20px;
    padding: 0 !important;
    margin: 0 !important;
    right: 2px;
    z-index: 1;
  }
  .simplebar-scrollbar {
    opacity: 1 !important;
    display: block !important;
    transition: none !important;
    z-index: 2;
  }
  .simplebar-scrollbar::before {
    background-color: ${({ theme }) => theme.colors.orange2} !important;
    border-radius: 20px !important;
    opacity: 1 !important;
    margin: 0 !important;
    content: '';
    height: 100% !important;
}
`;
