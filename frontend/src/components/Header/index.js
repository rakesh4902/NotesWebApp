import {useState,useEffect} from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './index.css'; 

const Header = ()=> {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    const handleLogout = () => {
        Cookies.remove('jwtToken');
        navigate('/login'); 
    };

    useEffect(() => {
        
        fetchUsername();
      });

    const fetchUsername = async () => {
        const jwtToken = Cookies.get('jwtToken');
        try {
          const response = await fetch('http://localhost:3000/user', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsername(data.username);
          } else {
            console.error('Failed to fetch username');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      };

    return (
        <header className="header">
            <Link to ="/" className='notes-link'><h1 className="header-title">Notes</h1></Link>
            <div className="header-right">
                <h1 className="welcome-message">Welcome {username}</h1>
                <button className="logout-button" type="button" onClick={handleLogout}>Logout</button>
            </div>
        </header>
    );
};

export default Header;