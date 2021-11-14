importScripts('./sudokuexplained_engine.js');

const { execute_command } = wasm_bindgen;

async function run() {
    await wasm_bindgen('./sudokuexplained_engine_bg.wasm');

    onmessage = function(e) {
        const {id, payload} = e.data;
        console.log(`worker.js <- ${payload}`);
        const t0 = performance.now();
        let result = execute_command(payload);
        const t1 = performance.now();
        console.log(`worker.js -> ${result} (${(t1 - t0).toFixed(3)} ms)`);
        postMessage({id, payload: result});
    }
}

run().then(() => {
    postMessage({id: -1, err: undefined, payload: 'ready'});
});
