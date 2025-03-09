// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Login attempt:', { username, password }); // Debug
        const response = await fetch('http://localhost/LifeHub/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });
        console.log('Response status:', response.status); // Debug
        const data = await response.json();
        console.log('Response data:', data); // Debug

        if (response.ok) {
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('error').textContent = data.error || 'Login failed';
        }
    });
}

// Signup Form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Signup attempt:', { username, email, password }); // Debug
        const response = await fetch('http://localhost/LifeHub/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signup', username, email, password })
        });
        console.log('Response status:', response.status); // Debug
        const data = await response.json();
        console.log('Response data:', data); // Debug

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('error').textContent = data.error || 'Signup failed';
        }
    });
}

// Dashboard Check + Logout
if (document.getElementById('status')) {
    fetch('http://localhost/LifeHub/api/auth?check=1')
        .then(response => response.json())
        .then(data => {
            console.log('Session check:', data); // Debug
            if (!data.logged_in) {
                window.location.href = 'login.html';
            } else {
                document.getElementById('status').textContent = 'This is your dashboard!';
            }
        });

    document.getElementById('logout').addEventListener('click', () => {
        fetch('http://localhost/LifeHub/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        }).then(() => {
            window.location.href = 'login.html';
        });
    });
}