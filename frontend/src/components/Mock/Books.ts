export interface Book {
  id: number;
  title: string;
  desc: string;
  by: string;
  price: number;
  image: Upload;
}

interface Upload {
  id: number;
  url: string;
}

export const BooksMock: Book[] = [
  {
    id: 1,
    title: 'O Dragão Azul',
    by: 'Lucas Andrade',
    desc: 'Uma aventura mágica sobre amizade e coragem.',
    price: 12,
    image: { id: 1, url: '/books/book1.svg' },
  },
  {
    id: 2,
    title: 'A Menina das Estrelas',
    by: 'Marina Costa',
    desc: 'História infantil sobre sonhos e imaginação.',
    price: 10,
    image: { id: 2, url: '/books/book2.svg' },
  },
  {
    id: 3,
    title: 'O Leão Medroso',
    by: 'Pedro Lima',
    desc: 'Um leão que aprende a vencer seus medos.',
    price: 15,
    image: { id: 3, url: '/books/book3.svg' },
  },
  {
    id: 4,
    title: 'O novelo de emoções',
    by: 'Elizabete Neves',
    desc: 'Um passeio por um mundo cheio de criaturas mágicas.',
    price: 18,
    image: { id: 4, url: '/books/book4.svg' },
  },
  {
    id: 5,
    title: 'O Robô Curioso',
    by: 'Carlos Souza',
    desc: 'Um robô que quer entender as emoções humanas.',
    price: 14,
    image: { id: 5, url: '/books/book1.svg' },
  },
  {
    id: 6,
    title: 'A Casa nas Nuvens',
    by: 'Fernanda Alves',
    desc: 'Uma história sobre amizade e fantasia.',
    price: 11,
    image: { id: 6, url: '/books/book2.svg' },
  },
  {
    id: 7,
    title: 'O Coelho Viajante',
    by: 'Rafael Torres',
    desc: 'Um coelho que descobre o mundo fora da toca.',
    price: 13,
    image: { id: 7, url: '/books/book3.svg' },
  },
  {
    id: 8,
    title: 'A Princesa do Mar',
    by: 'Juliana Rocha',
    desc: 'Uma princesa que vive aventuras no fundo do oceano.',
    price: 20,
    image: { id: 8, url: '/books/book4.svg' },
  },
  {
    id: 9,
    title: 'O Trem dos Sonhos',
    by: 'Bruno Martins',
    desc: 'Uma viagem por lugares onde tudo é possível.',
    price: 16,
    image: { id: 9, url: '/books/book1.svg' },
  },
  {
    id: 10,
    title: 'O Gato Inventor',
    by: 'Paula Nogueira',
    desc: 'Um gato que cria máquinas divertidas.',
    price: 17,
    image: { id: 10, url: '/books/book3.svg' },
  },
];
