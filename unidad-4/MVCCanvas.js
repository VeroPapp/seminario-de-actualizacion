export class Model extends EventTarget {

    constructor() {
        super();
        this._figures = [];
    }

    changed() {
        this.dispatchEvent(new CustomEvent('changed'));
    }

    addFigure(figure) {
        this._figures.push(figure);
        this.changed();
    }

    clear() {
        this._figures = [];
        this.changed();
    }

    get figures() {
        return this._figures;
    }
}
 

export class View extends HTMLElement {

    constructor() {
        super();

        this._canvas = document.createElement('canvas');

        this._canvas.width = 800;
        this._canvas.height = 600;

        this._canvas.style.border = '1px solid black';

        this._ctx = this._canvas.getContext('2d');


        this._btnLoad = document.createElement('button');
        this._btnLoad.textContent = 'Cargar';


        this._btnClear = document.createElement('button');
        this._btnClear.textContent = 'Limpiar';


        this.appendChild(this._btnLoad);
        this.appendChild(this._btnClear);
        this.appendChild(this._canvas);
    }


    set value(x) {
    }


    get value() {
    }


    _onLoad() {
        const json = prompt('Ingrese la figura en formato JSON');

        if (json) {
        const figure = JSON.parse(json);

        this.dispatchEvent(new CustomEvent('request', {
            detail: {
                type: 'load',
                figure: figure
            }
        }));
    }
    }


    _onClear() {
        this.dispatchEvent(new CustomEvent('request', {
            detail: {
                type: 'clear'
            }
        }));
    }

    render(drawFigure, figures) {

        this._ctx.clearRect(
            0,
            0,
            this._canvas.width,
            this._canvas.height
        );

        for (const figure of figures) {
            drawFigure(this._ctx, figure);
        }
}


    connectedCallback() {

        console.log('Canvas agregado...');

        this._btnLoad.onclick = this._onLoad.bind(this);
        this._btnClear.onclick = this._onClear.bind(this);
    }


    disconnectedCallback() {
    }


    _onSave() {
    }
}


customElements.define('x-view', View);


export class Controller {

    constructor(view, model, drawFigure) {

        this._view = view;
        this._model = model;
        this._drawFigure = drawFigure;

    }


    enable() {

        this._onModelChanged = this.onModelChanged.bind(this);
        this._onViewRequest = this.onViewRequest.bind(this);

        this._model.addEventListener('changed', this._onModelChanged);
        this._view.addEventListener('request', this._onViewRequest);
    }


    disable() {

        this._model.removeEventListener('changed', this._onModelChanged);
        this._view.removeEventListener('request', this._onViewRequest);
    }


    onModelChanged() {

        this._view.render(this._drawFigure, this._model.figures);
    }


    onViewRequest(event) {
        const detail = event.detail;

        if (!detail) return;

        if (detail.type === 'load') {
            this._model.addFigure(detail.figure);
        }

        if (detail.type === 'clear') {
            this._model.clear();
        }
    }
}