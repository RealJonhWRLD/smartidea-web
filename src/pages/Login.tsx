import { useState } from 'react';
import api from '../services/api';
import type { AuthResponse } from '../types/AuthTypes';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post<AuthResponse>('/auth/authenticate', {
                username,
                password
            });

            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError('Erro ao logar. Verifique usuário e senha.');
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h2>Login RP</h2>
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">ENTRAR</button>
                {error && <span style={{color: 'red'}}>{error}</span>}
            </form>
        </div>
    );
}