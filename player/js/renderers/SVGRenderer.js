function SVGRenderer(animationItem){
    this.animationItem = animationItem;
    this.layers = null;
    this.lastFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.elements = [];
}

SVGRenderer.prototype.buildItems = function(layers,parentContainer,elements){
    var count = 0, i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    for (i = len - 1; i >= 0; i--) {
        if (layers[i].type == 'StillLayer') {
            count++;
            elements[i] = this.createImage(layers[i],parentContainer);
        } else if (layers[i].type == 'PreCompLayer') {
            elements[i] = this.createComp(layers[i],parentContainer);
            var elems = [];
            this.buildItems(layers[i].layers,elements[i].getDomElement(),elems);
            elements[i].setElements(elems);
        } else if (layers[i].type == 'SolidLayer') {
            elements[i] = this.createSolid(layers[i],parentContainer);
        } else if (layers[i].type == 'ShapeLayer') {
            elements[i] = this.createShape(layers[i],parentContainer);
        } else if (layers[i].type == 'TextLayer') {
            elements[i] = this.createText(layers[i],parentContainer);
        }else{
            elements[i] = this.createBase(layers[i],parentContainer);
            //console.log('NO TYPE: ',layers[i]);
        }
        //NullLayer
    }
};

SVGRenderer.prototype.createBase = function (data,parentContainer) {
    return new BaseElement(data, this.animationItem,parentContainer,this.globalData);
};

SVGRenderer.prototype.createShape = function (data,parentContainer) {
    return new IShapeElement(data, this.animationItem,parentContainer,this.globalData);
};

SVGRenderer.prototype.createText = function (data,parentContainer) {
    return new ITextElement(data, this.animationItem,parentContainer,this.globalData);
};

SVGRenderer.prototype.createImage = function (data,parentContainer) {
    return new IImageElement(data, this.animationItem,parentContainer,this.globalData);
};

SVGRenderer.prototype.createComp = function (data,parentContainer) {
    return new ICompElement(data, this.animationItem,parentContainer,this.globalData);

};

SVGRenderer.prototype.createSolid = function (data,parentContainer) {
    return new ISolidElement(data, this.animationItem,parentContainer,this.globalData);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElementNS(svgNS,'svg');
    this.animationItem.container.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.animationItem.container.setAttribute('width',animData.animation.compWidth);
    this.animationItem.container.setAttribute('height',animData.animation.compHeight);
    this.animationItem.container.setAttribute('viewBox','0 0 '+animData.animation.compWidth+' '+animData.animation.compHeight);
    this.animationItem.container.setAttribute('preserveAspectRatio','xMidYMid meet');
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.globalData.defs = defs;
    this.animationItem.container.appendChild(defs);
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.animation.compWidth);
    rect.setAttribute('height',animData.animation.compHeight);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    maskElement.setAttribute('id', 'animationMask');
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#animationMask)");
    this.animationItem.container.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.animationItem.container = maskedElement;
    this.layers = animData.animation.layers;
};

SVGRenderer.prototype.buildStage = function (container, layers,elements) {
    var i, len = layers.length, layerData;
    if(!elements){
        elements = this.elements;
    }
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent) {
            this.buildItemParenting(layerData,elements[i],layers,layerData.parent,elements);
        }
        elements[i].setMainElement();
        if (layerData.type == 'PreCompLayer') {
            this.buildStage(elements[i].getComposingElement(), layerData.layers, elements[i].getElements());
        }
    }
};
SVGRenderer.prototype.buildItemParenting = function (layerData,element,layers,parentName,elements) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    var i = 0, len = layers.length;
    while(i<len){
        if (layers[i].layerName == parentName) {
            element.getHierarchy().push(elements[i]);
            if(layers[i].parent){
                this.buildItemParenting(layerData,element,layers,layers[i].parent,elements);
            }
            break;
        }
        i += 1;
    }
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.lastFrame == num){
        return;
    }
    this.lastFrame = num;
    this.globalData.frameNum = num;
    var i, len = this.layers.length;
    for (i = 0; i < len; i++) {
        this.elements[i].prepareFrame(num - this.layers[i].startTime);
    }
    for (i = 0; i < len; i++) {
        this.elements[i].renderFrame(num - this.layers[i].startTime);
    }
};