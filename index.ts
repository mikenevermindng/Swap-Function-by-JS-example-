type Pool = [
  { symbol: string; amount: number },
  { symbol: string; amount: number }
];

type Graph = {
  [key: string]: {
    // key of token A in pair
    pairWith: {
      symbol: string; // symbol of token B
      amountA: number; // amount of token A
      amountB: number; // amount of token B in pair
    }[];
  };
};

type RouteAndRate = {
  route: string[];
  rate: number;
};

const pools: Pool[] = [
  [
    { symbol: "VND", amount: 1000000 },
    { symbol: "AUD", amount: 2000000 },
  ],
  [
    { symbol: "AUD", amount: 2000000 },
    { symbol: "AUF", amount: 3000000 },
  ],
  [
    { symbol: "AUF", amount: 1000000 },
    { symbol: "AUG", amount: 4000000 },
  ],
  [
    { symbol: "AUG", amount: 4000000 },
    { symbol: "AUH", amount: 2000000 },
  ],
  [
    { symbol: "AUH", amount: 2000000 },
    { symbol: "VND", amount: 5000000 },
  ],
  [
    { symbol: "VND", amount: 5000000 },
    { symbol: "AUJ", amount: 2000000 },
  ],
  [
    { symbol: "AUJ", amount: 5000000 },
    { symbol: "USD", amount: 20000000 },
  ],
  [
    { symbol: "AUH", amount: 1000000 },
    { symbol: "AUJ", amount: 6000000 },
  ],
  [
    { symbol: "AUJ", amount: 3000000 },
    { symbol: "AUK", amount: 2000000 },
  ],
  [
    { symbol: "AUK", amount: 1000000 },
    { symbol: "USD", amount: 20000000 },
  ],
];

class Exchange {
  #graph: Graph;
  constructor(pools: Pool[]) {
    this.#graph = this.covertToGraph(pools);
  }

  covertToGraph(pairs: Pool[]): Graph {
    let graph: Graph = {};
    for (const pair of pairs) {
      if (!graph[pair[0].symbol]) {
        graph[pair[0].symbol] = {
          pairWith: [
            { ...pair[1], amountA: pair[0].amount, amountB: pair[1].amount },
          ],
        };
      } else {
        graph[pair[0].symbol].pairWith.push({
          ...pair[1],
          amountA: pair[0].amount,
          amountB: pair[1].amount,
        });
      }
      if (!graph[pair[1].symbol]?.pairWith) {
        graph[pair[1].symbol] = {
          pairWith: [
            { ...pair[0], amountA: pair[1].amount, amountB: pair[0].amount },
          ],
        };
      } else {
        graph[pair[1].symbol].pairWith.push({
          ...pair[0],
          amountA: pair[1].amount,
          amountB: pair[0].amount,
        });
      }
    }
    return graph;
  }

  /**
   *
   * @param graph: the graph converted from list of pools
   * @param neighbor  represents the current node from which the DFS exploration begins.
   * @param destination the target node you want to reach.
   * @param currentRoute  keep track of nodes that have already been visited during the DFS traversal to avoid revisiting them.
   * @param neighborAmount: the amount of neighbor token to swap
   * @param inputAmount: the amount of input token
   * @param output: list of routes and rates
   *
   * @returns list of routes and their rate
   */
  findPathAndRate(
    neighbor: string,
    destination: string,
    currentRoute: string[],
    neighborAmount: number,
    inputAmount: number,
    output: RouteAndRate[]
  ) {
    // Create a route by concatenating the base route and neighbor.
    const route = [...currentRoute, neighbor];
    // If the neighbor node is the destination, calculate the rate as neighborAmount / inputAmount and push both the route and the rate into the output.
    if (neighbor === destination) {
      output.push({ route, rate: neighborAmount / inputAmount });
      // If the neighbor node exists,
    } else if (this.#graph[neighbor]) {
      // Traverse nodes connected to the neighbor node.
      for (const nextNeighbor of this.#graph[neighbor].pairWith) {
        // If nextNeighbor does not appear in the route, it means that adding nextNeighbor to the route will not create a loop.
        if (!route.includes(nextNeighbor.symbol)) {
          // Calculate the amount of nextNeighbor, which is the result of swapping from neighbor to nextNeighbor. the formula was proved by me in a attached file
          const nextNeighborTokenAmount =
            (nextNeighbor.amountB * neighborAmount) /
            (nextNeighbor.amountA + neighborAmount);
          console.log(
            `A: ${neighbor}, B: ${nextNeighbor.symbol}, A token amount: ${nextNeighbor.amountA}, B token amount: ${nextNeighbor.amountB}, input token A: ${neighborAmount}, output token B: ${nextNeighborTokenAmount}`
          );
          // If nextNeighborTokenAmount < nextNeighbor.amount (amount of token in pool), traverse the next neighbor node.
          this.findPathAndRate(
            nextNeighbor.symbol,
            destination,
            [...route],
            nextNeighborTokenAmount,
            inputAmount,
            output
          );
        }
      }
    }
  }

  findAllPaths(fromToken: string, amount: number, destination: string) {
    // Because I am using the DFS algorithm to find all paths, I converted the  list of pools into the type of graph.
    // init output is an empty array
    const output: RouteAndRate[] = [];
    this.findPathAndRate(fromToken, destination, [], amount, amount, output);
    return output;
  }
}

const fromToken = "VND";
const toToken = "USD";
const amount = 5;

const exchange = new Exchange(pools);

const result = exchange.findAllPaths(fromToken, amount, toToken);

console.log(result);
