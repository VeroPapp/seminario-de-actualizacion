class Model extends EventTarget {

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
        if (this._figures.length === 0) return;
        this._figures = [];
        this.changed();
    }

    get figures() {
        return this._figures;
    }
}


class View extends HTMLElement {

    constructor() {
        super();

        this._canvas = document.createElement('canvas');
        this._canvas.width = 800;
        this._canvas.height = 600;
        this._canvas.style.border = '1px solid black';

        this._ctx = this._canvas.getContext('2d');
        
        this._toolbar = document.createElement('div');
        this._toolbar.style.marginBottom = '10px';

        this._btnLoad = document.createElement('button');
        this._btnLoad.textContent = 'Cargar';
        this._btnLoad.style.marginRight = '10px';

        this._btnClear = document.createElement('button');
        this._btnClear.textContent = 'Limpiar';

        this.appendChild(this._toolbar);
        this._toolbar.appendChild(this._btnLoad);
        this._toolbar.appendChild(this._btnClear);
        this.appendChild(this._canvas);
    }

    set value(x) {}

    get value() {}

    _onLoad() {
        const json = prompt('Ingrese la figura en formato JSON');
        if (!json) return;

        this.dispatchEvent(new CustomEvent('request', {
            detail: { action: 'load', payload: json }
        }));
    }

    _onClear() {
        this.dispatchEvent(new CustomEvent('request', {
            detail: { action: 'clear' }
        }));
    }

    connectedCallback() {
        console.log('Canvas agregado...');

        this._btnLoad.onclick = this._onLoad.bind(this);
        this._btnClear.onclick = this._onClear.bind(this);
    }

    disconnectedCallback() {
        this._btnLoad.onclick  = null;
        this._btnClear.onclick = null;
    }


    render(figures) {

        this._ctx.clearRect(
            0,
            0,
            this._canvas.width,
            this._canvas.height
        );

        for (const figure of figures) {
            this._drawFigure(figure);
        }
    }

    _drawFigure(figure) {

        if (figure.type === 'circle') {
            this._drawCircle(figure);
        }

        if (figure.type === 'polygon') {
            this._drawPolygon(figure);
        }
    }

    _drawCircle(figure) {

        this._ctx.beginPath();

        this._ctx.arc(
            figure.x,
            figure.y,
            figure.radius,
            0,
            2 * Math.PI
        );

        this._ctx.stroke();
    }

    _drawPolygon(figure) {

        this._ctx.beginPath();

        this._ctx.moveTo(
            figure.points[0].x + figure.x,
            figure.points[0].y + figure.y
        );

        for (let i = 1; i < figure.points.length; i++) {

            this._ctx.lineTo(
                figure.points[i].x + figure.x,
                figure.points[i].y + figure.y
            );
        }

        this._ctx.closePath();
        this._ctx.stroke();
    }
}

customElements.define('x-view', View);


class Controller {

    constructor(view, model) {

        this._view = view;
        this._model = model;

        this._onModelChanged = this.onModelChanged.bind(this);
        this._onViewRequest = this.onViewRequest.bind(this);
    }

    enable() {

        this._model.addEventListener(
            'changed',
            this._onModelChanged
        );

        this._view.addEventListener(
            'request',
            this._onViewRequest
        );
    }

    disable() {

        this._model.removeEventListener(
            'changed',
            this._onModelChanged
        );

        this._view.removeEventListener(
            'request',
            this._onViewRequest
        );
    }

    onModelChanged() {

        this._view.render(this._model.figures);
    }

    onViewRequest(event) {
        const { action, payload } = event.detail;

        if (action === 'load') {
            try {
                const figure = JSON.parse(payload);
                if (!figure || typeof figure.type !== 'string') {
                    alert('Figura inválida');
                    return;
                }
                this._model.addFigure(figure);
            } catch (e) {
                alert('JSON inválido: ' + e.message);
            }
        }

        if (action === 'clear') {
            this._model.clear();
        }
    }
}