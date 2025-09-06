document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    throw new Error('Credenciais inválidas');
                }
                
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                window.location.href = 'home.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        });
    }
    
    // Check authentication on map page
    if (window.location.pathname.includes('b.html')) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
        }
    }

    // Registro de usuário
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validação de senha
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem');
                return;
            }
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: password
            };
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro no registro');
                }
                
                const data = await response.json();
                alert('Registro realizado com sucesso!');
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error('Erro no registro:', error);
                alert(error.message);
            }
        });
    }
});