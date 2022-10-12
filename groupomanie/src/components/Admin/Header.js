import React from 'react';
import { useNavigate } from 'react-router-dom'
import { accountService } from '../../_services/account.service'

const Header = () => {
    let navigate = useNavigate()

    const logout = () => {
        accountService.logout()
        navigate('/home')
    }

    return (
        <div className='AHeader'>
            <button onClick={logout}>Se déconnecter</button>
        </div>
    );
};

export default Header;