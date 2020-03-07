import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonImg,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react';
import React, { Component } from 'react';
import { Plugins, CameraResultType } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as faceapi from 'face-api.js';

const { Camera } = Plugins;
const INITIAL_STATE = {
  photo: ''
};

async function loadModel() {
  console.log('Models have started Loading');
  const model_path = window.location.origin + '/models';
  await faceapi.nets.faceRecognitionNet.loadFromUri(model_path);
  await faceapi.nets.faceLandmark68Net.loadFromUri(model_path);
  await faceapi.nets.ssdMobilenetv1.loadFromUri(model_path);
  console.log('Models have ended loading');
}

export class Home extends Component {
  state: any = {};
  constructor(props: any) {
    super(props);
    this.state = { ...INITIAL_STATE };
    defineCustomElements(window);
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
    });
    loadModel();
    const img = this.state.photo;
    console.log(img);
    this.start(img);
  }

  public getBase64Image(imgUrl, callback) {
    var img = new Image();
    // onload fires when the image is fully loadded, and has width and height
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL('image/png', 1.0),
        dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
      callback(dataURL); // the base64 string
    };
    // set attributes and src
    img.setAttribute('crossOrigin', 'anonymous'); //
    img.src = imgUrl;
  }

  async start(image) {
    console.log('Start started');
    const container = document.getElementById('test');
    const labeledFaceDescriptors = await this.loadLabeledImages();
    console.log(labeledFaceDescriptors);
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    console.log(faceMatcher);
    let canvas;
    this.getBase64Image(image, function(base64image) {
      console.log(base64image);
    });
    // image = await faceapi.bufferToImage(image).catch(err => {
    //   console.log(err);
    // });
    // console.log(image);
    // container.append(image);
    // canvas = faceapi.createCanvasFromMedia(image);
    // container.append(canvas);
    // const displaySize = { width: image.width, height: image.height };
    // faceapi.matchDimensions(canvas, displaySize);
    // const detections = await faceapi
    //   .detectAllFaces(image)
    //   .withFaceLandmarks()
    //   .withFaceDescriptors();
    // const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // const results = resizedDetections.map(d =>
    //   faceMatcher.findBestMatch(d.descriptor)
    // );
    // results.forEach((result, i) => {
    //   const box = resizedDetections[i].detection.box;
    //   const drawBox = new faceapi.draw.DrawBox(box, {
    //     label: result.toString()
    //   });
    //   drawBox.draw(canvas);
    // });
  }
  loadLabeledImages = () => {
    const labels = [
      'Black Widow',
      'Captain America',
      'Captain Marvel',
      'Hawkeye',
      'Jim Rhodes',
      'Thor',
      'Tony Stark'
    ];
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(
            `https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`
          );
          const model_path = window.location.origin + '/models';
          await faceapi.nets.ssdMobilenetv1.loadFromUri(model_path);
          await faceapi.nets.faceLandmark68Net.loadFromUri(model_path);
          const detections = await faceapi
            .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  render() {
    const { photo } = this.state;
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Ionic Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className='ion-padding'>
          <IonImg
            style={{ border: '1px solid black', minHeight: '100px' }}
            src={photo}
            id='img'
          ></IonImg>
          <div id='test'>
            <canvas id='canvas'></canvas>
          </div>
          <IonFab
            color='primary'
            vertical='bottom'
            horizontal='center'
            slot='fixed'
          >
            <IonFabButton color='primary' onClick={() => this.takePicture()}>
              <IonIcon name='add' />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
    );
  }
}
export default Home;
