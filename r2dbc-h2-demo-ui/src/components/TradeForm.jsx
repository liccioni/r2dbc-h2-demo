import React, { useEffect, useState } from 'react'

export default function TradeForm({trade}) {
    const [selectedTrade,setSelectedTrade] = useState(null);
    useEffect(()=>{        
        setSelectedTrade(trade)
        console.log(trade);
    },[selectedTrade])
  return (
    <>
    {selectedTrade && <div>{JSON.stringify(selectedTrade)}</div>}
    {!selectedTrade && <div>Select Something!!</div>}
    </>
  )
}
