import {SpecialLink} from "./SpecialLink";
import Logo from "../../public/react.svg"

function Navbar() {
    return (
        <nav className="relative top-0 left-0 w-full z-2 bg-gray-700 h-[3rem] flex items-center justify-between px-8 shadow-md">
            <div className="flex items-center gap-2 text-white">
                <SpecialLink to="/landing">
                    <img src={Logo} alt="Logo"/>
                </SpecialLink>
                {'Interactive Map'}
            </div>

            <div className="flex flex-row items-center gap-2 text-white text-lg">

                <span className="select-none">|</span>
                <SpecialLink
                    to="/testimonies"
                    className="text-white hover:underline text-base px-2"
                    title={`Go to the testimonies page`}
                >
                    {`Testimonies`}
                </SpecialLink>

                <span className="select-none">|</span>

                <SpecialLink
                    to="/directory"
                    className="text-white hover:underline text-base px-2 "
                    title={`Go to the directory page`}
                >
                    {`Directory`}
                </SpecialLink>

                <span className="select-none">|</span>

                <SpecialLink
                    to= "https://www.postbellum.cz/international/"
                    className="text-white hover:underline text-base px-2 whitespace-nowrap"
                    title={`Go to Post Bellum's page`}
                >
                    {`Post Bellum`}
                </SpecialLink>

            </div>
        </nav>
    )
}

export default Navbar