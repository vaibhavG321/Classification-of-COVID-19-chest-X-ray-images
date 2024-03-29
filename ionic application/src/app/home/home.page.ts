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
        setTimeout(async () => {
        	let image = <HTMLImageElement> document.getElementById("imge");
          this.loading = true;
          const loading = await this.loadingController.create({
            message: 'Loading Result...',
          });
          await loading.present();
          this.pred = await this.model.predict(this.preprocess(image)).dataSync();
          await loading.dismiss();
        }, 100);
      };
    }
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
