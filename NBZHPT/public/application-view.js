document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');

    if (!applicationId) {
        document.getElementById('applicationDetails').innerHTML = '<p>未找到投保意向单信息</p>';
        return;
    }

    fetchApplicationDetails(applicationId);

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

async function fetchApplicationDetails(applicationId) {
    try {
        const response = await axios.get(`/api/application/${applicationId}`);
        const application = response.data;
        displayApplicationDetails(application);
    } catch (error) {
        console.error('获取投保意向单详情时出错：', error);
        document.getElementById('applicationDetails').innerHTML = '<p>获取投保意向单信息失败，请稍后再试</p>';
    }
}

function displayApplicationDetails(application) {
    const applicationDetailsHtml = `
        <h3>投保意向单号：${application.id}</h3>
        <p>投保人：${application.farmerName}</p>
        <p>保险产品：${application.productName}</p>
        <p>申请面积：${application.area} 亩</p>
        <p>联系人：${application.contact_person}</p>
        <p>联系方式：${application.contact}</p>
        <p>状态：${application.status}</p>
        <p>创建时间：${new Date(application.created_at).toLocaleString()}</p>
    `;
    document.getElementById('applicationDetails').innerHTML = applicationDetailsHtml;
}