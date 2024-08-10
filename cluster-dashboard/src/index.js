import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.js is running');

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root element:', document.getElementById('root'));

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);


console.log('Render called');
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import './index.css';
// import App from './App';
//
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//     <React.StrictMode>
//         <BrowserRouter>
//             <App />
//         </BrowserRouter>
//     </React.StrictMode>
// );