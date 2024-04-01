import React, { useEffect, useState } from 'react'

export default function MyWebSocket() {    
    const URL_WEB_SOCKET = 'ws://127.0.0.1:8080/ws-products';
    const [ws, setWs] = useState(null);
    const [trades, setTrades] = useState([]);
    const request = {
        offset:0,
        limit:10
      };
    useEffect(() => {        
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        wsClient.onopen = () => {
          setWs(wsClient);
          wsClient.send(JSON.stringify(request));
        };
        wsClient.onclose = () => console.log('ws closed');
        return () => {
          wsClient.close();
        };
      }, []);

      useEffect(() => {
        if (ws) {
          ws.onmessage = async (evt) => {            
            const data = await evt.data.text();                
            const trade = JSON.parse(data);
            const newTrades = [...trades];
            console.log(trade);
          };
        }
      }, [ws, trades]);
  return (
    <div>MyWebSocket</div>
  )
}
