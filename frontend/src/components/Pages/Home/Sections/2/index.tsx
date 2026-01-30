import { SubtitleSection, TitleSection } from '@/styles/components';
import {
  ButtonCardBook,
  ByCardBook,
  CardBook,
  CardBookFilter,
  EndCardBook,
  FilterLeft,
  FilterLeftTop,
  FilterRight,
  FilterRightMiddle,
  FilterRightTop,
  FilterSection,
  FilterTitle,
  IconButton,
  ImageCardBook,
  MiddleCardBook,
  NameCardBook,
  PriceCardBook,
  Section,
  TextsCardBook,
} from '../../style';
import { InputIcon } from '@/components/Components/InputIcon';
import SortDropdown from '@/components/Components/FilterDropdown';
import { sortOptions } from '@/components/Mock/Options';
import { BooksMock } from '@/components/Mock/Books';
import { formatToBRL } from '@/hooks/format';

const Section2 = () => {
  return (
    <Section>
      <TitleSection>Explore o nosso catálogo de livros!</TitleSection>

      <SubtitleSection>
        Use os filtros e encontre o livro perfeito.
      </SubtitleSection>

      <FilterSection>
        <FilterLeft>
          <FilterLeftTop>
            <FilterTitle>Filtrar</FilterTitle>

            <IconButton src="/icons/filter.svg" />
          </FilterLeftTop>
        </FilterLeft>

        <FilterRight>
          <FilterRightTop>
            <InputIcon
              iconSrc="/icons/search.svg"
              placeholder="Pesquise por autores, gêneros..."
            />

            <SortDropdown
              options={sortOptions}
              onChange={value => console.log('Ordenando por:', value)}
            />
          </FilterRightTop>

          <FilterRightMiddle>
            {BooksMock.map((book, index) => (
              <CardBookFilter key={index}>
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
              </CardBookFilter>
            ))}
          </FilterRightMiddle>
        </FilterRight>
      </FilterSection>
    </Section>
  );
};

export default Section2;
