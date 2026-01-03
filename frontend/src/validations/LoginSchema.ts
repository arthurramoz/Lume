import * as yup from 'yup';

export type ILoginForm = yup.InferType<typeof LoginSchema>;

export const LoginSchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
  password: yup
    .string()
    .required('Senha é obrigatória'),
});

export type IRecoveryForm = yup.InferType<typeof RecoverySchema>;

export const RecoverySchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
});

export type IChangeForm = yup.InferType<typeof ChangeySchema>;

export const ChangeySchema = yup.object({
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Mínimo de 6 digitos')
    .max(10, 'Máximo de 10 digitos'),
  confirmPassword: yup.string().required('Confirmação de senha é obrigatória'),
});

export type IChangePasswordSchema = yup.InferType<typeof ChangePasswordSchema>;

export const ChangePasswordSchema = yup.object({
  currentPassword: yup.string().required('Senha atual é obrigatória'),
  password: yup
    .string()
    .required('Nova senha é obrigatória')
    .min(6, 'Mínimo de 6 digitos')
    .max(10, 'Máximo de 10 digitos'),
  confirmPassword: yup
    .string()
    .required('Confirmação da nova senha é obrigatória'),
});
