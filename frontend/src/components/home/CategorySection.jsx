import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: 'Khai vị', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500&auto=format&fit=crop' },
  { id: 2, name: 'Món chính', image: 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=500&auto=format&fit=crop' },
  { id: 3, name: 'Canh & Súp', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop' },
  { id: 4, name: 'Tráng miệng', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop' },
  { id: 5, name: 'Đồ uống', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop' },
];

const CategorySection = () => {
  return (
    <section className="section bg-light">
      <div className="container">
        <div className="text-center">
          <span className="sub-title">Khám phá</span>
          <h2 className="section-title">Danh mục nổi bật</h2>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-item">
              <Link to={`/menu?category=${cat.id}`} className="category-link">
                <div className="category-img-wrap">
                  <img src={cat.image} alt={cat.name} className="category-img" />
                </div>
                <h3 className="category-name">{cat.name}</h3>
                <span className="category-action">Xem thêm &rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
