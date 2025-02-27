const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host:'localhost',
  user: 'root',
  password:'123456',
  database:'agricultural_insurance'
};

// 农户登录
app.post('/api/farmer/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM farmers WHERE username = ?', [username]);
    await connection.end();

    if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
      res.json({ id: rows[0].id, name: rows[0].name });
    } else {
      res.status(401).json({ message: '无效的凭证' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 保险公司登录
app.post('/api/company/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM insurance_companies WHERE username = ?', [username]);
    await connection.end();

    if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
      res.json({ id: rows[0].id, companyName: rows[0].company_name });
    } else {
      res.status(401).json({ message: '无效的凭证' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 农户注册
app.post('/api/farmer/register', async (req, res) => {
  const { name, idNumber, location, username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [existingUsers] = await connection.execute('SELECT * FROM farmers WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO farmers (name, id_number, location, username, password) VALUES (?, ?, ?, ?, ?)',
      [name, idNumber, location, username, hashedPassword]
    );

    await connection.end();
    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 保险公司注册
app.post('/api/company/register', async (req, res) => {
  const { companyName, creditCode, contact, phone, location, username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [existingUsers] = await connection.execute('SELECT * FROM insurance_companies WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO insurance_companies (company_name, credit_code, contact, phone, location, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [companyName, creditCode, contact, phone, location, username, hashedPassword]
    );

    await connection.end();
    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取保险产品
app.get('/api/insurance-products', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM insurance_products WHERE visible = true');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 农户申请保险
app.post('/api/farmer/apply', async (req, res) => {
  const { farmerId, productId, area, contact, contactPerson } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO insurance_applications (farmer_id, product_id, area, contact, contact_person, status) VALUES (?, ?, ?, ?, ?, "未验证")',
      [farmerId, productId, area, contact, contactPerson]
    );
    await connection.end();
    res.json({ message: '申请提交成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取农户的申请
app.get('/api/farmer/applications/:farmerId', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT a.*, p.name as productName FROM insurance_applications a JOIN insurance_products p ON a.product_id = p.id WHERE a.farmer_id = ?',
      [farmerId]
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取保险公司的产品
app.get('/api/company/products/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM insurance_products WHERE company_id = ?', [companyId]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加新的保险产品
app.post('/api/company/add-product', async (req, res) => {
  const { companyId, productCode, name, targetArea, crop, validityPeriod, stock, premium, visible } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO insurance_products (company_id, product_code, name, target_area, crop, validity_period, stock, premium, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, productCode, name, targetArea, crop, validityPeriod, stock, premium, visible]
    );
    await connection.end();
    res.json({ message: '产品添加成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取保险公司的申请
app.get('/api/company/applications/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT a.*, f.name as farmerName, p.name as productName FROM insurance_applications a JOIN farmers f ON a.farmer_id = f.id JOIN insurance_products p ON a.product_id = p.id WHERE p.company_id = ? AND a.status = "未验证"',
      [companyId]
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 验证申请
app.post('/api/company/verify-application', async (req, res) => {
  const { applicationId, verifiedArea } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [appRows] = await connection.execute('SELECT * FROM insurance_applications WHERE id = ?', [applicationId]);
    const application = appRows[0];

    const [productRows] = await connection.execute('SELECT * FROM insurance_products WHERE id = ?', [application.product_id]);
    const product = productRows[0];

    let premium = product.premium * verifiedArea;
    if (verifiedArea > 500) {
      premium *= 0.8;
    } else if (verifiedArea > 100) {
      premium *= 0.9;
    }

    await connection.execute(
      'INSERT INTO insurance_policies (application_id, verified_area, premium, status) VALUES (?, ?, ?, "unpaid")',
      [applicationId, verifiedArea, premium]
    );

    await connection.execute('UPDATE insurance_applications SET status = "验证通过" WHERE id = ?', [applicationId]);

    await connection.end();
    res.json({ message: '申请验证成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个保单详情
app.get('/api/policy/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT p.*, f.name as farmerName, ip.name as productName
      FROM insurance_policies p
      JOIN insurance_applications ia ON p.application_id = ia.id
      JOIN farmers f ON ia.farmer_id = f.id
      JOIN insurance_products ip ON ia.product_id = ip.id
      WHERE p.id = ?
    `, [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到保单' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个投保意向单详情
app.get('/api/application/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT a.*, f.name as farmerName, ip.name as productName
      FROM insurance_applications a
      JOIN farmers f ON a.farmer_id = f.id
      JOIN insurance_products ip ON a.product_id = ip.id
      WHERE a.id = ?
    `, [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到投保意向单' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取农户的所有保单
app.get('/api/farmer/policies/:farmerId', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT p.*, ip.name as productName
      FROM insurance_policies p
      JOIN insurance_applications ia ON p.application_id = ia.id
      JOIN insurance_products ip ON ia.product_id = ip.id
      WHERE ia.farmer_id = ?
      ORDER BY p.id DESC
    `, [farmerId]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取保险公司的所有保单
app.get('/api/company/policies/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT p.*, f.name as farmerName, ip.name as productName
      FROM insurance_policies p
      JOIN insurance_applications ia ON p.application_id = ia.id
      JOIN farmers f ON ia.farmer_id = f.id
      JOIN insurance_products ip ON ia.product_id = ip.id
      WHERE ip.company_id = ?
    `, [companyId]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取农户的未支付保单
app.get('/api/farmer/unpaid-policies/:farmerId', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT p.*, ip.name as productName, ip.premium as premiumPerMu
      FROM insurance_policies p
      JOIN insurance_applications ia ON p.application_id = ia.id
      JOIN insurance_products ip ON ia.product_id = ip.id
      WHERE ia.farmer_id = ? AND p.status = 'unpaid'
    `, [farmerId]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 处理缴费
app.post('/api/farmer/pay-policy', async (req, res) => {
    const { policyId } = req.body;
    let connection;
    
    try {
        console.log('开始处理支付请求:', { policyId });
        
        connection = await mysql.createConnection(dbConfig);
        
        // 首先检查保单是否存在且未支付
        const [checkPolicy] = await connection.execute(
            'SELECT id, status FROM insurance_policies WHERE id = ?',
            [policyId]
        );
        
        console.log('查询保单结果:', checkPolicy);

        if (checkPolicy.length === 0) {
            console.log('未找到保单:', policyId);
            return res.status(404).json({ 
                success: false, 
                message: '未找到该保单' 
            });
        }

        if (checkPolicy[0].status === 'paid') {
            console.log('保单已支付:', policyId);
            return res.status(400).json({ 
                success: false, 
                message: '该保单已支付' 
            });
        }

        await connection.beginTransaction();
        console.log('开始事务');
        
        try {
            // 更新保单状态为已支付，移除 payment_date 字段
            const [updateResult] = await connection.execute(
                'UPDATE insurance_policies SET status = ? WHERE id = ?',
                ['paid', policyId]
            );
            
            console.log('更新结果:', updateResult);

            await connection.commit();
            console.log('事务提交成功');
            
            res.json({ 
                success: true, 
                message: '支付成功', 
                policyId: policyId 
            });
        } catch (error) {
            console.error('更新保单状态失败:', error);
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('支付处理失败，详细错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '支付处理失败: ' + (error.message || '未知错误')
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('数据库连接已关闭');
            } catch (err) {
                console.error('关闭数据库连接失败:', err);
            }
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

