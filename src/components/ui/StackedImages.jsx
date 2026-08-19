import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';

/* stack images */
import stackImage1 from "../../assets/images/stackedImages/stack-image-1.png"
import stackImage2 from "../../assets/images/stackedImages/stack-image-2.png"
import stackImage3 from "../../assets/images/stackedImages/stack-image-3.png"

/* swiper styles and effect cards configuration */
import 'swiper/css';
import 'swiper/css/effect-cards';

function StackedImages() {
    return (
        <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="w-[90%] sm:w-[23rem] md:w-[18rem] lg:w-[24rem] h-full"
        >
            <SwiperSlide className='rounded-[18px] overflow-hidden'>
                <img
                    src={stackImage1}
                    alt="hero-image"
                    className="object-cover w-full h-full"
                />
            </SwiperSlide>

            <SwiperSlide className='rounded-[18px] overflow-hidden'>
                <img
                    src={stackImage2}
                    alt="hero-image"
                    className="object-cover w-full h-full"
                />
            </SwiperSlide>

            <SwiperSlide className='rounded-[18px] overflow-hidden'>
                <img
                    src={stackImage3}
                    alt="hero-image"
                    className="object-cover w-full h-full"
                />
            </SwiperSlide>
        </Swiper>
    );
}

export default StackedImages;