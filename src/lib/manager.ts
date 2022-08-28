import Task from "./Task";

class SchedulerManager {
    private _allowedWords = "defbca123456890".split("");

    public list: Task[] = [];

    public execute(callback: (task: Task) => void): void {
        let i = this.list.length;
        while (i > 0) {
            callback(this.list[--i]);
        }
        return;
    }

    public executeOutdatedTasks(): void {
        const now = Date.now();

        const maximalIndex = this.list.findIndex((x) => x.plannedTime >= now);
        if (maximalIndex === -1 && this.list.length > 0) {
            this.list.map((task) => {
                if (task.status === "await" && now >= task.plannedTime) {
                    void task.execute(false);
                }
            });
        } else {
            for (let index = 0; index < maximalIndex; ++index) {
                const task = this.list[index];
                if (task.status === "await" && now >= task.plannedTime) {
                    void task.execute(false);
                }
            }
        }
        this.sort();
        return;
    }

    public sort(): void {
        this.list.sort((a, b) => {
            if (a.plannedTime > b.plannedTime) {
                return 1;
            }
            if (a.plannedTime < b.plannedTime) {
                return -1;
            }
            return 0;
        });
        return;
    }

    public insert(index: number, task: Task): void {
        this.list.splice(index, 0, task);
        return;
    }

    public move(from: number, to: number): void {
        const startIndex = from < 0 ? this.list.length + from : from;
        if (startIndex >= 0 && startIndex < this.list.length) {
            const endIndex = to < 0 ? this.list.length + to : to;
            const [item] = this.list.splice(from, 1);
            this.insert(endIndex, item);
        }
        return;
    }

    public generateID(): string {
        let id = "";
        for (let i = 0; i < 16; ++i) {
            id +=
                this._allowedWords[
                    Math.floor(Math.random() * this._allowedWords.length)
                ];
        }
        if (!this.list.find((x) => x.id === id)) {
            return id;
        } else {
            return this.generateID();
        }
    }
}

const manager = new SchedulerManager();

export default manager;
