document.getElementById('farmerRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        idNumber: document.getElementById('idNumber').value,
        location: document.getElementById('location').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await axios.post('/api/farmer/register', formData);
        alert('注册成功！');
        window.location.href = 'farmer-login.html';
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
        } else {
            alert('注册失败，请重试。');
        }
    }
});