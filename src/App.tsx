import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DefaultLayout } from './layouts/DefaultLayout';
import { Employees } from './pages/Employees';
import { RealEstateMap } from './pages/RealEstateMap';
import './index.css';
import { Properties } from './pages/Properties';
import {Reports} from "./pages/Reports.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route element={<DefaultLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/maps" element={<RealEstateMap />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tasks" element={<h2>Aqui vai o Kanban</h2>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;