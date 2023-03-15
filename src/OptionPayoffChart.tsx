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
    GenericChartComponent,
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
import { format, formatUSD, rangeMinSize } from "./utils.js";

export interface OptionLeg { k: number, t: number, v: number, callPut: "call" | "put", quantity?: number };

export interface IOptionStrategy {
    name: string;
    color?: string;
    payoffColor?: string;
    optionLegs: OptionLeg[];
    
    showPayoff?: boolean;
    payoffTitle?: string;
};

type OptionStrategy = IOptionStrategy & {
    value: OptionStrategyValue;
}

export type OptionStrategyValue = {
    total: number;
    optionLegValues: number[];
};

export type OptionPayoffChartProps = Omit<ConstructorParameters<typeof ChartCanvas>[0], "data" | "displayXAccessor" | "margin" | "xScale" | "xAccessor" | "xExtents"> & {
    s: number;
    r: number;

    strategies: IOptionStrategy[];

    onCurrentValueChanged?: (x: number, start: { [strategyName: string]: OptionStrategyValue }, current: { [strategyName: string]: OptionStrategyValue }) => void;
};

type Point = {
    x: number;
    [key: string]: number;
};

const calcLegValue = (o: OptionLeg, underlyingPrice: number, r: number) => blackScholes(underlyingPrice, o.k, o.t, o.v, r, o.callPut) || 0;

const calcValue: (optionLegs: OptionLeg[], underlyingPrice: number, r: number) => OptionStrategyValue = (optionLegs, underlyingPrice, r) => {
    let total = 0;
    const optionLegValues = optionLegs.reduce((acc, o, i) => {
        const legValue = calcLegValue(o, underlyingPrice, r) * (o.quantity || 1);
        total += legValue;
        acc.push(legValue);
        return acc;
    }, [] as number[]);
    return {
        total,
        optionLegValues,
    };
};

const OptionPayoffChart: React.FunctionComponent<OptionPayoffChartProps> = (props) => {
    const { s, r, strategies, children, onCurrentValueChanged, ...chartCanvasProps } = props;

    const [lastX, setLastX] = React.useState(s);

    const strategyByName = strategies.reduce((acc, strategy) => {
        const strat: OptionStrategy = {
            ...strategy,
            value: calcValue(strategy.optionLegs, s, r),
        };
        
        acc[strat.name] = strat;
        if (strat.showPayoff) {
            const minT = Math.min(...strat.optionLegs.map(o => o.t));
            const title = format(strat.payoffTitle || "{0} payoff", strat.name);
            acc[title] = {
                ...strat,
                color: strat.payoffColor || strat.color,
                optionLegs: strat.optionLegs.map(o => {
                    return {
                        ...o,
                        t: o.t - minT,
                    };
                })
            };
        }
        return acc;
    }, {} as { [key: string]: OptionStrategy });
    const strategyNames = Object.keys(strategyByName);
    const strategyValues = strategyNames.reduce((acc: { [strategyName: string ]: OptionStrategyValue}, strategyName: string) => {
        acc[strategyName] = strategyByName[strategyName].value;
        return acc;
    }, {});

    React.useEffect(() => {
        onCurrentValueChanged && onCurrentValueChanged(s, strategyValues, strategyValues);
    }, [s, r, strategies]);

    const allLegs = strategies.flatMap(strat => strat.optionLegs);

    const v = Math.max(...allLegs.map(o => o.v));
    const keyXs = allLegs.map(o => o.k);
    if (s) keyXs.push(s);

    let minX = Math.floor(Math.min(...keyXs) * Math.max(0, 1 - v));
    let maxX = Math.ceil(Math.max(...keyXs) * Math.min(2, 1 + v));

    if (maxX - minX == 1) {
        minX = Math.max(0, minX - 1);
        maxX += 1;
    }

    const data = rangeMinSize(maxX - minX, minX).map(x => {
        return strategyNames.reduce((acc, strategyName) => {
            const strat = strategyByName[strategyName];
            acc[strategyName] = calcValue(strat.optionLegs, x, r).total - (strat.value?.total || 0);
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

    const currentValueChanged = (ctx: CanvasRenderingContext2D, { currentItem }: any) => {
        const { x, ...strategies} = !!currentItem && currentItem;

        if (x === lastX) return;
        else setLastX(x);

        const currentValues = Object.keys(strategies)?.reduce((acc: { [strategyName: string ]: OptionStrategyValue}, strategyName: string) => {
            if (strategyByName[strategyName]) {
                acc[strategyName] = calcValue(strategyByName[strategyName].optionLegs, x, r);
            }
            return acc;
        }, {});
        onCurrentValueChanged && onCurrentValueChanged(x, strategyValues, currentValues);
    };
    
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
                {onCurrentValueChanged && <GenericChartComponent
                    clip={false}
                    canvasDraw={currentValueChanged}
                    drawOn={["mousemove"]}
                />}
                {series}
                {coords}
                {edges}
                {tooltips}
                {children}
            </Chart>
        </ChartCanvas>
    );
}

export default withSize({ style: { minHeight: 300 } })(withDeviceRatio()(
    // @ts-ignore
    OptionPayoffChart
));
