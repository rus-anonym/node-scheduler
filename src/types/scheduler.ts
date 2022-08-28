type TSchedulerMode = "timeout" | "interval" | "not_work";

interface ISchedulerConfig {
    mode: TSchedulerMode;
    interval: NodeJS.Timer | null;
    intervalMS: number;
}

export { TSchedulerMode, ISchedulerConfig };
