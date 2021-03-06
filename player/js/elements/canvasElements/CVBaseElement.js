function CVBaseElement(data,globalData){
    this.data = data;
    this.globalData = globalData;
    this.canvasContext = globalData.canvasContext;
    this.currentAnimData = null;
    this.renderFrame = false;
    this.init();
}

CVBaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

CVBaseElement.prototype.createElements = function(){

};

CVBaseElement.prototype.prepareFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime >= num)
    {
        this.renderFrame = true;
    }else{
        this.renderFrame = false;
        this.currentAnimData = this.data.renderedData[num].an;
        return false;
    }
    this.currentAnimData = this.data.renderedData[num].an;

    if(this.data.hasMask){
        this.maskManager.prepareFrame(num);
    }
};

CVBaseElement.prototype.draw = function(saveFlag){
    if(this.data.type == 'NullLayer'){
        return;
    }
    if(saveFlag !== false){
        this.canvasContext.save();
    }
    if(!this.renderFrame){
        return false;
    }
    var ctx = this.canvasContext;
    var matrixValue;
    if(this.hierarchy){
        var i, len = this.hierarchy.length, animData;
        for(i = len - 1; i>=0 ; i -= 1){
            animData = this.hierarchy[i].getCurrentAnimData();
            matrixValue = animData.matrixArray;
            ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
            ctx.translate(-animData.tr.a[0],-animData.tr.a[1]);
        }
    }
    ctx.globalAlpha = ctx.globalAlpha*this.currentAnimData.tr.o;
    matrixValue = this.currentAnimData.matrixArray;
     ctx.transform(matrixValue[0], matrixValue[1], matrixValue[2], matrixValue[3], matrixValue[4], matrixValue[5]);
     ctx.translate(-this.currentAnimData.tr.a[0],-this.currentAnimData.tr.a[1]);
    if(this.data.hasMask){
        this.maskManager.draw();
    }
    if(saveFlag !== false){
        this.canvasContext.restore();
    }

};

CVBaseElement.prototype.getCurrentAnimData = function(){
    return this.currentAnimData;
};
CVBaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(CVMaskElement,null,params);
};
CVBaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
CVBaseElement.prototype.getType = function(){
    return this.type;
};

CVBaseElement.prototype.getHierarchy = function(){
    if(!this.hierarchy){
        this.hierarchy = [];
    }
    return this.hierarchy;
};

CVBaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};

