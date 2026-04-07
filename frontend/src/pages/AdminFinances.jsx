import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { DollarSign, Percent, TrendingUp, Wallet, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminFinances = () => {
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [newRate, setNewRate] = useState('');

  const fetchFinances = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/finances')
      .then(res => {
        if (res.data.success) {
          setFinances(res.data);
          setNewRate(res.data.commissionRate);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchFinances(); }, []);

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    if (!newRate || newRate < 0 || newRate > 100) return toast.error('Mức hoa hồng phải từ 0 đến 100%');
    try {
      const res = await axios.put('http://localhost:5000/api/admin/config', { commissionRate: Number(newRate) });
      if (res.data.success) {
        toast.success(`Đã cập nhật hoa hồng thành ${newRate}%`);
        fetchFinances(); // Tải lại biểu đồ với tỷ lệ mới
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật cấu hình');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu tài chính...</div>;
  if (!finances) return <div style={{ padding: '20px' }}>Không có dữ liệu!</div>;

  const { commissionRate, overview, debts } = finances;

  // Dữ liệu cho Biểu đồ
  const chartData = [
    { name: 'Lợi Nhuận Của Nền Tảng', value: overview.totalNetProfit, color: '#2ed573' }, // Màu xanh lá
    { name: 'Phải Trả Cho Đối Tác', value: overview.totalVendorPayout, color: '#ff4757' } // Màu đỏ
  ];

  const formatCurrency = (num) => num.toLocaleString('vi-VN') + ' đ';

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Wallet size={32} color="#f39c12" /> Quản Lý Dòng Tiền & Công Nợ
      </h2>

      {/* 1. Thiết lập chung */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Percent size={20} /> Thiết Lập Chiết Khấu Toàn Sàn</h3>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Hoa hồng nền tảng thu trên mỗi đơn hàng hoàn thành thành công của đối tác.</p>
        </div>
        <form onSubmit={handleUpdateRate} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              value={newRate}
              onChange={e => setNewRate(e.target.value)}
              style={{ padding: '12px 40px 12px 15px', borderRadius: '8px', border: '2px solid #ddd', outline: 'none', fontSize: '1.2rem', width: '120px', fontWeight: 'bold', textAlign: 'right' }} 
            />
            <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#888' }}>%</span>
          </div>
          <button type="submit" style={{ padding: '0 25px', backgroundColor: '#EE4D2D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Áp Dụng Tức Thì
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
        {/* 2. Tổng quan doanh thu */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <StatBox title="TỔNG DÒNG TIỀN (DOANH THU THÔ)" amount={overview.totalGrossRevenue} icon={<TrendingUp />} bg="#f1f2f6" textColor="#2f3542" />
          <StatBox title="💰 DOANH THU RÒNG (LỢI NHUẬN SÀN CỦA BẠN)" amount={overview.totalNetProfit} icon={<DollarSign />} bg="#e3fbe3" textColor="#2ed573" />
          <StatBox title="CÔNG NỢ (TIỀN PHẢI TRẢ LẠI ĐỐI TÁC)" amount={overview.totalVendorPayout} icon={<Receipt />} bg="#ffe1e1" textColor="#ff4757" />
        </div>

        {/* 3. Biểu đồ */}
        <div style={{ width: '400px', backgroundColor: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#2f3542' }}>Tỷ Trọng Doanh Thu Sàn</h3>
          {overview.totalGrossRevenue === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', marginTop: '50px' }}>Chưa có đơn hàng nào hoàn thành</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Danh sách công nợ */}
      <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <h3 style={{ padding: '20px', margin: 0, backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>BÁO CÁO CÔNG NỢ ĐỐI TÁC TRONG KỲ</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #f1f2f6', textAlign: 'left' }}>
              <th style={thStyle}>Tên Quán Ăn</th>
              <th style={{...thStyle, textAlign: 'center'}}>Số Đơn</th>
              <th style={{...thStyle, textAlign: 'right'}}>Doanh Thu Thô</th>
              <th style={{...thStyle, textAlign: 'right', color: '#2ed573'}}>Sàn Thu (Phí)</th>
              <th style={{...thStyle, textAlign: 'right', color: '#ff4757'}}>CẦN THANH TOÁN (Pay-Out)</th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 ? <tr><td colSpan="5" style={{padding:'20px', textAlign:'center'}}>Chưa có đối tác nào bán được hàng.</td></tr> :
             debts.map(d => (
               <tr key={d.restaurantId} style={{ borderBottom: '1px solid #f1f2f6' }}>
                 <td style={tdStyle}>
                   <div style={{ fontWeight: 'bold', color: '#2f3542' }}>{d.restaurantName}</div>
                 </td>
                 <td style={{...tdStyle, textAlign: 'center'}}>{d.totalOrders}</td>
                 <td style={{...tdStyle, textAlign: 'right'}}>{formatCurrency(d.grossRevenue)}</td>
                 <td style={{...tdStyle, textAlign: 'right', fontWeight: 'bold', color: '#2ed573'}}>+{formatCurrency(d.platformFee)}</td>
                 <td style={{...tdStyle, textAlign: 'right', fontWeight: 'bold', color: '#ff4757', fontSize: '1.1rem'}}>{formatCurrency(d.netPayout)}</td>
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatBox = ({ title, amount, icon, bg, textColor }) => (
  <div style={{ backgroundColor: bg, padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7f8c8d', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: textColor }}>{amount.toLocaleString('vi-VN')} đ</div>
    </div>
    <div style={{ color: textColor, opacity: 0.8 }}>
      {React.cloneElement(icon, { size: 40 })}
    </div>
  </div>
);

const thStyle = { padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle' };

export default AdminFinances;
