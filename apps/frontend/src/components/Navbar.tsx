import {SpecialLink} from "./SpecialLink";
import Logo from "../../public/postbellum.png"

function Navbar() {
    return (
        <nav className="relative top-0 left-0 w-full z-2 bg-gray-700 h-[3rem] flex items-center justify-between px-8 shadow-md">
            <div className="flex items-center gap-2 text-white">
                <SpecialLink to="/landing">
                    <img src={Logo} alt="Logo" className="h-6 w-auto"/>
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

                <a
                    href="https://www.postbellum.cz/international/"
                    className="text-white hover:underline text-base px-2"
                    title="Go to Post Bellum's page"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Post Bellum
                </a>

            </div>
        </nav>
    )
}

export default Navbar