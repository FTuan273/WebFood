import axios from 'axios';
const instance = axios.create({ baseURL: 'http://localhost:5000/api' });
console.log(instance.getUri({ url: '/merchant/restaurant' }));
console.log(instance.getUri({ url: 'merchant/restaurant' }));
