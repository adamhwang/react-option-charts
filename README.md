# react-option-charts
Option pricing and payoff charts in React

## Getting started

### Installation

```npm i react-option-charts```

or

```yarn add react-option-charts```

### Usage

```
    <OptionPayoffChart
        seriesName="example"
        showPayoff
        s={96.5}
        r={.007}
        strategies={[{
                name: 'Iron condor',
                color: "red",
                payoffColor: "blue",
                optionLegs: [{
                    k: 95,
                    t: 45 / 365,
                    v: .15,
                    callPut: "put",
                    quantity: 1,
                }, {
                    k: 100,
                    t: 45 / 365,
                    v: .15,
                    callPut: "put",
                    quantity: -1,
                }, {
                    k: 105,
                    t: 45 / 365,
                    v: .15,
                    callPut: "call",
                    quantity: -1,
                }, {
                    k: 110,
                    t: 45 / 365,
                    v: .15,
                    callPut: "call",
                    quantity: 1,
                }]
            }]}
    ></OptionPayoffChart>
```

- **s** - Current price of the underlying
- **k** - Strike price
- **t** - Time to expiration in years
- **v** - Volatility as a decimal
- **r** - Annual risk-free interest rate as a decimal
- **callPut** - The type of option to be priced - "call" or "put"
- **quantity** - Number of contracts, positive for long or negative for short

- **showPayoff** - Optional bool to show payoff chart
- **payoffTitle** - Optional string to overwrite payoff title. "{0}" will be overwritten by the strategy name

![Example Iron Condor payoff chart](docs/example.png?raw=true "Iron Condor example")

## Contribution

PRs welcome