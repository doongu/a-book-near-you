function parserYes24Name(nameHtml) {
    var flag = '<li><a href="/Mall/UsedStore/Detail/';
    var index = nameHtml.indexOf(flag, 0)
    var codeNameList = new Array();

    while (index > 0) {
        if (index > 0) {
            var appendPath = '';
            var checkAppendPath = true;
            var appendName = '';
            var checkAppendName = 0;

            for (var i = index + flag.length; i < 10000000; i++) {
                if (checkAppendPath == true) {
                    if (nameHtml[i] == '"') {
                        checkAppendPath = false;
                        continue;
                    }
                    appendPath += nameHtml[i];
                }


                if (checkAppendName >= 2) {
                    if (nameHtml[i] == "<") {
                        break;
                    } else {
                        appendName += nameHtml[i];
                    }
                }

                if (nameHtml[i] == '>') {
                    checkAppendName += 1
                }

            }
            codeNameList.push([appendPath, appendName.trimEnd()]);

        }

        index = nameHtml.indexOf(flag, index + 1)

    }

    return codeNameList;

}

function parserYes24Info(nameHtml) {
    var Yes24InfoList = new Array();
    var flagLocal = '주소 : ';
    var index = nameHtml.indexOf(flagLocal, 0)
    var tmpValue = ''
    for (var i = index + flagLocal.length; i < 10000000; i++) {
            if (nameHtml[i] == '<') {
                break;
            }
            tmpValue += nameHtml[i];
    }
    Yes24InfoList.push(tmpValue);


    var flagNumber = '연락처 : ';
    var index = nameHtml.indexOf(flagNumber, 0)
    var tmpValue = ''
    for (var i = index + flagLocal.length; i < 10000000; i++) {
            if (nameHtml[i] == '<') {
                break;
            }
            tmpValue += nameHtml[i];
    }
    Yes24InfoList.push(tmpValue);

    var flagTime = '영업시간 : ';
    var index = nameHtml.indexOf(flagTime, 0)
    var tmpValue1 = ''
    var tmpValue2 = ''
    var flagIndex = true
    for (var i = index + flagTime.length; i < 10000000; i++) {
        if (nameHtml[i] == '<') {
            break;
        }    
        if (nameHtml[i] == '/'){
                flagIndex = false;
                continue
            }    
        if (flagIndex==true){
                tmpValue1 += nameHtml[i]
            }
        else if (flagIndex==false){
            tmpValue2 += nameHtml[i];
        }
    }
    Yes24InfoList.push(tmpValue1, tmpValue2);

    return Yes24InfoList; // [주소, 연락처, 영업시간, 휴관일]

}


function parserYes24Stock(stockHtml) {
    var flag = '<li><a href="/Mall/UsedStore/Detail/';
    var index = nameHtml.indexOf(flag, 0)
    var codeNameList = new Array();

    while (index > 0) {
        if (index > 0) {
            var appendPath = '';
            var checkAppendPath = true;
            var appendName = '';
            var checkAppendName = 0;

            for (var i = index + flag.length; i < 10000000; i++) {
                if (checkAppendPath == true) {
                    if (nameHtml[i] == '"') {
                        checkAppendPath = false;
                        continue;
                    }
                    appendPath += nameHtml[i];
                }


                if (checkAppendName >= 2) {
                    if (nameHtml[i] == "<") {
                        break;
                    } else {
                        appendName += nameHtml[i];
                    }
                }

                if (nameHtml[i] == '>') {
                    checkAppendName += 1
                }

            }
            codeNameList.push([appendPath, appendName.trimEnd()]);

        }

        index = nameHtml.indexOf(flag, index + 1)

    }

    return codeNameList;

}


var returnYes24Info = new Array();
// http://www.yes24.com/Mall/UsedStore/Detail/Seomyeon
async function getYes24Info(i, storeName){ // 재고를 제외하고 JSON명세에 맞춰서 return 해준다.
    var Yes24InfoJson = new Object();



        var url = "http://www.yes24.com/Mall/UsedStore/Detail/" + storeName[i][0];
        var test = storeName[i][1];
        
        await axios.get(url).then(function (result) { // 결과 발생시에만 push
            var data = parserYes24Info(result['data'])
            Yes24InfoJson.lat = '1'; // data[0] 을 좌표로 변환하는 함수 필요 
            Yes24InfoJson.lon = '1';
            // console.log(storeName[i][1]);
            Yes24InfoJson.storeName = test
            Yes24InfoJson.closeDay = data[3];
            Yes24InfoJson.opertingTime = data[2];
            Yes24InfoJson.telNum = data[1];
            Yes24InfoJson.url = url;
            Yes24InfoJson.searchResult = [];
            console.log("통신 결과 : ", Yes24InfoJson);
            // return Yes24InfoJson;
            returnYes24Info.push(Yes24InfoJson);
            
        }).catch(function (error) {
            console.log("에러 발생 : ", error);
        });


}


// <span class="gd_name"> 제목
// <span class="authPub info_auth"> 저자
// <span class="authPub info_pub"> 출판사
// <em class="yes_b"> 가격
// <em class="txC_blue">를 찾아 매장 갯수를 알아놓는다.
//info_row info_storeLoca를 찾는다. => <strong>찾는다. => 부산 서면점 =>  <span class="bit"> => 재고 갯수
// 이후 '부산 서면점', '서울 강서점'등의 결과가 나온다.
// [{id:부산서면점, 제목: 제목, . . ..}, ] 을 돌면서 추가한다.
function getYes24Stock(isbn){
    axios.get("http://www.yes24.com/Product/Search?domain=STORE&query=" + isbn).then(function (result) {
        console.log("STOCK", result['data']);

    }).catch(function (error) {
        console.log("에러 발생 : ", error);
    });
    

}



// var returnInfoData = [];
async function getYes24Names(isbnList){
    const returnValue = await axios.get("http://www.yes24.com/Mall/UsedStore/Detail/Seomyeon").then((result) => {
        var returnData = parserYes24Name(result['data']);

        for(var i = 0; i<returnData.length; i++){
            getYes24Info(i, returnData);
        }

        console.log("HIIIIIIIII", returnYes24Info)
        
        for(var i = 0; i<isbnList.length; i++){
            getYes24Stock(isbnList[i]);
        }


        return returnYes24Info
    }).catch(function (error) {
        console.log("에러 발생 : ", error); // 에러처리 해주기
    });
    return returnValue
};



// function startYes24('9791167850690'){
//     getYes24Names()
// }