import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundColor: '#fbfbfb', borderTop: '1px solid #ebebeb', paddingTop: '50px', color: '#555' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '40px' }}>
          
          {/* Cột 1: Thông tin công ty / Giới thiệu */}
          <div className="footer-col" style={{gridColumn: 'span 1'}}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '20px', textTransform: 'uppercase' }}>Công ty</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5', fontSize: '13px' }}>
              <li><Link to="/about" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Giới thiệu</Link></li>
              <li><Link to="/help" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Trung tâm Trợ giúp</Link></li>
              <li><Link to="/rules" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Quy chế</Link></li>
              <li><Link to="/terms" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Bảo mật thông tin</Link></li>
              <li><Link to="/dispute" style={{ color: '#555', textDecoration: 'none', transition: '0.2s' }}>Giải quyết khiếu nại</Link></li>
            </ul>
          </div>

          {/* Cột 2: Hợp tác kinh doanh */}
          <div className="footer-col" style={{gridColumn: 'span 1'}}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '20px', textTransform: 'uppercase' }}>Hợp tác & Đối tác</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5', fontSize: '13px' }}>
              <li><Link to="/merchant" style={{ color: '#555', textDecoration: 'none' }}>Đăng ký nhà hàng/quán ăn</Link></li>
              <li><Link to="/merchant-login" style={{ color: '#555', textDecoration: 'none' }}>Đăng nhập nhà hàng</Link></li>
              <li><Link to="/driver" style={{ color: '#555', textDecoration: 'none' }}>Đăng ký tài xế / Shipper</Link></li>
              <li><Link to="/driver-portal" style={{ color: '#555', textDecoration: 'none' }}>Cổng thông tin Shipper</Link></li>
            </ul>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', margin: '20px 0 15px', textTransform: 'uppercase' }}>Kết nối với ShopeeFood</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#fff', background: '#3b5998', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}>f</a>
              <a href="#" style={{ color: '#fff', background: '#e1306c', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}>ig</a>
              <a href="#" style={{ color: '#fff', background: '#1da1f2', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}>tw</a>
            </div>
          </div>

          {/* Cột 3: Liên kết & Mạng xã hội */}
          <div className="footer-col" style={{gridColumn: 'span 1'}}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '15px', textTransform: 'uppercase' }}>Tải ứng dụng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', background: '#000', color: '#fff', padding: '6px 15px', borderRadius: '6px', textDecoration: 'none', width: '135px', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍏</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '9px', lineHeight: '1' }}>Download on the</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '1', marginTop: '2px' }}>App Store</span>
                </span>
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', background: '#000', color: '#fff', padding: '6px 15px', borderRadius: '6px', textDecoration: 'none', width: '135px', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>▶️</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '9px', lineHeight: '1' }}>GET IT ON</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: '1', marginTop: '2px' }}>Google Play</span>
                </span>
              </a>
            </div>
          </div>

          {/* Cột 4: Thông tin công ty */}
          <div className="footer-col" style={{gridColumn: 'span 1'}}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="icon" style={{width: 30, height: 30, marginRight: 8, filter: 'sepia(1) saturate(10) hue-rotate(-15deg)'}} />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                Shopee<span style={{ color: 'var(--text-main)' }}>GRAB</span>
              </span>
            </Link>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#777' }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontWeight: 'bold' }}>Công ty Cổ phần Food Marketplace Việt Nam</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Địa chỉ:</strong> Lầu G, Tòa nhà Sonatus, 15 Lê Thánh Tôn, Bến Nghé, Quận 1, TPHCM</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Điện thoại:</strong> 1900 1234</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> support@shopeefood.vn</p>
              <p style={{ margin: '0 0 8px 0' }}>Giấy CN ĐKDN số: 0123456789 do Sở KHĐT TPHCM cấp ngày 11/11/2026.</p>
            </div>
          </div>
          
        </div>
      </div>
      
      <div style={{ backgroundColor: '#f1f1f1', padding: '15px 0', borderTop: '1px solid #ebebeb' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>
          <p style={{ margin: 0 }}>© 2026 ShopeeFood. Bản quyền thuộc về Công ty Cổ phần Food Marketplace Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
