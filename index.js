const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();
let net;

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Associates webcam image with specific class index
  const addExample = classId => {
    // Get intermediate activation of MobileNet 'conv_preds';
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass activation to classifier
    classifier.addExample(activation, classId);
  }

  // When clicking a button, we add an example to the corresponding classifier.
  document.getElementById('class-a').addEventListener('click', () => addExample(0))
  document.getElementById('class-b').addEventListener('click', () => addExample(1))
  document.getElementById('class-c').addEventListener('click', () => addExample(2))

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get activation for webcam from mobilenet.
      const activation = net.infer(webcamElement, 'conv_preds');

      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);
      const classes = ['A', 'B', 'C']

      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia || navigatorAny.webkitGetUserMedia ||
      navigatorAny.mozGetUserMedia || navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true }, stream => {
        webcamElement.srcObject = stream;
        webcamElement.addEventListener('loadeddata', () => resolve(), false);
      },
      error => reject());
    } else {
      reject();
    }
  })
}
app();
