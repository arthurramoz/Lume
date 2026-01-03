import * as yup from 'yup';

export type IRegisterForm = yup.InferType<typeof RegisterSchema>;

export const RegisterSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  date: yup.string().required('Data de nascimento é obrigatório'),
  profission: yup.string(),
  gender: yup.string().required('Sexo é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
  password: yup.string().required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas devem coincidir')
    .required('Confirmação de senha é obrigatória'),
});
