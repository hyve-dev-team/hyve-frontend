import { useEffect, useState } from "react";
import Preloader from "../components/preloader/Preloader";
import HeroSection from "../components/layout/HeroSection";
import NeedNewApartment from "../components/layout/NeedNewApartment";
import NeedNewTenant from "../components/layout/NeedNewTenant";
import About from "../components/layout/About";
import HowItWorks from "../components/layout/HowItWorks";
import ContactUs from "../components/layout/ContactUs";
import FAQs from "../components/layout/FAQs";
import Footer from "../components/layout/Footer";


const Homepage = () => {
    // state to control visibility of the preloader
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);


        /* PreLoading Critical images */
        const loadImage = (src) =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => resolve();
                img.src = src;
            });

        /* Hero Images */
        const stackedImage = '../assets/images/stackedImages/stack-image-1.png';
        const stackedImage2 = '../assets/images/stackedImages/stack-image-2.png';
        const stackedImage3 = '../assets/images/stackedImages/stack-image-3.png';

        /* Illustrations */
        const vector1 = '../assets/svg/Illustration/vector-img-1.svg'
        const vector2 = '../assets/svg/Illustration/vector-img-2.svg'
        const vector3 = '../assets/svg/Illustration/vector-img-3.svg'
        const vector4 = '../assets/svg/Illustration/vector-img-4.svg'

        const waitForCritical = async () => {
            // ensure all fonts are loaded
            const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

            await Promise.all([
                fonts,
                loadImage(stackedImage),
                loadImage(stackedImage2),
                loadImage(stackedImage3),

                loadImage(vector1),
                loadImage(vector2),
                loadImage(vector3),
                loadImage(vector4),
            ]);

            setTimeout(() => setIsLoading(false), 180);
        };

        waitForCritical();
    }, []);

    return (
        <>
            {/* preloader component */}
            <Preloader isLoading={isLoading} />

            <main>
                {/* hero section */}
                <HeroSection />

                {/* Need a new apartment section */}
                <NeedNewApartment />

                {/* Need new tenant section */}
                <NeedNewTenant />

                {/* Featured Lodge section */}

                {/* About us section */}
                <About />

                {/* how it works section */}
                <HowItWorks />

                {/* contact us section */}
                <ContactUs />

                {/* Faq Section */}
                <FAQs />

                {/* Footer section */}
                <Footer />
            </main>
        </>
    )
}

export default Homepage