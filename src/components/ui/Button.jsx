

/* Reuseable class component */
const Button = ({value}) => {
    return (
        <>
            <button className="px-14 py-3 font-semibold text-white uppercase rounded-full shadow-md outline-none md:py-3 md:px-10 lg:px-16 bg-primary font-poppins hover:bg-primary-hover smooth-transition text-[12px] sm:text-sm">{value}</button>
        </>

    )
}

export default Button