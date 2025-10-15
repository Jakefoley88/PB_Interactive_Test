import { Routes, Route, Link } from 'react-router-dom';
import LandingPage from "./routes/LandingPage";

export const router = {
    navigate: (path: string) => {
        console.log(`Navigating to: ${path}`);
    },
};

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
            </Routes>
        </>
    );
}

export default App;
