import { useParams, useRouter } from 'next/navigation';
import { Center } from '../Home/style';
import { useEffect, useState } from 'react';
import { Book, BooksMock } from '@/components/Mock/Books';
import { ProductBody } from './style';

const Product = () => {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState<Book>();

  useEffect(() => {
    const IdBook = Number(id);

    const data = BooksMock.find(book => book.id === IdBook);

    setBook(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      router.back();
      return;
    }

    const foundBook = BooksMock.find(book => book.id === idNumber);

    if (!foundBook) {
      router.back();
      return;
    }

    setBook(foundBook);
  }, [id]);

  return (
    <Center>
      <ProductBody>{/* <BackTo></BackTo> */}</ProductBody>
    </Center>
  );
};

export default Product;
