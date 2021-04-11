const url = "https://teachablemachine.withgoogle.com/models/34U7khARe/";

let model, labelContainer, maxPredictions;
// 이 변수로 옷 분석결과 접근하시면 됩니다.
let dress_result = {
    top : [],
    bottom : [],
    outer : []
}

 app.get("/", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      // 위 두 줄을 추가해주면 CORS 를 허용하게 됩니다.
   
      res.send({
    	corsTest: "succeed"
      });
      // 테스트 목적으로 response (응답할) 데이터를 정해주었습니다.
});


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

            img.onload = function() {
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
                        dress_result["bottom"] = data
                    });  
                }
                
            }
        }
        console.log(dress_result);
    })
});



async function init_upload() {
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function predict(image) {
        const prediction = await model.predict(image, false);
        console.log(prediction);
        console.log(image)
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
        let result = [score,name];
        console.log(score);
        console.log(name)
        return new Promise (function(resolve, reject){
            resolve(result);
        }) 
}
