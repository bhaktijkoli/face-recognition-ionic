import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonImg, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import React, { Component } from 'react';
import { Plugins, CameraResultType } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
const { Camera } = Plugins;
const INITIAL_STATE = {
  photo: '',
};
export class Home extends Component {
  state: any = {};
  props: any = {};
  constructor(props: any) {
    super(props);
    this.state = { ...INITIAL_STATE };
    defineCustomElements(window);

  }
  async componentDidMount() {
    await this.loadModels();
    console.log('loaded')

}
async loadModels () {
    await faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    await faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    await faceapi.nets.ssdMobilenetv1.loadFromUri('../models')
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
      });
      var imageUpload = image.webPath;
      // Can be set to the src of an image now


      this.setState({
      photo: imageUpload
    })
  }



  async function start() {
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas
    document.body.append('Loaded')
    imageUpload.addEventListener('change', async () => {
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(imageUpload.files[0])
      container.append(image)
      canvas = faceapi.createCanvasFromMedia(image)
      container.append(canvas)
      const displaySize = { width: image.width, height: image.height }
      faceapi.matchDimensions(canvas, displaySize)
      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      })
    })
  }

  function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  render() {
    const { photo } = this.state;
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Ionic Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonImg style={{ 'border': '1px solid black', 'minHeight': '100px' }} src={photo} ></IonImg>
          <IonFab color="primary" vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton color="primary" onClick={() => this.takePicture()}>
              <IonIcon name="add" />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage >
    );
  };
}
export default Home;
