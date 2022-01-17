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
    withSize,
    withDeviceRatio
} from "@react-financial-charts/utils";
import { blackScholes } from "black-scholes";
import { scaleLinear } from "d3-scale";

import { MouseCoordinateYAccessor } from "./MouseCoordinateYAccessor";
import { formatUSD } from "./utils";

interface OptionLeg { k: number, t: number, v: number, callPut: "call" | "put" };

type OptionPayoffChartProps = Omit<ConstructorParameters<typeof ChartCanvas>[0], "data" | "displayXAccessor" | "margin" | "xScale" | "xAccessor" | "xExtents"> & {
    s: number;
    r: number;
    optionLegs: OptionLeg[];
};

type Point = {
    x: number;
    y: number;
}

const OptionPayoffChart: React.FunctionComponent<OptionPayoffChartProps> = (props) => {
    const { s, r, optionLegs, ...chartCanvasProps } = props;

    const keyXs = [...new Set(optionLegs.map(o => o.k).concat(s).sort())];

    const min = keyXs[0];
    const max = keyXs[keyXs.length - 1];
    const data: Point[] = [...Array(max * 2).keys()].map(s => {
        return {
            x: s,
            y: optionLegs.reduce((acc, o) => acc + blackScholes(s, o.k, o.t, o.v, r, o.callPut) || 0, 0),
        };
    });
    const v = optionLegs.reduce((acc, o) => acc + o.v, 0) / optionLegs.length;

    const xExtents = [min * Math.max(0, 1 - v), max * Math.min(2, 1 + v)];
    const xScale = scaleLinear([0, max - min], [min, max]);
    const xAccessor = (data: Point) => data.x;
    const yAccessor = (data: Point) => data.y;
    const yExtents = (data: Point) => [data.y * .8, data.y * 1.2];

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
                <LineSeries yAccessor={yAccessor} />
                <XAxis />
                <YAxis ticks={5} />
                <CurrentCoordinate
                    yAccessor={yAccessor}
                />
                <MouseCoordinateX
                    at="bottom"
                    orient="bottom"
                    displayFormat={formatUSD}
                />
                <MouseCoordinateYAccessor
                    at="right"
                    orient="right"
                    displayFormat={formatUSD}
                    yAccessor={yAccessor}
                />
            </Chart>
        </ChartCanvas>
    );
}

export default withSize({ style: { minHeight: 300 } })(withDeviceRatio()(
    // @ts-ignore
    OptionPayoffChart
));
