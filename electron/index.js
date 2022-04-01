import { app, BrowserWindow,Menu } from 'electron';

var express=require("express");
var app2 = express();
var path = require('path');
var glob = require("glob");
var async = require('async');
var csv = require("csvtojson");
const child = require('child_process');
let arr_disk = new Array();//Массив с дисками
let result = new Array();//Массив файлов с данными

Menu.setApplicationMenu(false);

if (require('electron-squirrel-startup')){ 
  app.quit();
}
let mainWindow;
var listDisk;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    minWidth: 800,
    minHeight: 650,
    icon: __dirname + `/image/icon.png`,
    });
  mainWindow.setTitle("");
  mainWindow.setBackgroundColor('#000') 
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  }); 
};
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null){
    createWindow();
  }
});

//поиск файлов с названием DATALOG... и запись в массив result
function select_files(path,callback){
  var options = {
    cwd: path, 
    absolute:true,
    nodir :true
      }
      glob("DATALOG*", options , function (err, files){
        if(err){
            console.log('error');
            callback('error');
          }
          else{
            result.push(files);
            callback();  
          }
        }) ;
}
//получаем список всез дисков и записываем в массив arr_disk
function loadDisk(callback)
{
   child.exec('wmic logicaldisk get name', (err, stdout) =>{
      if(err){
        console.log('error');
        callback('error');
      }
      else{
        arr_disk = stdout.split('\r\r\n')
        .filter(value => /[A-Za-z]:/.test(value))
        .map(value => value.trim());
        callback();
      }
    });
}
//выдает все пути файлов в корне диска с названием DATALOG...
 app2.get('/files',async(req,res)=>{
    loadDisk( function(returnValue){
     result = new Array(); //обнуляем массив с файлами 
     if(arr_disk.length>0){
         async.each(arr_disk, function (row, callback){ //бходим все диски и ищем там нужные файлы
            select_files(row,callback);
           }, 
           function(err){
              if( err ) {
                console.log('error');
              } 
              else{
                 res.json(result); //после прохождения всех дисков отправляем массив  путями файлов
              }
          });
      }
      else{
        res.json(result);
      }
   });
});
//на вход получаем путь к файлу csv, выдаем json с данными из файла
app2.post('/load_file', async(req, res) => {
  var fileName= req.query.fileName;
  const jsonArray=await csv().fromFile(fileName);
   res.send(jsonArray); 
});
app2.listen(8001);