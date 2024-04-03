// ws.js
export const getBaseUrl = () => {
    let url;
    switch(process.env.NODE_ENV) {
      case 'production':
        url = 'wss://r2dbc-h2-demo.fly.dev/ws-trades';
        break;
      case 'development':
      default:
        url = 'ws://127.0.0.1:8080/ws-trades';
    }
  
    return url;
  }

  export const getAxiosBaseUrl = () => {
    let url;
    switch(process.env.NODE_ENV) {
      case 'production':
        url = 'https://r2dbc-h2-demo.fly.dev/trades';
        break;
      case 'development':
      default:
        url = 'http://127.0.0.1:8080/trades';
    }
  
    return url;
  }