import Footer from './Footer';
import HomeSections from './Sections';
import { Banner, Center } from './style';

const Home = () => {
  return (
    <Center>
      <Banner />
      <HomeSections />
      <Footer />
    </Center>
  );
};

export default Home;
