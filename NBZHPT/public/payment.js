document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'farmer-login.html';
        return;
    }
    
    loadUnpaidPolicies();
    
    // 获取未支付保单列表
    async function loadUnpaidPolicies() {
        try {
            const response = await axios.get(`/api/farmer/unpaid-policies/${user.id}`);
            const policies = response.data;
            const policyList = document.getElementById('policyList');
            policyList.innerHTML = '';
            
            policies.forEach(policy => {
                const li = document.createElement('li');
                li.innerHTML = `
                    保单号：${policy.id} | 产品：${policy.productName} | 
                    金额：${policy.premium}元 
                    <button onclick="handlePayment(${policy.id})">支付</button>
                `;
                policyList.appendChild(li);
            });
        } catch (error) {
            console.error('加载未支付保单失败:', error);
            alert('加载未支付保单失败，请稍后重试');
        }
    }
});

async function handlePayment(policyId) {
    try {
        console.log('开始处理支付，保单ID:', policyId);
        
        const response = await axios.post('/api/farmer/pay-policy', { 
            policyId: policyId
        });
        
        console.log('收到支付响应:', response.data);
        
        if (response.data.success) {
            alert('支付成功！');
            // 直接跳转回农户仪表板
            window.location.href = 'farmer-dashboard.html';
        } else {
            throw new Error(response.data.message || '支付失败');
        }
    } catch (error) {
        console.error('支付失败，详细错误:', error);
        const errorMessage = error.response?.data?.message 
            || error.message 
            || '支付失败，请稍后重试';
        alert(errorMessage);
    }
}

