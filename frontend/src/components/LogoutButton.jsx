import { useNavigate } from 'react-router-dom'

export default function LogoutButton({ setUser }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }

    return (
        <button onClick={handleLogout} className="logout-btn">
            Logout
        </button>
    )
}