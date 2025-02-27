document.getElementById('companyRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        companyName: document.getElementById('companyName').value,
        creditCode: document.getElementById('creditCode').value,
        contact: document.getElementById('contact').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await axios.post('/api/company/register', formData);
        alert('注册成功！');
        window.location.href = 'company-login.html';
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
        } else {
            alert('注册失败，请重试。');
        }
    }
});
