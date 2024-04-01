// ws.js
export const getBaseUrl = () => {
    let url;
    switch(process.env.NODE_ENV) {
      case 'production':
        url = 'wss://r2dbc-h2-demo.fly.dev/ws-products';
        break;
      case 'development':
      default:
        url = 'ws://127.0.0.1:8080/ws-products';
    }
  
    return url;
  }