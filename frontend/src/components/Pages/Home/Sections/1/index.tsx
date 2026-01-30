import { SubtitleSection, TitleSection } from '@/styles/components';
import { Section } from '../../style';
import BookCarousel from '@/components/Components/Carrousel';
import { BooksMock } from '@/components/Mock/Books';

const Section1 = () => {
  return (
    <Section>
      <TitleSection>Favoritos dos pequenos leitores</TitleSection>

      <SubtitleSection>
        Descubra por que esses livros fazem tanto sucesso!
      </SubtitleSection>

      <BookCarousel books={BooksMock} />
    </Section>
  );
};

export default Section1;
