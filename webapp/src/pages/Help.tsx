import HelpContent from "./HelpContent";
import { useNavigate } from "react-router-dom";
import '../pages-styles/Help.css';

const Help = () => {
    const navigate = useNavigate()

    return (
        <div className="help-page">
            <div className="help-container">
                <HelpContent />
                <button className="help-back-btn" onClick={() => navigate('/dashboard')}>
                    Volver al Dashboard
                </button>
            </div>
        </div>
    )
}

export default Help