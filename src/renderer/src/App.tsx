import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [posData, setPosData] = useState<any[]>([])

  const fetchLogs = async () => {
    const data = await (window as any).api.getPosData()
    setPosData(data)
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <h2>POS Automation Logs</h2>
      <button onClick={fetchLogs}>Refresh Manual</button>
      
      <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        {posData.length === 0 ? (
          <p>No data found. Drop a DBF file in POS_Imports!</p>
        ) : (
          <table border={1} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#333' }}>
                <th>Slip No</th>
                <th>CUS Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {posData.map((row) => (
                <tr key={row.id}>
                  <td>{row.cslipno}</td>
                  <td>{row.cusname}</td>
                  <td>{row.gross_amount}</td>
                  <td>{row.order_date}</td>
                  <td>{row.order_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App