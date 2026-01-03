import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { localStorageKeys } from '@/utils/localStorageKeys';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { ILoginForm, LoginSchema } from '@/validations/LoginSchema';
import handleError from '@/utils/handleToast';

const Login = () => {
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setIsChecked] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit: SubmitHandler<ILoginForm> = async (form: ILoginForm) => {
    try {
      setIsSubmitting(true);

      setUser({ id: 1, username: 'Primeiro Login', email: form.email });

      localStorage.setItem(localStorageKeys.accessToken, '123');
      localStorage.setItem(
        localStorageKeys.user,
        JSON.stringify({
          id: 1,
          username: 'Primeiro Login',
          email: 'primeirologin@gmail.com',
        }),
      );
      localStorage.setItem(localStorageKeys.refreshToken, '123');

      if (form.email === 'primeirologin@gmail.com') {
        router.push('/login/terms');
      } else {
        router.push('/home');
      }
      window.location.reload();
    } catch (error) {
      handleError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p>teste</p>
    </div>
  );
};

export default Login;
