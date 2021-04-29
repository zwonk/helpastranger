import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App.jsx';
import store from './reducers/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

ReactDOM.render(
  
    <Provider store={store}>
  <GoogleReCaptchaProvider
    useRecaptchaNet
    reCaptchaKey={process.env.REACT_APP_RECAPTCHA_KEY}
    scriptProps={{ async: true, defer: true, appendTo: 'body' }}
  >
      <App />
      </GoogleReCaptchaProvider>
    </Provider>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
