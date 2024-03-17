import { Local } from '@service/storage';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = observer(() => {
    const navigate = useNavigate();
    
    useEffect(()=> {
        const token = Local.get('_token');
        if(!token) {
            navigate('/login');
        }
    }, []);
    
    return (
        <div></div>
    );
})
export default Home;