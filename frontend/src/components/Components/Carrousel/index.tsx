import { useRef } from 'react';
import { ArrowButton, CarouselContainer, ScrollContainer } from './style';
import {
  ButtonCardBook,
  ByCardBook,
  CardBook,
  EndCardBook,
  IconButton,
  ImageCardBook,
  MiddleCardBook,
  NameCardBook,
  PriceCardBook,
  TextsCardBook,
} from '@/components/Pages/Home/style';
import { formatToBRL } from '@/hooks/format';
import { useRouter } from 'next/navigation';
import { useGoToProduct } from '@/hooks/functions';

interface Book {
  id: number;
  title: string;
  by: string;
  price: number;
  image: {
    url: string;
  };
}

interface BookCarouselProps {
  books: Book[];
}

const BookCarousel = ({ books }: BookCarouselProps) => {
  const goToProduct = useGoToProduct();

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / 2;

      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <CarouselContainer>
      <ArrowButton $position="left" onClick={() => handleScroll('left')}>
        <img src="/icons/left-arrow-carrousel.svg" alt="Anterior" />
      </ArrowButton>

      <ScrollContainer ref={scrollRef}>
        {books.map((book, index) => (
          <CardBook key={index} onClick={() => goToProduct(book.id)}>
            <MiddleCardBook>
              <ImageCardBook src={book.image.url} alt={book.title} />
              <TextsCardBook>
                <NameCardBook>{book.title}</NameCardBook>
                <ByCardBook>Por: {book.by}</ByCardBook>
                <PriceCardBook>{formatToBRL(book.price)}</PriceCardBook>
              </TextsCardBook>
            </MiddleCardBook>

            <EndCardBook>
              <ButtonCardBook>
                <IconButton src="/icons/cart-white.svg" />
                Adicionar
              </ButtonCardBook>
            </EndCardBook>
          </CardBook>
        ))}
      </ScrollContainer>

      <ArrowButton $position="right" onClick={() => handleScroll('right')}>
        <img src="/icons/right-arrow-carrousel.svg" alt="Próximo" />
      </ArrowButton>
    </CarouselContainer>
  );
};

export default BookCarousel;
