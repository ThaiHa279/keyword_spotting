let chunks = [];
let stream;
let recorder;
var formData;


async function start_record() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    }

    recorder.onstop = e => {
        console.log(chunks);
        let blob = new Blob(chunks, { "type": "audio/ogg; codecs=opus" });
        chunks = [];
        let audioURL = URL.createObjectURL(blob);
        var audioHTML = document.getElementById("audio");
        audioHTML.setAttribute("src", audioURL);

        const wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4F4A85',
            progressColor: '#383351',
            url: audioURL,
        });
        wavesurfer.once('interaction', () => {
            wavesurfer.play()
        })
        let reader = new FileReader();
        let audioContext = new AudioContext({sampleRate: 8000});
        reader.readAsArrayBuffer(blob);
        reader.onload = function() {
            let arrayBuffer = reader.result;

            // Giải mã dữ liệu OGG thành một AudioBuffer
            audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
                // Tạo một Float32Array từ AudioBuffer
                let float32Array = audioBuffer.getChannelData(0);
            
                var arrays = [];
                const size = 8000;
                for (let i = 0; i < float32Array.length; i += size) {
                    arrays.push(float32Array.slice(i, i + size));
                }
                var arr = arrays[arrays.length-1];
                const temp = new Float32Array(8000-arr.length).fill(0.0);
                arr = new Float32Array([...arr, ...temp]);
                arrays[arrays.length-1] = arr;
                // arrays.map((a) => {
                //     console.log(a.length);
                // })
                // predict(arrays);
            });
        };
       
        console.log("recorder stopped");
    };
    
    console.log("recorder start");
    recorder.start();
    // const myTimeout = setTimeout(stop_record, 1000);

}

function stop_record() {
    recorder.stop();
}

var model;
//run http-server -c1 --cors .
async function load_model() {
    const modelPath = 'http://127.0.0.1:8080/model_save_js/model.json';
    model = await tf.loadLayersModel(modelPath);
    console.log(model);
}
load_model()
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
    output_list.map((output) => {
        let max = Math.max.apply(null, output)
        console.log(label[output.indexOf(max)]);
    })
    
    // console.log(outputTensor.dataSync());
}
