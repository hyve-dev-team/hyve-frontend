import Navbar from "./Navbar"

const MainLayout = ({ children }) => {
    return (
        <>
            {/* Navbar component */}
            <Navbar />

            {/* body content  */}
            {/* <div className="w-full mt-20 desktop-lg:max-w-[60%] desktop-xl:max-w-[50%] desktop-lg:bg-red-200 mx-auto"> */}
            <div className="w-full mt-20 ">
                {children}
            </div>
        </>
    )
}

export default MainLayout