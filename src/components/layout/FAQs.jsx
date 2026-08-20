import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../../utils/animationVariants";
import faqs from "../../utils/faqs"; /* import faq data */
import { PiCaretDownLight } from "react-icons/pi";


const FAQs = () => {
    const [activeFaq, setActiveFaq] = useState("")

    /* function handle faqs */
    function handleFaq(faqId) {
        // set active faq
        setActiveFaq(activeFaq === faqId ? "" : faqId)
    }

    return (
        <section className='bg-white' id="faq">
            <div className="container py-16 pb-28 sm:py-16 sm:pb-20">
                <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                    <h2 className="font-semibold text-center heading-responsive md:font-normal text-primary">FAQs</h2>

                    {/* FAQs */}
                    <div className="mt-10 sm:mt-8">
                        {
                            faqs.map((faq) => {
                                const isOpen = activeFaq === faq.id;

                                return (
                                    <div className="mt-4" key={faq.id}>
                                        {/* questions */}
                                        <div className="flex items-center justify-between gap-8 px-4 py-4 border rounded-md cursor-pointer md:py-6 md:justify-center border-black/20 md:px-0" onClick={() => handleFaq(faq.id)}>
                                            <h4 className="font-medium text-[14px] md:text-[16px]">{faq.question}</h4>

                                            {/* rotates caret arrow when  faq is opened */}
                                            <motion.span className={`text-[20px] block`}
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}>
                                                <PiCaretDownLight />
                                            </motion.span>
                                        </div>

                                        {/* answer */}
                                        <motion.div className={`overflow-hidden`}
                                            initial={false}
                                            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}>
                                            <div className={`flex items-center gap-8 border rounded-md justify-center border-black/20 mt-2 md:px-8 px-3`}>
                                                <p className="py-4 font-light leading-normal paragraph-responsive md:py-6">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )

                            })
                        }

                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default FAQs