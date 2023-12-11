
var model;
//run http-server -c1 --cors .
async function load_model() {
    const modelPath = 'http://127.0.0.1:8080/model_save_js/model.json';
    model = await tf.loadLayersModel(modelPath);
    console.log(model);
}
load_model()
var array = []
function split_array(arr) {
    let max = Math.max.apply(null, arr);
    if (max < 0.1) return [];
    let l = arr.indexOf(max);
    let r = arr.indexOf(max);
    let cout_l = 0;
    let cout_r = 0;
    while (r - l < 8000 && (cout_l + cout_r < 500) && l>0 && r<arr.length) {
        if (Math.abs(arr[l-1]) < 0.001 && cout_l < 250) {
            cout_l++;
        } else {
            l--;
            cout_l = 0;
        }
        if (Math.abs(arr[r+1]) < 0.001 && cout_r < 250) {
            cout_r++;
        } else {
            r++;
            cout_r = 0;
        }
    }
    split_array(arr.slice(0, l));
    if (r - l > 1500)
        array.push(arr.slice(l, r));
    split_array(arr.slice(r, arr.length-1));
}

let segments = [];
function LoadData(blob) {
    
    let reader = new FileReader();
    let audioContext = new AudioContext({sampleRate: 8000});
    reader.readAsArrayBuffer(blob);
    reader.onload = function() {
        let arrayBuffer = reader.result;
        audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
            // let float32Array = audioBuffer.getChannelData(0);
            // array = []
            // split_array(float32Array);
            // console.log(array.length);

            let segments = splitAudioOnSilence(audioBuffer, 200, 0.02);

            const arrays = segments.map((arr) => {
                if (arr.length >= 8000) arr.length = 8000;
                else {
                    var temp = new Float32Array((8000-arr.length)/2).fill(0.0);
                    arr = new Float32Array([...arr, ...temp]);
                    temp = new Float32Array(8000-arr.length).fill(0.0);
                    arr = new Float32Array([ ...temp, ...arr]);
                }
                return arr;
            })
            console.log(arrays);
            predict(arrays);
            segments = [];
        });
    };

}
//run http-server -c1 --cors .
function predict(arr) {
    var tf_input = tf.tensor(arr);
    tf_input = tf_input.reshape([arr.length, 8000,1]);

    const outputTensor = model.predict(tf_input);
    var output_list = [];
    const size = 14;
    for (let i = 0; i < outputTensor.dataSync().length; i += size) {
        output_list.push(outputTensor.dataSync().slice(i, i + size));
    }
    
    let label = ['down', 'eight', 'five', 'four', 'left', 'nine', 'one', 'right', 'seven', 'six', 'three', 'two', 'up', 'zero']
    var text = "";
    output_list.map((output) => {
        let max = Math.max.apply(null, output);
        if (max > 0.8) {
            let temp = label[output.indexOf(max)];
            // if ((text.length == 0) || (temp != text.slice(text.length-temp.length, text.length))) {
            text = text + " " + temp;
            // }
            console.log(max);

        }
    })
    if (text == "") text = "Record error, try again!"
    const container = document.querySelector('#recordings')
    const p = container.appendChild(document.createElement('p'))
    p.innerHTML = text;
}

function splitAudioOnSilence(audioBuffer, frameSize, silenceThreshold) {
    let rmsValues = calculateRMSE(audioBuffer, frameSize);
    let a = rmsValues.map((v) => {
        if (v > silenceThreshold) return 1 
        else return 0
    })
    let data = audioBuffer.getChannelData(0);
    let segments = [];
    let segmentStart = 0;
    if (a[0] != 1 ) segmentStart = 1;
    console.log(data.length);
    for (let i = 1; i < rmsValues.length; i++) {
        if (rmsValues[i] < silenceThreshold) {
            let segmentEnd = i ;
            if (segmentEnd-segmentStart > 1) {
                let segment = data.slice(segmentStart * frameSize, segmentEnd * frameSize);
                segments.push(segment);
            }
            segmentStart = segmentEnd;
        }
    }

    return segments;
}

function calculateRMSE(audioBuffer, frameSize) {
    let rawData = audioBuffer.getChannelData(0); // chỉ lấy kênh đầu tiên
    let numFrames = Math.floor(rawData.length / frameSize);
    let rmsValues = [];

    for (let i = 0; i < numFrames; i++) {
        let frameStart = i * frameSize;
        let sumOfSquares = 0;
        for (let j = frameStart; j < frameStart + frameSize; j++) {
            sumOfSquares += rawData[j] * rawData[j];
        }
        let rms = Math.sqrt(sumOfSquares / frameSize);
        rmsValues.push(rms);
    }

    return rmsValues;
}