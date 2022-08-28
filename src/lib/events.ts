import { EventEmitter } from "node:events";
import { ITaskLogMetaInfo } from "../types/Task";

interface ISchedulerEventsEmitter {
    on(
        event: "error",
        listener: (
            error: Error,
            meta: ITaskLogMetaInfo<unknown, Error, object>
        ) => void
    ): this;
    on(
        event: "response",
        listener: (
            response: unknown,
            meta: ITaskLogMetaInfo<unknown, Error, object>
        ) => void
    ): this;
}

class ISchedulerEventsEmitter extends EventEmitter {}

export default ISchedulerEventsEmitter;
