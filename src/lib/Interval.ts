import Task from "./Task";

import { TTaskProcess } from "../types/Task";
import {
    IIntervalNoTime,
    TIntervalParams,
    IIntervalParamsCron,
    IIntervalParamsIntervalTimer,
    IIntervalParamsPlannedTime,
} from "../types/Interval";

class Interval<Result, Err extends Error, Params extends object> extends Task<
    Result,
    Err,
    Params
> {
    constructor(params: IIntervalParamsCron<Result, Err, Params>);
    constructor(params: IIntervalParamsIntervalTimer<Result, Err, Params>);
    constructor(params: IIntervalParamsPlannedTime<Result, Err, Params>);
    constructor(
        func: TTaskProcess<Result, Err, Params>,
        ms: number,
        params?: IIntervalNoTime<Result, Err, Params>
    );
    constructor(
        paramsOrFunction:
            | TIntervalParams<Result, Err, Params>
            | TTaskProcess<Result, Err, Params>,
        ms?: number,
        additionalParams?:
            | TIntervalParams<Result, Err, Params>
            | IIntervalNoTime<Result, Err, Params>
    ) {
        if (typeof paramsOrFunction === "function") {
            super({
                isInterval: true,
                source: paramsOrFunction,
                intervalTimer: ms,
                ...additionalParams,
            });
        } else {
            super({
                isInterval: true,
                ...paramsOrFunction,
            });
        }
    }

    public pause(): this {
        this.service.status = "pause";
        return this;
    }

    public unpause(): this {
        this.service.status = "await";
        return this;
    }
}

export default Interval;
