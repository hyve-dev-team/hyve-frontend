import { Link } from "react-router-dom";
import houseIcon from "../../assets/svg/onboarding/house-icon.svg";
import userSearchIcon from "../../assets/svg/onboarding/user-icon.svg";

const WhichUser = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl">
        {/* Heading */}
        <h4 className="text-center font-montserrat font-semibold text-xl sm:text-2xl text-gray-800">
          Which are you?
        </h4>

        {/* Options */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-24">
          
          {/* Landlord */}
          <div className="flex flex-col items-center">
            <Link
              to="/auth/signin/landlord"
              className="group flex items-center justify-center
                         w-28 h-28 sm:w-36 sm:h-36
                         rounded-full border-2 border-[#FF630080]
                         bg-white shadow-md
                         transition-all duration-300
                         hover:scale-105 hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={houseIcon}
                alt="Landlord"
                className="w-10 sm:w-14 object-contain"
              />
            </Link>

            <p className="mt-4 text-primary font-medium font-montserrat text-sm sm:text-base">
              Landlord
            </p>
          </div>

          {/* Student */}
          <div className="flex flex-col items-center">
            <Link
              to="/auth/signin/user"
              className="group flex items-center justify-center
                         w-28 h-28 sm:w-36 sm:h-36
                         rounded-full border-2 border-[#FF630080]
                         bg-white shadow-md
                         transition-all duration-300
                         hover:scale-105 hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={userSearchIcon}
                alt="Student"
                className="w-10 sm:w-14 object-contain"
              />
            </Link>

            <p className="mt-4 text-primary font-medium font-montserrat text-sm sm:text-base">
              Student
            </p>
          </div>

        </div>
      </div>
    </main>
  );
};

export default WhichUser;
