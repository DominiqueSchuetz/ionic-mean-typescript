/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   21-12-2016
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 24-12-2016
*/

/// <reference path="./@types/index.d.ts" />

import * as express from 'express';
import * as http  from "http";
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';
import * as morgan from 'morgan';

import { ServerRoutes }  from "./modules/routes/serverRoute";
import { APIRoutes }  from "./modules/routes/apiRoute";
import { DataBase }  from "./modules/database";
import { log }  from "./modules/log";
// Import secretTokenKey config
import { secretTokenKey } from "./config";

export class Server{

  private app:express.Application;
  private server:http.Server;
  private root:string;
  private port:number|string|boolean;
  private db: boolean;


  constructor(){
    this.app = express();
    this.server = http.createServer(this.app);
    this.config()
    this.middleware()
    this.dbConnect()
  }

  private config():void{
    this.db = false;
    this.root = path.join(__dirname, '../www')
    this.port = this.normalizePort(process.env.PORT|| 8080);
    this.app.use(express.static(this.root))
  }

  private middleware(){
    this.app
      // use bodyParser middleware to decode json parameters
      .use(bodyParser.json())
      .use(bodyParser.json({type: 'application/vnd.api+json'}))
      // use bodyParser middleware to decode urlencoded parameters
      .use(bodyParser.urlencoded({extended: false}))
      // secret variable for jwt
      .set('superSecret', secretTokenKey)
      // use morgan to log requests to the console
      .use(morgan('dev'))
      .use(cors())
  }

  private dbConnect(){
      // Load DB connection
      DataBase.connect()
        .then(result =>{
          // Load all route
          console.log(result)
          // Server Endpoints
          this.app.use( new ServerRoutes().routes());
          // REST API Endpoints
          this.app.use( new APIRoutes().routes());
        })
        .catch(err => {
          // DB connection Error => load only server route
          console.log(err)
          // Server Endpoints
          this.app.use(new ServerRoutes().routes());
          return err
        })
        .then(err => {
          // Then catch 404 & db error connection
          this.app.use((req, res)=>{
            let message = (err)? [{error: 'Page not found'}, {err}] : [{error: 'Page not found'}]
            res.status(404).json(message);
          })
        })
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
    switch(error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  normalizePort(val: number|string): number|string|boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
  }

  bootstrap():void{
    this.server.on('error', this.onError);
    this.server.listen(this.port, ()=>{
    	console.log("Listnening on port " + this.port)
    });
  }

}
