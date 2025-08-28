interface TableEntry {
  nextHop: number
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

  // observers: IRouter[]
  // neighbors: Neighbor[]
  // routingTable: Map<string, TableEntry>
}

type IP = string

class Router implements IRouter {
  constructor(
    public ip: IP,
    public x: number,
    public y: number,
    private observers: IRouter[],
    private neighbors: Neighbor[],
    private routingTable: Map<IP, TableEntry>
  ) {}
}
