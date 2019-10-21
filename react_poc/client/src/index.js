// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css'
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css'
// import Counter from "./components/counter";
import LandingPage from "./containers/LandingPage/index"

ReactDOM.render(<LandingPage />, document.getElementById('root'));
registerServiceWorker();