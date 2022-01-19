import * as React from "react";
import {
    XAxis,
    YAxis,
} from "@react-financial-charts/axes";
import {
    CurrentCoordinate,
    MouseCoordinateX,
} from "@react-financial-charts/coordinates";
import {
    ChartCanvas,
    Chart,
} from "@react-financial-charts/core";
import {
    LineSeries,
} from "@react-financial-charts/series";
import {
    SingleValueTooltip,
} from '@react-financial-charts/tooltip';
import {
    withSize,
    withDeviceRatio,
} from "@react-financial-charts/utils";
import { blackScholes } from "black-scholes";
import { scaleLinear } from "d3-scale";

import { MouseCoordinateYAccessor } from "./MouseCoordinateYAccessor.js";
import { formatUSD, range } from "./utils.js";

export interface OptionLeg { k: number, t: number, v: number, callPut: "call" | "put", quantity?: number };
export type OptionStrategy = {
    name: string;
    cost?: number;
    color?: string;
    payoffColor?: string;
    optionLegs: OptionLeg[];
}
type OptionPayoffChartProps = Omit<ConstructorParameters<typeof ChartCanvas>[0], "data" | "displayXAccessor" | "margin" | "xScale" | "xAccessor" | "xExtents"> & {
    s?: number;
    r: number;

    showPayoff?: boolean;

    strategies: OptionStrategy[];
};

type Point = {
    x: number;
    [key: string]: number;
};

const OptionPayoffChart: React.FunctionComponent<OptionPayoffChartProps> = (props) => {
    const { s, r, showPayoff, strategies, ...chartCanvasProps } = props;

    const calcPrice = (strat: OptionStrategy, underlyingPrice: number) => strat.optionLegs.reduce((acc, o) => acc + (blackScholes(underlyingPrice, o.k, o.t, o.v, r, o.callPut) || 0) * (o.quantity || 1), 0)

    const strategyByName = strategies.reduce((acc, strat) => {
        strat.cost = strat.cost || (s && calcPrice(strat, s));
        acc[strat.name] = strat;
        if (showPayoff) {
            acc[`${strat.name} Payoff`] = {
                ...strat,
                color: strat.payoffColor || strat.color,
                optionLegs: strat.optionLegs.map(o => {
                    return {
                        ...o,
                        t: 0,
                    };
                })
            };
        }
        return acc;
    }, {} as { [key: string]: OptionStrategy });
    const strategyNames = Object.keys(strategyByName);
    const allLegs = strategies.flatMap(strat => strat.optionLegs);

    const v = Math.max(...allLegs.map(o => o.v));
    const keyXs = allLegs.map(o => o.k);
    if (s) keyXs.push(s);

    const minX = Math.floor(Math.min(...keyXs) * Math.max(0, 1 - v));
    const maxX = Math.ceil(Math.max(...keyXs) * Math.min(2, 1 + v));

    const data = range(maxX - minX, minX).map(x => {
        return strategyNames.reduce((acc, strategyName) => {
            const strat = strategyByName[strategyName];
            acc[strategyName] = calcPrice(strat, x) - (strat.cost || 0);
            return acc;
        }, { x } as Point);
    });

    const xExtents = [minX, maxX];
    const xScale = scaleLinear([0, maxX - minX], [minX, maxX]);
    const xAccessor = (data: Point) => data.x;

    const yExtents = (data: Point) => {
        const minY = Math.min(...strategyNames.map(strategyName => data[strategyName]));
        const maxY = Math.max(...strategyNames.map(strategyName => data[strategyName]));
        return [minY - Math.abs(minY * .2), maxY + Math.abs(maxY * .2)];
    };
    const yAccessor = (strategyName: string) => (data: Point) => data[strategyName];

    const series = strategyNames.map(strategyName => (
        <LineSeries
            key={`series-${strategyName}`}
            strokeStyle={strategyByName[strategyName].color}
            yAccessor={yAccessor(strategyName)}
        />
    ));

    const coords = strategyNames.map(strategyName => (
        <CurrentCoordinate
            key={`coords-${strategyName}`}
            fillStyle={strategyByName[strategyName].color}
            strokeStyle={strategyByName[strategyName].color}
            yAccessor={yAccessor(strategyName)}
        />
    ));

    const edges = strategyNames.map(strategyName => (
        <MouseCoordinateYAccessor
            key={`edges-${strategyName}`}
            at="right"
            orient="right"
            displayFormat={formatUSD}
            yAccessor={yAccessor(strategyName)}
        />
    ));

    const tooltips = strategyNames.map((strategyName, i) => (
        <SingleValueTooltip
            key={`tooltips-${strategyName}`}
            yAccessor={yAccessor(strategyName)}
            yLabel={strategyName}
            yDisplayFormat={formatUSD}
            labelFill={strategyByName[strategyName].color}
            origin={[8, (i + 1) * 16]}
        />
    ));

    return (
        <ChartCanvas
            {...chartCanvasProps}
            data={data}
            margin={{ left: 0, right: 50, top: 0, bottom: 30 }}
            xScale={xScale}
            xAccessor={xAccessor}
            xExtents={xExtents}
        >
            <Chart id={1} yExtents={yExtents}>
                <XAxis />
                <YAxis ticks={5} />
                <MouseCoordinateX
                    at="bottom"
                    orient="bottom"
                    displayFormat={formatUSD}
                />
                {series}
                {coords}
                {edges}
                {tooltips}
            </Chart>
        </ChartCanvas>
    );
}

export default withSize({ style: { minHeight: 300 } })(withDeviceRatio()(
    // @ts-ignore
    OptionPayoffChart
));
