import { useRouter } from 'next/navigation';

export const useGoToProduct = () => {
  const router = useRouter();

  return (id: number) => {
    router.push(`/product/${id}`);
  };
};

export const useGoToHome = () => {
  const router = useRouter();

  return () => {
    router.push(`/home`);
  };
};
