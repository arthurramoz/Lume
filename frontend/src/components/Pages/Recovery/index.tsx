import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IRecoveryForm, RecoverySchema } from '@/validations/LoginSchema';
import handleError from '@/utils/handleToast';

const Recovery = () => {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRecoveryForm>({
    resolver: yupResolver(RecoverySchema),
  });

  const onSubmit: SubmitHandler<IRecoveryForm> = async (
    form: IRecoveryForm,
  ) => {
    try {
      setIsSubmitting(true);

      const payload = {
        email: form.email,
      };

      setSuccess(true);
    } catch (error) {
      handleError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p>Teste</p>
    </div>
  );
};

export default Recovery;
