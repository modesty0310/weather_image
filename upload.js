const url = "https://teachablemachine.withgoogle.com/models/34U7khARe/";

let mainImg="";
function modal(id) {
    var zIndex = 9999;
    var modal = document.getElementById(id);

    // 모달 div 뒤에 희끄무레한 레이어
    var bg = document.createElement('div');
    bg.setStyle({
        position: 'fixed',
        zIndex: zIndex,
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        // 레이어 색갈은 여기서 바꾸면 됨
        backgroundColor: 'rgba(0,0,0,0.4)'
    });
    document.body.append(bg);

    // 닫기 버튼 처리, 시꺼먼 레이어와 모달 div 지우기
    modal.querySelector('.modal_close_btn').addEventListener('click', function() {
        bg.remove();
        modal.style.visibility = "hidden";
    });

    modal.setStyle({
        position: 'fixed',
        visibility: 'visible',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',

        // 시꺼먼 레이어 보다 한칸 위에 보이기
        zIndex: zIndex + 1,

        // div center 정렬
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        msTransform: 'translate(-50%, -50%)',
        webkitTransform: 'translate(-50%, -50%)'
    });
}

// Element 에 style 한번에 오브젝트로 설정하는 함수 추가
Element.prototype.setStyle = function(styles) {
    for (var k in styles) this.style[k] = styles[k];
    return this;
};

document.getElementById('avatar-preview').addEventListener('click', function() {
    // 모달창 띄우기
    console.log(mainImg);
    $('#img_view').attr("src",mainImg);
    modal('img_modal');
});




let dress_result = {
    top : [],
    bottom : [],
    outer : []
}

let model, maxPredictions;
// 이 변수로 옷 분석결과 접근하시면 됩니다.

window.onload = function(){
    $("#div_load_image").hide();
    $("main").hide();
}


function readURL(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            mainImg=e.target.result;
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#imageUpload").change(async function(e) {
    dress_result = {
        top : [],
        bottom : [],
        outer : []
    }   
    $("#div_load_image").show();
    $("#body").css('opacity','0.5');
    
    $('canvas').remove();
    readURL(this);
    await init_upload();
    let formData = new FormData();
    let photoFile = document.getElementById("imageUpload");
    formData.append("image", photoFile.files[0]);
    console.log(formData);
    console.log(photoFile.files[0])
    console.log(photoFile);

    axios.post('https://dapi.kakao.com/v2/vision/product/detect', formData, {
        headers: {
            'Authorization': 'KakaoAK cb757ada2780cbc7384f8f72a3902585',
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {

        console.log(res.data);
        let width = res.data.result.width
        let height = res.data.result.height
        let obj = document.getElementById("body");
        let outer = document.createElement("img");

        
            for (let i = 0; i < res.data.result.objects.length; i++) {
                //objects 배열인덱스 마다 이미지 자르기
                let x1 = res.data.result.objects[i].x1;
                let x2 = res.data.result.objects[i].x2;
                let y1 = res.data.result.objects[i].y1;
                let y2 = res.data.result.objects[i].y2;
    
                let newCanvas = document.createElement("canvas");
                newCanvas.setAttribute("id", "canvas" + i);
                newCanvas.style.border = "solid 1px black";
                newCanvas.style.display = "block";
                obj.appendChild(newCanvas);
    
                $("#canvas" + i).hide();
    
                let cv = document.getElementById('canvas' + i);
    
                let draw = cv.getContext("2d");
                cv.height = (y2 - y1) * height;
                cv.width = (x2 - x1) * width;
    
                let img = new Image();
                img.src = URL.createObjectURL(e.target.files[0]);
    
                img.onload = async function() {
                    draw.drawImage(img, x1 * width, y1 * height, x2 * width - x1 * width, y2 * height - y1 * height +20, 0, 0, (x2 - x1) * width, (y2 - y1) * height)
                    if (res.data.result.objects[i].class == "t-shirts" || res.data.result.objects[i].class == "shirts") {
                        let img_top = document.getElementById('canvas' + i)
                        console.log("상의");
                        predict(img_top).then(function(data){
                            dress_result["top"] = data;
                        });  
                    } else if (res.data.result.objects[i].class == "outer") {
                        outer.src = newCanvas.toDataURL();
                        console.log("외투")
                        dress_result["outer"] = 1;
                    } else if (res.data.result.objects[i].class == "pants") {
                        let img_bottom = document.getElementById('canvas' + i);
                        console.log("하의");
                        predict(img_bottom).then(function(data){
                            dress_result['bottom'] = data
                        });  
                    }
                    
                }
            }
            console.log(dress_result)
    })
    setTimeout(() => check_dress(temp_json,dress_result).then(function(){
        $("main").hide();
        console.log(dress_result["top"].length)
        if(dress_result["top"].length==0 && dress_result["bottom"].length==0 && dress_result["outer"].length==0){
            console.log("testestset");
            let graph=document.querySelector(".graph");
            let resu=document.querySelector("#logic_clothes_select");
            graph.innerText = "Not Found";
            // resu.innerText="Not Found";
            $(".graph").show();
            
        }else{
            $('ul').empty();

            for(let i=0; i<nameData.length; i++){
                $('ul').append("<li><em>"+nameData[i]+"</em><span>"+scoreData[i]+"</span></li>")
            }
            createPie(".pieID.legend", ".pieID.pie");
            scoreData.length = 0;
            nameData.length = 0;
            idx = 0;
            $(".graph").hide();
            $("main").show();
        }
        $("#div_load_image").hide();
        $("#body").css('opacity','');
    }), 5000)
});

let scoreData = new Array();
let nameData = new Array();
let idx = 0;


async function init_upload() {
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function predict(image) {
        const prediction = await model.predict(image, false);
        let score = 0;
        let name = "";
        for (let i = 0; i < maxPredictions; i++) {
            if(score < prediction[i].probability.toFixed(2)){
                score = prediction[i].probability.toFixed(2);
                name = prediction[i].className
            }
            const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        }

        scoreData[idx] = score;
        nameData[idx] = name;
        idx++;

        let result = name;
        return new Promise (function(resolve, reject){
            resolve(result);
        }) 
}

async function check_dress(temp_json,result){
   
    const temp_defferent=document.getElementById("logic_temp_defferent");
    //const rain_cloud=document.getElementById("logic_rain_cloud");
    const Clothes_select=document.getElementById("logic_clothes_select");
    //temp 최소 최대값 구할 자리
    let max_temp = Math.max.apply(null, f_tempArray);
    let min_temp = Math.max.apply(null, f_tempArray);
    //console.log(temp_json);
    //temp 최소값과 최대값 빼서 일교차 구하고 일교차가 10도 이상이면 겉옷 챙기라는 문구 보내기 
    if(result.top == "" && result.outer == ""){
        Clothes_select.innerText="상체가 나오게 사진을 찍어 주세요.";
    }else if(result.pants == ""){
        Clothes_select.innerText="하체가 나오게 사진을 찍어 주세요.";
    }else if(result.top == "" && result.outer == ""&&result.pants == "")
    {
        Clothes_select.innerText="사진을 찍어 주세요.";
    }
    else{
        if(max_temp-min_temp>=10)
        {
            temp_defferent.innerText="오늘 일교차가 크니 겉옷을 챙기세요";
        
            //각 온도에 맞는 옷 추천
            if(temp_json>=23 && temp_json<=26)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom =="반바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json>=27){
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if(result.outer="1"||(result.top=="긴팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")||(result.top=='["긴팔"]'&&result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")){
                    console.log("날씨가 더우니 좀 더 가볍게 입으세요");
                    Clothes_select.innerText="날씨가 더우니 좀 더 가볍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json>=17&&temp_json<=22){
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                        
                if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            // else if(temp_json>=17||temp_json<=19)
            // {
            //     console.log("현재"+temp_json+"℃ 입니다.\n ");
                
            //     if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
            //     {console.log("날씨가 추우니 좀 더 두껍게 입으세요");}
            //     else{
            //         console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
            //     }
            // }
            else if(temp_json>=12&&temp_json<=16)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요.";
                }else if((result.top=="반팔"&&result.bottom=="긴바지")){
                    Clothes_select.innerText="날씨가 추우니 맨투맨이나 얇은 아우터를 입는것을 추천합니다.";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요. 12~16");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json<=11)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지")){
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
        }
        else{
            temp_defferent.innerText="오늘 일교차는 크지 않아요";
            //각 온도에 맞는 옷 추천
            if(temp_json>=23 && temp_json<=26)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom=="반바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else if(result.outer="1")
                {
                    console.log("날씨가 더우니 좀 더 얇게 입으세요");
                    Clothes_select.innerText="날씨가 더우니 좀 더 가볍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json>=27){
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if(result.outer="1"||(result.top=="긴팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")||(result.top=='["긴팔"]'&&result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")){
                    console.log("날씨가 더우니 좀 더 가볍게 입으세요");
                    Clothes_select.innerText="날씨가 더우니 좀 더 가볍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json>=17&&temp_json<=22){
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                        
                if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            // else if(temp_json>=17||temp_json<=19)
            // {
            //     console.log("현재"+temp_json+"℃ 입니다.\n ");
                
            //     if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
            //     {console.log("날씨가 추우니 좀 더 두껍게 입으세요");}
            //     else{
            //         console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
            //     }
            // }
            else if(temp_json>=12&&temp_json<=16)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지"))
                {
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요.";
                }else if((result.top=="반팔"&&result.bottom=="긴바지")){
                    Clothes_select.innerText="날씨가 추우니 맨투맨이나 얇은 아우터를 입는것을 추천합니다.";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요. 12~16");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
            else if(temp_json<=11)
            {
                console.log("현재"+temp_json+"℃ 입니다.\n ");
                
                if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")){
                    console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                    Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
                }
                else{
                    console.log("현재 날씨에 입기 딱 좋은 복장이네요.");
                    Clothes_select.innerText="현재 날씨에 입기 딱 좋은 복장이네요.";
                }
            }
        }
    }


}



/* chart */
function sliceSize(dataNum, dataTotal) {
    return (dataNum / dataTotal) * 360;
  }
  function addSlice(sliceSize, pieElement, offset, sliceID, color) {
    $(pieElement).append("<div class='slice "+sliceID+"'><span></span></div>");
    var offset = offset - 1;
    var sizeRotation = -179 + sliceSize;
    $("."+sliceID).css({
      "transform": "rotate("+offset+"deg) translate3d(0,0,0)"
    });
    $("."+sliceID+" span").css({
      "transform"       : "rotate("+sizeRotation+"deg) translate3d(0,0,0)",
      "background-color": color
    });
  }
  function iterateSlices(sliceSize, pieElement, offset, dataCount, sliceCount, color) {
    var sliceID = "s"+dataCount+"-"+sliceCount;
    var maxSize = 179;
    if(sliceSize<=maxSize) {
      addSlice(sliceSize, pieElement, offset, sliceID, color);
    } else {
      addSlice(maxSize, pieElement, offset, sliceID, color);
      iterateSlices(sliceSize-maxSize, pieElement, offset+maxSize, dataCount, sliceCount+1, color);
    }
  }
  function createPie(dataElement, pieElement) {
    var listData = [];
    $(dataElement+" span").each(function() {
      listData.push(Number($(this).html()));
    });
    var listTotal = 0;
    for(var i=0; i<listData.length; i++) {
      listTotal += listData[i];
    }
    var offset = 0;
    var color = [
      /* "cornflowerblue", 
      "olivedrab", 
      "orange", 
      "tomato", 
      "crimson", 
      "purple", 
      "turquoise", 
      "forestgreen", 
      "navy" */
      "ginsboro", 
      "gray",
      "black",
      "silver"
    ];
    for(var i=0; i<listData.length; i++) {
      var size = sliceSize(listData[i], listTotal);
      iterateSlices(size, pieElement, offset, i, 0, color[i]);
      $(dataElement+" li:nth-child("+(i+1)+")").css("border-color", color[i]);
      offset += size;
    }
  }
  /* createPie(".pieID.legend", ".pieID.pie"); */
  


