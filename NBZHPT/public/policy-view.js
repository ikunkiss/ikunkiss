const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'farmer-login.html';
}

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

async function fetchPolicyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const policyId = urlParams.get('id');

    if (!policyId) {
        document.getElementById('policyDetails').innerHTML = '未找到保单ID';
        return;
    }

    try {
        const response = await axios.get(`/api/policy/${policyId}`);
        const policy = response.data;
        const policyDetailsHtml = `
            <p>保单号：${policy.id}</p>
            <p>产品名称：${policy.productName}</p>
            <p>投保人：${policy.farmerName}</p>
            <p>投保面积：${policy.verified_area}亩</p>
            <p>保费：${policy.premium}元</p>
        `;
        document.getElementById('policyDetails').innerHTML = policyDetailsHtml;
    } catch (error) {
        console.error('获取保单详情时出错：', error);
        document.getElementById('policyDetails').innerHTML = '获取保单详情失败，请稍后重试';
    }
}

fetchPolicyDetails();

