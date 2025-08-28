class RouterA {
  constructor(id, x, y) {
    this.id = id
    this.observers = []
    // UI position
    this.x = x
    this.y = y

    // neighbors = { router, metric }, where router are the current neighbors and metric
    this.neighbors = []
    this.routingTable = new Map() // Map<destId, { nextHop, metric }>
  }

  addNeighbor(router, metric = 1) {
    this.neighbors.push({ router, metric })
    this.routingTable.set(router.id, { nextHop: router.id, metric })
  }

  subscribe(observer) {
    this.observers.push(observer)
  }

  notify() {
    this.observers.forEach(observer => observer(this))
  }

  updateRoutingTable() {
    let updated = false
    this.neighbors.forEach(({ router }) => {
      router.routingTable.forEach((entry, destId) => {
        if (destId !== this.id) {
          const current = this.routingTable.get(destId)
          const newMetric = entry.metric + 1 // Simplified RIP metric
          if (!current || newMetric < current.metric) {
            this.routingTable.set(destId, {
              nextHop: router.id,
              metric: newMetric
            })
            updated = true
          }
        }
      })
    })
    if (updated) this.notify()
  }

  getState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      neighbors: this.neighbors,
      routingTable: Array.from(this.routingTable.entries()).map(
        ([dest, { nextHop, metric }]) => ({
          dest,
          nextHop,
          metric
        })
      )
    }
  }
}

// Controller: Manages network and RIP updates
class Network {
  constructor() {
    this.routers = []
  }

  addRouter(router) {
    this.routers.push(router)
  }

  startUpdates() {
    setInterval(() => {
      this.routers.forEach(router => router.updateRoutingTable())
    }, 3000) // Simulate RIP updates every 3 seconds
  }
}

// View: React components
function RouterNode({ routerState }) {
  return (
    <g>
      <circle cx={routerState.x} cy={routerState.y} r="20" fill="blue" />
      <text
        x={routerState.x}
        y={routerState.y + 5}
        fill="white"
        textAnchor="middle"
        fontSize="12"
      >
        {routerState.id}
      </text>
    </g>
  )
}

function ConnectionLine({ from, to, metric }) {
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="black"
        strokeWidth="2"
      />
      <text
        x={(from.x + to.x) / 2}
        y={(from.y + to.y) / 2}
        fill="red"
        fontSize="10"
      >
        {metric}
      </text>
    </g>
  )
}

function NetworkCanvas() {
  const [routersState, setRoutersState] = React.useState([])

  React.useEffect(() => {
    // Setup network
    const network = new Network()
    const r1 = new Router('R1', 150, 100)
    const r2 = new Router('R2', 300, 100)
    const r3 = new Router('R3', 225, 200)

    // Define topology (triangle)
    r1.addNeighbor(r2, 1)
    r2.addNeighbor(r1, 1)
    r2.addNeighbor(r3, 1)
    r3.addNeighbor(r2, 1)
    r1.addNeighbor(r3, 1)
    r3.addNeighbor(r1, 1)

    // Subscribe to router updates
    ;[r1, r2, r3].forEach(router => {
      router.subscribe(() => {
        setRoutersState([r1.getState(), r2.getState(), r3.getState()])
      })
      network.addRouter(router)
    })

    // Trigger initial render
    setRoutersState([r1.getState(), r2.getState(), r3.getState()])

    // Start RIP updates
    network.startUpdates()
  }, [])

  return (
    <div className="p-4 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">RIP Visualization</h1>
      <svg width="400" height="300" className="border">
        {routersState.map(router => (
          <RouterNode key={router.id} routerState={router} />
        ))}
        {routersState.flatMap(router =>
          router.neighbors.map(({ router: neighbor, metric }) => {
            const neighborState = routersState.find(r => r.id === neighbor.id)
            if (neighborState && router.id < neighbor.id) {
              // Avoid duplicate lines
              return (
                <ConnectionLine
                  key={`${router.id}-${neighbor.id}`}
                  from={router}
                  to={neighborState}
                  metric={metric}
                />
              )
            }
            return null
          })
        )}
      </svg>
      <div className="mt-4">
        <h2 className="text-lg">Routing Tables</h2>
        {routersState.map(router => (
          <div key={router.id} className="mb-2">
            <h3 className="font-bold">{router.id}</h3>
            <table className="table-auto border">
              <thead>
                <tr>
                  <th className="border px-2">Destination</th>
                  <th className="border px-2">Next Hop</th>
                  <th className="border px-2">Metric</th>
                </tr>
              </thead>
              <tbody>
                {router.routingTable.map(({ dest, nextHop, metric }) => (
                  <tr key={dest}>
                    <td className="border px-2">{dest}</td>
                    <td className="border px-2">{nextHop}</td>
                    <td className="border px-2">{metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<NetworkCanvas />)
