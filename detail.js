$(function() {
    // 监听页面刷新
    window.onbeforeunload = function() {
        return "确认要刷新此页面吗？";
    };
    // 获取页面复制的数据
    function getPageData(id) {
        let data = document.querySelector('#'+id);
        if (!data.value) {
            alert('请复制代码到拼多多相应页面,然后再来你操作');
            return;
        }
        return JSON.parse(data.value);
    }
    // 删除输入框的数据
    function clearTextareaValue(id) {
        document.querySelector('#'+id).value = '';
    }

    // getProduct 获取产品数据
    function getProduct(data) {
        let goods = data.goods;
        if (!goods) {
            alert('请复制代码到拼多多相应页面,然后再来你操作');
            return;
        }
        let productModel = {
            topGallery0: goods.topGallery[0],   // 主图
            goodsID: goods.goodsID,
            goodsName: goods.goodsName,
            sideSalesTip: goods.sideSalesTip,
            skus: goods.skus,
            skusDes: getSkusDes(goods.skus)
        };
        return productModel;
    }

    // 获取sku的描述文案字符串
    function getSkusDes(skus) {
        const skusDesArr = [];
        skus.forEach(function(ele) {
            let str = '【';
            ele.specs.forEach(function(subEle) {
                str += subEle.spec_value + ' ';
            });
            str += `(${ele.groupPrice})】`;
            skusDesArr.push(str);
        });
        return skusDesArr.join('，');
    }

    // 讲数据展示到表格中
    function addCurrentToTable(product) {
        let table = $('#table');
        let trDom = $(`<tr class="row">
            <td class="col-md-1"><img class="product_img" src=${product.topGallery0} /></td>
            <td class="col-md-2">${product.goodsName}</td>
            <td class="col-md-1">${product.goodsID}</td>
            <td class="col-md-1">${product.sideSalesTip}</td>
            <td class="col-md-7">${product.skusDes}</td>
        </tr>`);
        table.append(trDom);
    }

    // 页面上的产品数据表格JSON
    let dataList = [];
    let commentList = [];
    // 筛选并存储数据
    document.querySelector('#saveData').addEventListener('click', function() {
        const data = getPageData('data');
        const product = getProduct(data);
        dataList.push(product);
        addCurrentToTable(product);
        clearTextareaValue('data');
        // console.log(dataList);
    });

    /** ---------------------------------------------评论数据收集和整理------------------------------------------------ */


    // getProduct 获取产品数据
    function getCommentObject(commentObject, currentProductId, data) {
        if (commentObject[currentProductId]) {
            commentObject[currentProductId] = commentObject[currentProductId].concat(data);
        } else {
            commentObject[currentProductId] = data;
        }
        return commentObject;
    }

    // 将评论数据量写入表格
    function addCurrentToCommentTable(commentObject) {
        let table = $('#tableComment');
        let str = `<tr class="row">
            <th class="col-md-2">产品ID</th>
            <th class="col-md-2">已录入数据量</th>
        </tr>`;
        for (const key in commentObject) {
            if (commentObject.hasOwnProperty(key)) {
                const element = commentObject[key];
                str += `<tr class="row">
                    <td class="col-md-2">${key}</td>
                    <td class="col-md-2">${element.length}</td>
                </tr>`;
            }
        }
        table.html(str);
    }

    // 更新当前产品id,只有当数据量大于1且存在goodsId
    function updateCurrentProductId(dataList, currentProductId) {
        let res = currentProductId;
        if (dataList.length >= 1 && dataList[0].goodsId) {
            res = dataList[0].goodsId;
        }
        document.querySelector('#currentInputProduct').text = res;
        return res;
    }

    let currentProductId = '';
    let commentObject = {};
    // 评论模态框弹出
    document.querySelector('#commentModel').addEventListener('click', function() {
        document.querySelector('#model').style.display = 'block';
    });
    // 评论模态框关闭
    document.querySelector('#closeCommentModel').addEventListener('click', function() {
        document.querySelector('#model').style.display = 'none';
    });

    // 评论数据暂存
    document.querySelector('#saveCommentData').addEventListener('click', function() {
        let pageData = getPageData('commentData').data;
        clearTextareaValue('commentData');
        currentProductId = updateCurrentProductId(pageData, currentProductId);
        commentObject = getCommentObject(commentObject, currentProductId, pageData);
        addCurrentToCommentTable(commentObject);
    });

    /** -------------------------------------评论数据分析------------------------------------------- */
    // 组装成echarts需要的数据
    function getEchartsData(commentObject) {
        let arr = [];
        for (const key in commentObject) {
            if (commentObject.hasOwnProperty(key)) {
                const element = commentObject[key];
                arr.push(getEchartsOptions(key, element));
            }
        }
        return arr;
    }
    // echarts的配置数据筛选
    function getEchartsOptions(productId, commentList) {
        const obj = {};
        commentList.forEach(function(ele) {
            let specStr = getSkuSpec(ele.specs);
            if (obj[specStr]) {
                obj[specStr]++;
            } else {
                obj[specStr] = 1;
            }
        });
        const options = {
            title: {
                text: `当前产品ID: ${productId}; 共计数据:${commentList.length}`
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '4%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.1]
            },
            yAxis: {
                type: 'category',
                data: Object.keys(obj)
            },
            series: [
                {
                    name: '数据量',
                    type: 'bar',
                    data: Object.values(obj)
                }
            ]
        }
        return options;
    }

    // 获取sku描述
    function getSkuSpec(specs) {
        let arr = [];
        let res = '';
        if (specs) {
            arr = JSON.parse(specs);
        }
        arr.forEach(function(element) {
            res += element.spec_value + ' ';
        });
        return res;
    }

    // 初始化echarts表
    function initEcharts(echartsOptions) {
        echartsOptions.forEach(function(element, index) {
            $('#myEchartsWrapper').append(`<div id="chart${index}" style="width: 2000px;height:400px;"></div>`);
            // 基于准备好的dom，初始化echarts实例
            let myChart = echarts.init(document.getElementById(`chart${index}`));
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(element);
        });
    }

    let echartsOptions = [];
    // 评论数据分析
    document.querySelector('#analyze').addEventListener('click', function() {
        if (Object.keys(commentObject).length <= 0) {
            alert('请先录入评论数据');
            return;
        }
        echartsOptions = getEchartsData(commentObject);
        console.log(echartsOptions);
        initEcharts(echartsOptions);
    });

    /* -----------------------------------导出excel ------------------------------*/
    /**
     * 通用的打开下载对话框方法，没有测试过具体兼容性
     * @param url 下载地址，也可以是一个blob对象，必选
     * @param saveName 保存文件名，可选
     */
    function openDownloadDialog(url, saveName)
    {
        if(typeof url == 'object' && url instanceof Blob)
        {
            url = URL.createObjectURL(url); // 创建blob地址
        }
        var aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
        var event;
        if(window.MouseEvent) event = new MouseEvent('click');
        else
        {
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
    }

    // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
    function sheet2blob(sheet, sheetName) {
        sheetName = sheetName || 'sheet1';
        var workbook = {
            SheetNames: [sheetName],
            Sheets: {}
        };
        workbook.Sheets[sheetName] = sheet;
        // 生成excel的配置项
        var wopts = {
            bookType: 'xlsx', // 要生成的文件类型
            bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
            type: 'binary'
        };
        var wbout = XLSX.write(workbook, wopts);
        var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
        // 字符串转ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        return blob;
    }

    // 导出excel
    function exportExcel(data) {
        var sheet = XLSX.utils.json_to_sheet(data);
        openDownloadDialog(sheet2blob(sheet), '导出.xlsx');
    }

    // 评论导出数据整理
    function commentFileData(commentObject) {
        let arr = [];
        const obj = {};
        for (const key in commentObject) {
            if (commentObject.hasOwnProperty(key)) {
                const eleArr = commentObject[key];
                eleArr.forEach(function (subEle) {
                    let specStr = getSkuSpec(subEle.specs);
                    if (obj[specStr]) {
                        obj[specStr]++;
                    } else {
                        obj[specStr] = 1;
                    }
                })
                arr.push([key].concat(Object.keys(obj)));
                arr.push(['数量'].concat(Object.values(obj)));
            }
        }
        return arr;
    }

    document.querySelector('#export').addEventListener('click', function() {
        // 导出产品列表
        exportExcel(dataList);
        // 导出评论列表
        exportExcel(commentFileData(commentObject));
    });
});
