import Task from "./Task";

import { TTaskProcess } from "../types/Task";
import {
    TTimeoutParams,
    ITimeoutParamsCron,
    ITimeoutParamsPlannedTime,
    ITimeoutNoTime,
} from "../types/Timeout";

class Timeout<Result, Err extends Error, Params extends object> extends Task<
    Result,
    Err,
    Params
> {
    constructor(params: ITimeoutParamsCron<Result, Err, Params>);
    constructor(params: ITimeoutParamsPlannedTime<Result, Err, Params>);
    constructor(
        func: TTaskProcess<Result, Err, Params>,
        ms: number,
        params?: ITimeoutNoTime<Result, Err, Params>
    );
    constructor(
        paramsOrFunction:
            | TTimeoutParams<Result, Err, Params>
            | TTaskProcess<Result, Err, Params>,
        ms?: number,
        additionalParams?:
            | TTimeoutParams<Result, Err, Params>
            | ITimeoutNoTime<Result, Err, Params>
    ) {
        if (typeof paramsOrFunction === "function") {
            super({
                isInterval: false,
                source: paramsOrFunction,
                intervalTimer: ms,
                ...additionalParams,
            });
        } else {
            super({
                isInterval: false,
                ...paramsOrFunction,
            });
        }
    }
}

export default Timeout;
