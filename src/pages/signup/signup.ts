import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import {Validators, FormBuilder } from '@angular/forms';

import { HomePage } from '../home/home';
import { AuthService } from '../../providers/auth-service';

/*
  Generated class for the Signup page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {


  signupForm:any;
  loader:any;
  errorMessage:any;

  constructor(
    public navCtrl: NavController,
    private _formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public loadCtrl:LoadingController,
    private _Auth: AuthService
  ) {

    this.signupForm = this._formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  /* Events Methodes */
  ionViewDidLoad() {
    console.log('Hello SignupPage Page');
  }

  onSignup():void{
    this.loader = this.loadCtrl.create({
      dismissOnPageChange: true,
    });
    this.loader.present();
    this._Auth.signUp(this.signupForm.value)
         .subscribe(
           result  => {
            //console.log('signup result-> ', result)
             if(result.success === true){
               console.log('Success: signup result -> ',result)
               // TODO: create user token & redirect user on HomePage
               this.createToken(this.signupForm.value)
             }
             else {
               console.log('Failed to signup:-> ', result)
               this.showError(result.message, true)
             }
           },
           error =>  {
             this.errorMessage = <any>error
             console.log('Error request :-> ', this.errorMessage)
           });
  }

  /* Core Methodes */
  createToken(userData):void{
    this._Auth.loginUser(userData)
         .subscribe(
           result  => {
             if(result.success === true){
               console.log('Success: Auth token-> ',result)
               this.saveToken(result.token)
               this.navCtrl.setRoot(HomePage)
             }
             else {
               console.log('Failed to Auth:-> ', result)
               this.showError(result.message, true)
             }
           },
           error =>  {
             this.errorMessage = <any>error
             console.log('Error request :-> ', this.errorMessage)
           });
  }

  saveToken(token):void{
    let data = {
      'token': token
    };
    // Browser save token data
    window.localStorage.setItem('authTokenTest', JSON.stringify(data))
    // mobile save token data
    // TODO: test on mobile with browser methode & add mobile methode if nessesary
  }

  /* ErrorHandler Methode */
  showError(text:string,hideLoading:boolean=true):void {
    if (hideLoading === true){
      setTimeout(() => {
        this.loader.dismiss();
      });
    }
    let alert = this.alertCtrl.create({
      title: 'Erreur',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }

}
