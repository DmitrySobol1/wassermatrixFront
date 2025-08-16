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
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

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
    const actualNextIndex = nextIndex >= totalSlides - 1 ? 1 : nextIndex + 1;
    
    setCurrentIndex(actualNextIndex);
    goToSlide(actualNextIndex);
    
    // Если достигли клонированного последнего элемента, перескакиваем на первый
    if (nextIndex >= totalSlides - 1) {
      setTimeout(() => {
        setCurrentIndex(1);
        goToSlide(1, false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (sales.length <= 1) return;
    
    const prevIndex = currentIndex - 1;
    const actualPrevIndex = prevIndex <= 0 ? totalSlides - 2 : prevIndex - 1;
    
    setCurrentIndex(actualPrevIndex + 1);
    goToSlide(actualPrevIndex + 1);
    
    // Если достигли клонированного первого элемента, перескакиваем на последний
    if (prevIndex <= 0) {
      setTimeout(() => {
        setCurrentIndex(totalSlides - 2);
        goToSlide(totalSlides - 2, false);
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sales.length <= 1) return;
    
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || sales.length <= 1) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Добавляем сопротивление при свайпе
    if (trackRef.current && Math.abs(diff) > 10) {
      const currentTranslateX = -currentIndex * 100;
      const dragOffset = (diff / window.innerWidth) * 100;
      trackRef.current.style.transform = `translateX(${currentTranslateX + dragOffset}%)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || sales.length <= 1) return;
    
    const diff = currentXRef.current - startXRef.current;
    const threshold = 50; // Минимальное расстояние для свайпа
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      // Возвращаем к текущему слайду
      goToSlide(currentIndex);
    }
    
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sales.length <= 1) return;
    
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || sales.length <= 1) return;
    
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    
    if (trackRef.current && Math.abs(diff) > 10) {
      const currentTranslateX = -currentIndex * 100;
      const dragOffset = (diff / window.innerWidth) * 100;
      trackRef.current.style.transform = `translateX(${currentTranslateX + dragOffset}%)`;
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current || sales.length <= 1) return;
    
    const diff = currentXRef.current - startXRef.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      goToSlide(currentIndex);
    }
    
    isDraggingRef.current = false;
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cyclicSales.map((sale, index) => (
          <div key={`${sale._id}-${index}`} className={styles.bannerSlide}>
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
              onClick={() => navigate('/sale-page', { state: { saleId: sale._id } })}
              header={(sale?.[`title_${language}` as keyof Sale] as string) }
              subheader={(sale?.[`subtitle_${language}` as keyof Sale] as String)}
              type="inline"
            >
              
                <Button mode="white" size="m">
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