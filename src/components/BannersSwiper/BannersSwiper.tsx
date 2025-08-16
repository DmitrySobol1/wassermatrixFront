import { useState, useRef, useEffect } from 'react';
import { Banner, Button } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/Catalog/catalog.module.css';

interface Sale {
  _id: string;
  title_de?: string;
  title_en?: string;
  title_ru?: string;
  subtitle_de?: string;
  subtitle_en?: string;
  subtitle_ru?: string;
  buttonText_de?: string;
  buttonText_en?: string;
  buttonText_ru?: string;
  file?: {
    url: string;
  };
  isShowButton: boolean;
}

interface BannersSwiperProps {
  sales: Sale[];
  language: string;
  domen: string;
}

export const BannersSwiper: React.FC<BannersSwiperProps> = ({ sales, language, domen }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Создаем циклический массив: [last, ...original, first]
  const cyclicSales = sales.length > 1 ? [sales[sales.length - 1], ...sales, sales[0]] : sales;
  const totalSlides = cyclicSales.length;

  const goToSlide = (index: number, withTransition = true) => {
    if (!trackRef.current) return;
    
    setIsTransitioning(withTransition);
    const translateX = -index * 100;
    trackRef.current.style.transform = `translateX(${translateX}%)`;
    
    if (withTransition) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const nextSlide = () => {
    if (sales.length <= 1) return;
    
    const nextIndex = currentIndex + 1;
    
    setCurrentIndex(nextIndex);
    goToSlide(nextIndex);
    
    // Если достигли клонированного последнего элемента, перескакиваем на первый
    if (nextIndex >= totalSlides - 1) {
      setTimeout(() => {
        setCurrentIndex(1);
        goToSlide(1, false);
      }, 300);
    }
  };

  const handleBannerClick = (e: React.MouseEvent) => {
    // Предотвращаем переход на следующий слайд если кликнули на кнопку
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    nextSlide();
  };

  // Инициализация позиции
  useEffect(() => {
    if (sales.length > 1) {
      setCurrentIndex(1); // Начинаем с первого реального элемента
      goToSlide(1, false);
    }
  }, [sales.length]);

  // Получаем индекс для индикаторов (без клонированных элементов)
  const getIndicatorIndex = () => {
    if (sales.length <= 1) return 0;
    return currentIndex - 1 >= sales.length ? 0 : Math.max(0, currentIndex - 1);
  };

  return (
    <div className={styles.bannersSwiper}>
      <div
        ref={trackRef}
        className={styles.bannersTrack}
        style={{
          transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none',
        }}
      >
        {cyclicSales.map((sale, index) => (
          <div key={`${sale._id}-${index}`} className={styles.bannerSlide} onClick={handleBannerClick}>
            <Banner
              background={
                sale?.file?.url ? (
                  <img
                    alt="Sale banner"
                    src={`${domen}${sale.file.url}`}
                    style={{
                      display: 'block',
                      height: 'auto',
                      objectFit: 'cover',
                      width: '100%',
                      objectPosition: 'center'
                    }}
                  />
                ) : (
                  <img
                    alt="Default banner"
                    src="https://www.nasa.gov/wp-content/uploads/2023/10/streams.jpg?resize=1536,864"
                    style={{ width: '150%' }}
                  />
                )
              }
              // onClick={() => navigate('/sale-page', { state: { saleId: sale._id } })}
              header={(sale?.[`title_${language}` as keyof Sale] as string) }
              subheader={(sale?.[`subtitle_${language}` as keyof Sale] as String)}
              type="inline"
            >
              
                <Button mode="white" size="l"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/sale-page', { state: { saleId: sale._id } });
                }}
                >
                  {(sale?.[`buttonText_${language}` as keyof Sale] as string) }
                </Button>
              
            </Banner>
          </div>
        ))}
      </div>
      
      {/* Индикаторы только если больше одного элемента */}
      {sales.length > 1 && (
        <div className={styles.bannersIndicators}>
          {sales.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicator} ${
                index === getIndicatorIndex() ? styles.active : ''
              }`}
              onClick={() => {
                const targetIndex = index + 1; // +1 из-за клонированного элемента в начале
                setCurrentIndex(targetIndex);
                goToSlide(targetIndex);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};