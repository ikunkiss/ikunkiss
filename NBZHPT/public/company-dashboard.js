const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'company-login.html';
}

document.getElementById('companyName').textContent = user.companyName;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

document.getElementById('addProductBtn').addEventListener('click', addProduct);

async function fetchProducts() {
    try {
        const response = await axios.get(`/api/company/products/${user.id}`);
        const productsList = document.getElementById('products');
        productsList.innerHTML = '';
        response.data.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${product.crop} - ${product.premium}/亩 - 库存：${product.stock}`;
            productsList.appendChild(li);
        });
    } catch (error) {
        console.error('获取产品时出错：', error);
    }
}

async function fetchApplications() {
    try {
        const response = await axios.get(`/api/company/applications/${user.id}`);
        const applicationsList = document.getElementById('applications');
        applicationsList.innerHTML = '';
        response.data.forEach(app => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${app.farmerName} - ${app.productName} - 面积：${app.area}亩
                <a href="application-view.html?id=${app.id}">查看详情</a>
                <button onclick="verifyApplication(${app.id})">验证</button>
            `;
            applicationsList.appendChild(li);
        });
    } catch (error) {
        console.error('获取申请时出错：', error);
    }
}

async function fetchPolicies() {
    try {
        const response = await axios.get(`/api/company/policies/${user.id}`);
        const policiesList = document.getElementById('policies');
        policiesList.innerHTML = '';
        response.data.forEach(policy => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${policy.farmerName} - ${policy.productName} - 面积：${policy.verified_area}亩 - 状态：${policy.status === 'paid' ? '已支付' : '未支付'}
                <a href="policy-view.html?id=${policy.id}">查看详情</a>
            `;
            policiesList.appendChild(li);
        });
    } catch (error) {
        console.error('获取保单时出错：', error);
    }
}

async function addProduct() {
    const productData = {
        companyId: user.id,
        productCode: prompt('请输入产品编号：'),
        name: prompt('请输入产品名称：'),
        targetArea: prompt('请输入面向地区：'),
        crop: prompt('请输入保险农作物：'),
        validityPeriod: prompt('请输入保险有效期：'),
        stock: prompt('请输入库存：'),
        premium: prompt('请输入每亩保费：'),
        visible: confirm('是否对农户可见？')
    };

    try {
        await axios.post('/api/company/add-product', productData);
        alert('产品添加成功！');
        fetchProducts();
    } catch (error) {
        alert('添加产品失败。请重试。');
    }
}

async function verifyApplication(applicationId) {
    const verifiedArea = prompt('请输入验证后的面积：');
    try {
        await axios.post('/api/company/verify-application', { applicationId, verifiedArea });
        alert('申请验证成功！');
        fetchApplications();
    } catch (error) {
        alert('验证申请失败。请重试。');
    }
}

fetchProducts();
fetchApplications();
fetchPolicies();