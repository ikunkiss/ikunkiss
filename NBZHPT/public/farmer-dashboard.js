const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'farmer-login.html';
}

document.getElementById('farmerName').textContent = user.name;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

async function fetchInsuranceProducts() {
    try {
        const response = await axios.get('/api/insurance-products');
        const productsList = document.getElementById('insuranceProducts');
        productsList.innerHTML = '';
        response.data.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${product.crop} - ${product.premium}/亩`;
            const applyButton = document.createElement('button');
            applyButton.textContent = '申请';
            applyButton.onclick = () => applyForInsurance(product.id);
            li.appendChild(applyButton);
            productsList.appendChild(li);
        });
    } catch (error) {
        console.error('获取保险产品时出错：', error);
    }
}

async function fetchApplications() {
    try {
        const response = await axios.get(`/api/farmer/applications/${user.id}`);
        const applicationsList = document.getElementById('applications');
        applicationsList.innerHTML = '';
        response.data.forEach(app => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${app.productName} - 面积：${app.area}亩 - 状态：${app.status}
                <a href="application-view.html?id=${app.id}">查看详情</a>
            `;
            applicationsList.appendChild(li);
        });
    } catch (error) {
        console.error('获取申请时出错：', error);
    }
}

async function fetchPolicies() {
    try {
        const response = await axios.get(`/api/farmer/policies/${user.id}`);
        const policiesList = document.getElementById('policies');
        policiesList.innerHTML = '';
        response.data.forEach(policy => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${policy.productName} - 面积：${policy.verified_area}亩 - 状态：${policy.status === 'paid' ? '已支付' : '未支付'}
                <a href="policy-view.html?id=${policy.id}">查看详情</a>
            `;
            policiesList.appendChild(li);
        });
    } catch (error) {
        console.error('获取保单时出错：', error);
    }
}

async function applyForInsurance(productId) {
    const area = prompt('请输入要投保的面积（亩）：');
    const contact = prompt('请输入您的联系方式：');
    const contactPerson = prompt('请输入联系人姓名：');

    try {
        await axios.post('/api/farmer/apply', {
            farmerId: user.id,
            productId,
            area,
            contact,
            contactPerson
        });
        alert('申请提交成功！');
        fetchApplications();
    } catch (error) {
        alert('提交申请失败。请重试。');
    }
}

// 监听来自支付页面的消息
window.addEventListener('message', (event) => {
    if (event.data.type === 'PAYMENT_SUCCESS') {
        fetchPolicies();
    }
});

fetchInsuranceProducts();
fetchApplications();
fetchPolicies();

// 定期刷新数据
setInterval(() => {
    fetchApplications();
    fetchPolicies();
}, 30000); // 每30秒刷新一次

function openPaymentPage() {
    // 直接跳转到支付页面
    window.location.href = 'payment.html';
}

