const url = "https://teachablemachine.withgoogle.com/models/34U7khARe/";

let dress_result = {
    top : [],
    bottom : [],
    outer : []
}





let model, maxPredictions;
// 이 변수로 옷 분석결과 접근하시면 됩니다.

window.onload = function(){
    $("#div_load_image").hide();
}



function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#imageUpload").change(async function(e) {
    $("#div_load_image").show();
    $("#body").css('opacity','0.5');
    
    $('canvas').remove();
    readURL(this);
    await init_upload();
    var formData = new FormData();
    var photoFile = document.getElementById("imageUpload");
    formData.append("image", photoFile.files[0]);

    console.log(formData);

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
            $("#div_load_image").hide();
            $("#body").css('opacity','');

        //  get_data().then(function(result){
        //     check_dress(temp_json[0],result);
        //  });
    })
    setTimeout(() => check_dress(temp_json,dress_result), 2000)
});




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
        let result = name;
        return new Promise (function(resolve, reject){
            resolve(result);
        }) 
}

async function check_dress(N_Temp,result){
    const Daily_Temperature_Different=document.getElementById("logic_temperature_different");

    const Clothes_select=document.getElementById("logic_clothes_select");
    //temp 최소 최대값 구할 자리
    let max_temp = Math.max.apply(null, f_tempArray);
    let min_temp = Math.max.apply(null, f_tempArray);
    //console.log(N_Temp);
    //temp 최소값과 최대값 빼서 일교차 구하고 일교차가 10도 이상이면 겉옷 챙기라는 문구 보내기 
    if(max_temp-min_temp>=10)
    {
        Daily_Temperature_Different.innerText="오늘 일교차가 크니 겉옷을 챙기세요";
    
        //각 온도에 맞는 옷 추천
        if(N_Temp>=23 && N_Temp<=26)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom =="반바지"))
            {
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp>27){
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if(result.outer="1"||(result.top=='["긴팔"]'&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")||(result.top=='["긴팔"]'&&result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")){
                console.log("날씨가 더우니 좀 더 가볍게 입으세요");
                Clothes_select.innerText="날씨가 더우니 좀 더 가볍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp>=17&&N_Temp<=22){
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
                    
            if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
            {
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        // else if(N_Temp>=17||N_Temp<=19)
        // {
        //     console.log("현재"+N_Temp+"℃ 입니다.\n ");
            
        //     if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
        //     {console.log("날씨가 추우니 좀 더 두껍게 입으세요");}
        //     else{
        //         console.log("complete");
        //     }
        // }
        else if(N_Temp>=12&&N_Temp<=16)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
            {
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete 12~16");
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp<=10)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")){
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
    }
    else{
        //각 온도에 맞는 옷 추천
        if(N_Temp>=23 && N_Temp<=26)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
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
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp>27){
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if(result.outer="1"||(result.top=="긴팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")||(result.top=='["긴팔"]'&&result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")){
                console.log("날씨가 더우니 좀 더 가볍게 입으세요");
                Clothes_select.innerText="날씨가 더우니 좀 더 가볍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp>=17&&N_Temp<=22){
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
                    
            if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
            {
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
        // else if(N_Temp>=17||N_Temp<=19)
        // {
        //     console.log("현재"+N_Temp+"℃ 입니다.\n ");
            
        //     if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지"))
        //     {console.log("날씨가 추우니 좀 더 두껍게 입으세요");}
        //     else{
        //         console.log("complete");
        //     }
        // }
        else if(N_Temp>=12&&N_Temp<=16)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            if((result.top=="민소매" && result.bottom=="반바지")||(result.top=="민소매" && result.bottom=="긴바지")||(result.top=="반팔"&&result.bottom=="반바지")||(result.top=="반팔"&&result.bottom=="긴바지")||(result.top=="긴팔"&&result.bottom=="반바지"))
            {
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log(result.top);
                console.log();
                console.log("complete 12~16" );
                Clothes_select.innerText="complete";
            }
        }
        else if(N_Temp<=10)
        {
            console.log("현재"+N_Temp+"℃ 입니다.\n ");
            
            if((result.top=="민소매"&& result.bottom=="긴바지")||(result.top=="민소매"&& result.bottom=="반바지")||(result.top=="반팔"&& result.bottom=="긴바지")||(result.top=="반팔"&& result.bottom=="반바지")){
                console.log("날씨가 추우니 좀 더 두껍게 입으세요");
                Clothes_select.innerText="날씨가 추우니 좀 더 두껍게 입으세요";
            }
            else{
                console.log("complete");
                Clothes_select.innerText="complete";
            }
        }
    }
}

