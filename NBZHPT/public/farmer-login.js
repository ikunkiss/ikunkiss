document.getElementById('farmerLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('/api/farmer/login', { username, password });
        localStorage.setItem('user', JSON.stringify(response.data));
        window.location.href = 'farmer-dashboard.html';
    } catch (error) {
        alert('登录失败。请检查您的凭据。');
    }
});