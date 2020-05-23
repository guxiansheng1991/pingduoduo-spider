$(function() {
    // saveProduct 保存产品
    function getProduct(data) {
        let goods = data.goods;
        if (!goods) {
            alert('请复制代码到拼多多产品详情页,然后再来你操作, JSON.stringify(window.rawData.store.initDataObj);');
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
    // 获取页面复制的数据
    function getPageData() {
        let data = document.querySelector('#data');
        if (!data.value) {
            alert('请复制代码到拼多多产品详情页,然后再来你操作, JSON.stringify(window.rawData.store.initDataObj);');
            return;
        }
        return JSON.parse(data.value);
    }

    // 获取sku的描述文案字符串
    function getSkusDes(skus) {
        const skusDesArr = [];
        skus.forEach(function(ele) {
            let str = '【';
            ele.specs.forEach(function(subEle) {
                str += subEle.spec_value + ' ';
            });
            str += '】';
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

    // 删除输入框的数据
    function clearTextareaValue() {
        document.querySelector('#data').value = '';
    }

    let dataList = [];
    // 筛选并存储数据
    document.querySelector('#saveData').addEventListener('click', function() {
        const data = getPageData();
        const product = getProduct(data);
        dataList.push(product);
        addCurrentToTable(product);
        clearTextareaValue();
        console.log(dataList);
    });

    // 数据展示与分析
    document.querySelector('#analyze').addEventListener('click', function() {
        
    });
});