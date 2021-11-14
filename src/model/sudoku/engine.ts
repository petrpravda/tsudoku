interface Message {
    id: number,
    payload: string
}

export let ENGINE: Engine;

/**
 * Enqueues messages and processes them one by one in external WebWorker.
 */
export class Engine {
    private readonly worker: Worker;
    private resolves: { [id: string]: (arg0: string) => Promise<string> } = {};
    private rejects: { [id: string]: (arg0: string) => Promise<string> } = {};
    private globalMsgId = 0;
    private initialized = false;
    private waitingQueue: Array<Message> = [];

    constructor() {
        this.worker = new Worker('/engine/worker.js')
        this.worker.onmessage = this.handleMsg;
        ENGINE = this;
    }

    sendMsg(payload: string): Promise<any> {
        const msgId = this.globalMsgId++
        const msg = {
            id: msgId,
            payload
        }
        const outer = this;
        return new Promise(function (resolve, reject) {
            // @ts-ignore
            outer.resolves[msgId] = resolve;
            // @ts-ignore
            outer.rejects[msgId] = reject;
            if (outer.initialized) {
                outer.worker.postMessage(msg);
            } else {
                outer.waitingQueue.push(msg);
            }
        })
    }

    private onInitialized() {
        console.info(`initialized`);
        this.initialized = true;
        this.waitingQueue.forEach(msg => this.worker.postMessage(msg));
        this.waitingQueue = [];
    }

    handleMsg(msg: any) {
        const {id, err, payload} = msg.data;
        if (id === -1) {
            ENGINE.onInitialized();
        } else {
            if (payload) {
                const resolve = ENGINE.resolves[id]
                if (resolve) {
                    resolve(payload)
                }
            } else {
                const reject = ENGINE.rejects[id]
                if (reject) {
                    if (err) {
                        reject(err)
                    } else {
                        reject('Got nothing')
                    }
                }
            }
            delete ENGINE.resolves[id]
            delete ENGINE.rejects[id]
        }
    }
}

ENGINE = new Engine();
