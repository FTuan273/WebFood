import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
          <div className="hero-text text-center">
          <span className="hero-subtitle">Chào mừng đến với</span>
          <h1 className="hero-title">Dola Restaurant</h1>
          <p className="hero-desc">
            Trải nghiệm ẩm thực tinh hoa với các món ăn được chế biến từ nguyên liệu tươi ngon nhất, mang đậm hương vị truyền thống và hiện đại.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary btn-large">Đặt Món Ngay</Link>
            <Link to="/about" className="btn btn-outline btn-large" style={{ color: 'white', borderColor: 'white', marginLeft: '15px' }}>Xem Thực Đơn</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
