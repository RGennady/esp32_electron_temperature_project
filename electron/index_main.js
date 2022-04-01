var myChart ;
var myChart2;
var mySlider;
var $propertiesForm = $('.mall-category-filter');
var finish= new Array();

function closeWindow(){
  window.close();
}

$(document).ready(function(){
    var map = $("#loadingScreen");
    map.stop(); 
    map.animate({opacity: 1 }, 2200, function() 
    {
        $(this).show();
    });
    setTimeout(function()
    {
       loadFiles();
    },2000); 
});


function loadFiles(){
  var settings = 
  {
    "url": "http://localhost:8001/files",
    "method": "GET",
    "timeout": 0,
    "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
    },
    success : function(){   
      document.getElementById("content").hidden = false; 
      document.getElementById("main").style.cssText = "background:#fff";
      var map = $("#loadingScreen");
      map.stop(); 
     if(map.is(':visible')){
        map.animate({ right:493, opacity: 0 }, 2200, function(){
          $(this).hide();
          document.getElementById("loadingScreen").hidden = true; 
          document.getElementById("content").hidden = false; 
        });
      }
      $('#myModalBoxLoading').modal('show');
    },
    error: function (jqXHR, exception){
      document.getElementById("content").hidden = false; 
      document.getElementById("main").style.cssText = "background:#fff";
      var map = $("#loadingScreen");
      map.stop(); 
      if(map.is(':visible')){
        map.animate({ right:493, opacity: 0 }, 2200, function(){
          $(this).hide();
          document.getElementById("loadingScreen").hidden = true; 
        });
      }
    }
  };
  $.ajax(settings).done(function (response){
    $("#modalTable tbody tr").remove();
    var nullFiles=true;
    if(response.length>0){
      for (let i = 0; i < response.length; i++){
        if(response[i].length>0){
          nullFiles=false;
          for (let j = (response[i].length-1); j >= 0;j--){
            let html='<tr class="text-center"><td>'+response[i][j]+'</td><td style="width: 80px"><i onclick="loadFile(&quot;'+response[i][j]+'&quot;)"  style="color:green" class="far fa-check-circle fa-2x"></i></td></tr>';
            $('#modalTable tbody').append(html);
           }
        }
      }
    }
    if (nullFiles){ //если нужные файлы не найдены 
      document.getElementById("exampleModalText").innerHTML="Съемный носитель с данными не обнаружен. Проверьте подключение" ; 
      document.getElementById("modalTable").hidden = true; 
    }
    else{
      document.getElementById("exampleModalText").innerHTML="Выберете нужный вам файл:" ; 
      document.getElementById("modalTable").hidden = false; 
    }
  });
}
function loadFile(fileName){
    var settings = 
      {
          "url": "http://localhost:8001/load_file?fileName="+fileName,
          "method": "POST",
          "timeout": 0,
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
           }
    };
    $.ajax(settings).done(function (response){
     $("#table tbody tr").remove();
     if(response.length>1){
        for (let i = 0; i < response.length-1; i++){
          var html ='<tr class="text-center"><td>'+response[i].temperature+'</td><td>'+response[i].start_time+'</td><td>'+response[i].end_time+'</td><td>'+response[i].PE+'</td></tr>';
          $('#table tbody').append(html);
        }
        finish=response;
        drawChart(response,true);
     }
    $('#myModalBoxLoading').modal('hide');
  });
}

function drawChart(coords, isfull){
  if (myChart){//очищаем график
    myChart.destroy();  
   }
   if (myChart2){//очищаем график
    myChart2.destroy();  
   }
   var PE = new Array();
   var PE2 = new Array();
   var time= new Array();
   var temperature= new Array();
   var maxPe=0;
   for (let j = 0; j < coords.length; j++){
      PE.push(coords[j].PE);
      if(coords[j].PE>maxPe)
      {
        PE2.push(coords[j].PE);
        maxPe=(coords[j].PE);
      }
      else
      {
        PE2.push(maxPe);
      }
      temperature.push(coords[j].temperature);
      time.push(coords[j].start_time);
    }
    var ctx = document.getElementById('myChart').getContext('2d');
    window.myChart= new Chart(ctx,{
    type: 'line',
    data:{
      labels: time,
      datasets: [
      { 
         data: PE,
         label: "PE",
         borderColor: "#8e5ea2",
         fill: false,
         yAxisID: 'y'
      }, 
      { 
        data: temperature,
        label: "Температура",
        borderColor: "#3e95cd",
        fill: false,
        yAxisID: 'y1',
        }, 
        ]
      },
      options:{
        plugins: {
           annotation: {
            annotations: [
              {
                dragData: true,
                  type: 'line',
                  scaleID: 'x',
                  borderWidth: 5,
                  value: time[0],
                  borderColor: "red",
                  label:{
                    content: "",
                    enabled: true
                  }
              },
              {
                  type: 'line',
                  scaleID: 'x',
                  borderWidth: 5,
                  value: time[time.length-1],
                  borderColor: "red",
                  label: 
                  {
                    content: "",
                    enabled: true
                  },
              }
            ]
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        title:{
          display: true,
          text: ' '
        },
        scales:{
          x: {
            display: true,
            title: {
                display: true,
                text: 'Время',
                font: {
                  size: 20,
                  weight: 'bold',
                  lineHeight: 0.5,
                },
              }
          },
          y: {
             min: 0,
             display: true,
             type: 'linear',
             title:{
             display: true,
                color: '#8e5ea2',
                text: 'PE',
                 font:{
                  size: 20,
                  weight: 'bold',
                  lineHeight: 0.5,
                },
            },
            ticks: {
             stepSize: 0.05
            },
            position: 'right'
          },
          y1: 
          {
            min: 0,
            display: true,
            title:{
                display: true,
                color: '#3e95cd',
                text: 'Температура',
                font:{
                  size: 20,
                  weight: 'bold',
                  lineHeight: 0.5,
                },
              }
          }, 
        }
      }
    }); 
 if(isfull){
      var rangers =   {};
      var rangers_value = new Array();
      document.getElementById("all-graph-btn").hidden = true; 
      rangers['min'] = HHMMSSToms(time[0]); 
      for (let i = 0; i < (time.length-1); i++){
            if ( i < time.length-1 ){ 
             rangers_value.push(HHMMSSToms(time[i]));
             rangers[i] =  HHMMSSToms(time[i]) ;
            }
        }
      rangers_value.push(HHMMSSToms(time[time.length-1]));
      rangers['max'] = HHMMSSToms(time[time.length-1]);   
      var xaxis = myChart.scales['x'];
      var yaxis = myChart.scales['y'];
      if(document.getElementById('mall-slider-handles').noUiSlider===undefined){
        $('#mall-slider-handles').each(function (){
            mySlider= this;
            noUiSlider.create(mySlider,{
                start: [HHMMSSToms(time[0]),HHMMSSToms(time[time.length-1])],
                connect: true,
                range: rangers
               }).on('change', function (values){
                 var closest = null;
                $.each(rangers_value, function(){
                  if (this <= values[0] && (closest == null || (values[0] - this) < (values[0] - closest))){
                   closest = this;
                  }
                });
                var start_line=msToTime(closest);
                myChart.options.plugins.annotation.annotations[0].value=start_line;
                var closest2 = null;
                $.each(rangers_value, function(){
                  if (this <= values[1] && (closest2 == null || (values[1] - this) < (values[1] - closest2))){
                     closest2 = this;
                    }
                });
                var finish_line=msToTime(closest2);
                myChart.options.plugins.annotation.annotations[1].value=finish_line;
                myChart.update(); 
                $propertiesForm.trigger('submit');
              });
        }) 
       }
       else{
         var rangers =   {};
         var rangers_value = new Array();
         rangers['min'] = HHMMSSToms(time[0]); 
         for (let i = 0; i < (time.length-1); i++){
              if ( i < time.length-1 ){ 
               rangers_value.push(HHMMSSToms(time[i]));
               rangers[i] =  HHMMSSToms(time[i]) ;
              }
          }
          rangers_value.push(HHMMSSToms(time[time.length-1]));
          rangers['max'] = HHMMSSToms(time[time.length-1]);   
          mySlider.noUiSlider.updateOptions({ 
            start: [HHMMSSToms(time[0]),HHMMSSToms(time[time.length-1])],
            connect: true,
            range: rangers
          });
        }
}
else{
    var rangers =   {};
    var rangers_value = new Array();
     rangers['min'] = HHMMSSToms(time[0]); 
    for (let i = 0; i < (time.length-1); i++){
          if ( i < time.length-1 ){ 
           rangers_value.push(HHMMSSToms(time[i]));
           rangers[i] =  HHMMSSToms(time[i]) ;
          }
      }
    rangers_value.push(HHMMSSToms(time[time.length-1]));
    rangers['max'] = HHMMSSToms(time[time.length-1]);   
     document.getElementById("all-graph-btn").hidden = false; 
        mySlider.noUiSlider.updateOptions({ 
             start: [HHMMSSToms(time[0]),HHMMSSToms(time[time.length-1])],
            connect: true,
            range: rangers
        });
 }
 var canvas = document.getElementById("myChart2");
 var ctx2 = canvas.getContext('2d');
 window.myChart2= new Chart(ctx2,{
    type: 'line',
    data: {
      labels: time,
      datasets: [
      { 
         data: PE2,
          label: "PE",
          borderColor: "#8e5ea2",
          fill: false,
          yAxisID: 'y'
      }, 
      { 
         data: temperature,
        label: "Температура",
        borderColor: "#3e95cd",
        fill: false,
        yAxisID: 'y1',
        }, 
        ]
      },
      options:{
        responsive: true,
        maintainAspectRatio: false,
        title:{
          display: true,
          text: ' '
        },
        scales:{
          x: {
              display: true,
              title: {
                display: true,
                text: 'Время',
                font: {
                  size: 20,
                  weight: 'bold',
                  lineHeight: 0.5,
                },
              }
            },
          y: {
              min: 0,
              display: true,
              type: 'linear',
              title:{
                  display: true,
                  color: '#8e5ea2',
                  text: 'PE',
                   font:{
                    size: 20,
                    weight: 'bold',
                    lineHeight: 0.5,
                  },
              },
              ticks: {
               stepSize: 0.05
              },
              position: 'right'
          },
          y1:{
            stacked: true,
            min: 0,
            display: true,
            title:{
              display: true,
              color: '#3e95cd',
              text: 'Температура',
              font:{
                size: 20,
                weight: 'bold',
                lineHeight: 0.5,
              },
            }
          }, 
        }
      }
   }); 
}
function msToTime(totalSeconds){
  var hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds % 60;
  return String(hours)+":"+String(minutes)+":"+String(seconds);
}
function HHMMSSToms(value){
    var a = value.toString().split(':');
    var ms = (+a[0]) * 3600 + (+a[1]) * 60 + (+a[2]);
    return ms;
}
function cutChat1(){
  var lower = (myChart.options.plugins.annotation.annotations[0].value); 
  var upper = (myChart.options.plugins.annotation.annotations[1].value);
  var index_lower = search(finish, lower);
  var index_upper=search(finish, upper);
  var cut_finish_array= new Array();
  for (let j = index_lower; j <= index_upper; j++) 
  {
     cut_finish_array.push(finish[j]);
  }
  drawChart(cut_finish_array,false);
}

function allGraphiv(){
  drawChart(finish,true);
}

function search(source, start_time){
  for (let j = 0; j < source.length; j++){
      if(source[j].start_time==start_time){
        return j;
      }
  }
  return -1;
}