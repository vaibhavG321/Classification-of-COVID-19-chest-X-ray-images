import { Component } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  model: any;
  loading: boolean;
  imgSrc: '';
  pred: [];

  constructor(public loadingController: LoadingController, public toastController: ToastController) { }

  async ngOnInit() {
    this.loading = true;
    const loading = await this.loadingController.create({
      message: 'Loading Model...',
    });
    await loading.present();
    this.model = await tf.loadLayersModel('assets/model/model.json');
    this.presentToast('Model Loaded Succesfully!', "success");
    await loading.dismiss();
  }

  // function to call toast.
  async presentToast(message, color) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color
    });
    toast.present();
  }

  async fileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = async (res: any) => {
        this.imgSrc = res.target.result;
        // console.log(this.imgSrc);
        setTimeout(async () => {
        	let image = <HTMLImageElement> document.getElementById("imge");
        // console.log(image);
    //     let tensor = tf.browser.fromPixels(image)
    // .resizeNearestNeighbor([224, 224])
    // .toFloat()
    // .expandDims();
    // console.log(tensor);
        this.loading = true;
        const loading = await this.loadingController.create({
          message: 'Loading Result...',
        });
        await loading.present();
        this.pred = await this.model.predict(this.preprocess(image)).dataSync();
        await loading.dismiss();
        // const pred1 = await this.model.predict(this.preprocess(image)).argmax(1);
        // const pred = await this.model.predict(tensor).dataSync();
        // console.log(pred);
        // console.log(pred1);
    }, 100);
        
        // const pred = await this.model.classify(this.preprocess(image));
        // console.log(pred);
        // await tf.image(this.imgSrc, [224,224]);
        // const pred = await this.model.classify(this.imgSrc);
        // console.log(pred);
        // console.log("thiss");
  //       let tensor = tf.tensor(this.imgSrc,[1]);
		// console.log(tensor);
		// const pred = await this.model.predict(this.imgSrc);
  //       console.log(pred);

      };
      // console.log(this);
//       let image = <any> document.getElementById("img");
//       console.log(image);
// let tensor = tf.browser.fromPixels(image)
//     .resizeNearestNeighbor([224, 224])
//     .toFloat()
//     .expandDims();
//     console.log(tensor);



    }



// tf.io.decode_base64(
//     this.imgSrc, name=None
// )
  }

  preprocess(imgData: HTMLImageElement) {
	return tf.tidy(()=>{
	    //convert the image data to a tensor 
	    let tensor = tf.browser.fromPixels(imgData)
	    //resize to 28 x 28 
	    const resized = tf.image.resizeBilinear(tensor, [224, 224]).toFloat()
	    // Normalize the image 
	    const offset = tf.scalar(255.0);
	    const normalized = tf.scalar(1.0).sub(resized.div(offset));
	    //We add a dimension to get a batch shape 
	    const batched = normalized.expandDims(0)

	    return batched
	});
  }

}
