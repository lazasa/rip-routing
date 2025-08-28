/// <reference path="./global.d.ts" />

type IP = string

interface TableEntry {
  nextHop: IP
  metric: number
}

interface Neighbor {
  router: IRouter
  metric: number
}

interface IRouter {
  ip: string
  x: number
  y: number
  routingTable: Map<IP, TableEntry>
  updateRoutingTable(): void
}

class Network {
  constructor(private routers: IRouter[]) {}

  addRouter(router: IRouter) {
    this.routers.push(router)
  }

  printAddr() {
    this.routers.forEach(r => {
      console.log(r.ip)
    })
  }
  // Simulate RIP updates every 3 seconds
  startUpdates() {
    setInterval(() => {
      this.routers.forEach(router => router.updateRoutingTable())
    }, 3000)
  }
}

class Router implements IRouter {
  private observers: IRouter[]
  private neighbors: Neighbor[]
  public routingTable: Map<IP, TableEntry>

  constructor(public ip: IP, public x: number, public y: number) {}

  subscribe(observer: IRouter) {
    this.observers.push(observer)
  }

  addNeighbor(router: IRouter, metric: number = 1) {
    this.neighbors.push({ router, metric })
  }

  notify() {
    this.observers.forEach(observer => observer.updateRoutingTable())
  }

  updateRoutingTable() {
    let updated = false

    this.neighbors.forEach(({ router }) => {
      router.routingTable.forEach(({ metric, nextHop }, ip) => {
        if (ip === this.ip) return

        // entry for the desired route to update
        const currentTableEntry = this.routingTable.get(ip)
        const newMetric = metric + 1

        if (!currentTableEntry || newMetric < currentTableEntry.metric) {
          this.routingTable.set(ip, {
            nextHop: router.ip,
            metric: newMetric
          })
        }
      })
    })
  }
}

const r1 = new Router('192.168.10.1', 200, 300)
const r2 = new Router('192.168.20.1', 200, 300)
const r3 = new Router('192.168.30.1', 200, 300)
const r4 = new Router('192.168.40.1', 200, 300)

const LAN = new Network([r1, r2, r3, r4])

LAN.printAddr()
function NetworkCanvas() {
  return <div>asdfasdf</div>
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<NetworkCanvas />)
