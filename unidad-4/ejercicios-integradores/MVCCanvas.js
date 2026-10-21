class Model extends EventTarget {

    constructor() {
        super();
        this._figures = [];
    }

    addFigure(figure) {
        this._figures.push(figure);
        this.changed();
    }

    clearFigures() {
        this._figures = [];
        this.changed();
    }

    get figures() {
        return this._figures.slice();
    }

    changed() {
        this.dispatchEvent(new CustomEvent('changed'));
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

        this._controls = document.createElement('div');
        this._controls.className = 'controls';

        this._createAllControls();

        this.appendChild(this._controls);
        this.appendChild(this._canvas);

        this.setExercise(6);
    }

    _createAllControls() {
        this._labelFigureType = document.createElement('label');
        this._labelFigureType.textContent = 'Figura: ';

        this._selectFigureType = document.createElement('select');
        this._selectFigureType.style.marginRight = '10px';

        const figureTypes = [
            { value: 'circle',    text: 'Círculo' },
            { value: 'polygon',   text: 'Polígono' },
            { value: 'cakeGraph', text: 'CakeGraph' }
        ];

        for (const item of figureTypes) {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.text;
            this._selectFigureType.appendChild(option);
        }

        this._labelLineStyle = document.createElement('label');
        this._labelLineStyle.textContent = 'Tipo de línea: ';

        this._selectLineStyle = document.createElement('select');
        this._selectLineStyle.style.marginRight = '10px';

        const lineOptions = [
            { value: 'solid',  text: 'Continua' },
            { value: 'dashed', text: 'Discontinua' }
        ];

        for (const item of lineOptions) {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.text;
            this._selectLineStyle.appendChild(option);
        }

        this._labelLineWidth = document.createElement('label');
        this._labelLineWidth.textContent = ' Grosor: ';

        this._inputLineWidth = document.createElement('input');
        this._inputLineWidth.type = 'number';
        this._inputLineWidth.min = '1';
        this._inputLineWidth.max = '100';
        this._inputLineWidth.step = '1';
        this._inputLineWidth.value = '2';
        this._inputLineWidth.style.marginRight = '10px';

        this._btnLoad = document.createElement('button');
        this._btnLoad.type = 'button';
        this._btnLoad.textContent = 'Cargar figura';
        this._btnLoad.style.margin = '10px 10px 10px 0';

        this._btnClear = document.createElement('button');
        this._btnClear.type = 'button';
        this._btnClear.textContent = 'Limpiar';

        this._controls.appendChild(this._labelFigureType);
        this._controls.appendChild(this._selectFigureType);

        this._controls.appendChild(this._labelLineStyle);
        this._controls.appendChild(this._selectLineStyle);
        this._controls.appendChild(this._labelLineWidth);
        this._controls.appendChild(this._inputLineWidth);

        this._controls.appendChild(this._btnLoad);
        this._controls.appendChild(this._btnClear);

        this._lineControls = [
            this._labelLineStyle,
            this._selectLineStyle,
            this._labelLineWidth,
            this._inputLineWidth
        ];

        this._figureControls = [
            this._labelFigureType,
            this._selectFigureType
        ];
    }

    setExercise(exerciseNumber) {
        this.exerciseNumber = exerciseNumber;

        this._toggleControls(this._lineControls,   exerciseNumber >= 12);
        this._toggleControls(this._figureControls, exerciseNumber >= 19);
    }

    _toggleControls(controls, visible) {
        for (let i = 0; i < controls.length; i++) {
            controls[i].hidden = !visible;
        }
    }

    _onLoadClick() {
        const raw = prompt('Ingrese la figura en formato JSON:');
        if (!raw) {
            return;
        }

        let figure;

        try {
            figure = JSON.parse(raw);
        } catch (err) {
            alert('JSON inválido: ' + err.message);
            return;
        }

        const detail = {
            action: 'loadFigure',
            figure: figure
        };

        if (this.exerciseNumber >= 12) {
            detail.lineStyle = this._selectLineStyle.value;
            detail.lineWidth = Number(this._inputLineWidth.value);
        }

        if (this.exerciseNumber >= 19) {
            detail.figureType = this._selectFigureType.value;
        }

        this._emitRequest(detail);
    }

    _onClearClick() {
        this._emitRequest({ action: 'clear' });
    }

    _emitRequest(detail) {
        this.dispatchEvent(new CustomEvent('request', { detail }));
    }

    render(figures) {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (const figure of figures) {
            this._drawFigure(figure);
        }
    }

    _drawFigure(figure) {
        this._ctx.save();

        this._ctx.lineWidth = figure.lineWidth || 2;

        if (figure.lineStyle === 'dashed') {
            this._ctx.setLineDash([10, 5]);
        } else {
            this._ctx.setLineDash([]);
        }

        if (figure.type === 'circle') {
            this._drawCircle(figure);
        } else if (figure.type === 'polygon') {
            this._drawPolygon(figure);
        } else if (figure.type === 'cakeGraph') {
            this._drawCakeGraph(figure);
        }

        this._ctx.restore();
    }

    _drawCircle(figure) {
        this._ctx.beginPath();
        this._ctx.arc(figure.x, figure.y, figure.radius, 0, Math.PI * 2);
        this._ctx.stroke();
    }

    _drawPolygon(figure) {
        const points = figure.points;
        if (!points || points.length === 0) {
            return;
        }

        this._ctx.beginPath();
        this._ctx.moveTo(figure.x + points[0].x, figure.y + points[0].y);

        for (let i = 1; i < points.length; i++) {
            this._ctx.lineTo(figure.x + points[i].x, figure.y + points[i].y);
        }

        this._ctx.closePath();
        this._ctx.stroke();
    }

    _drawCakeGraph(figure) {
        if (!figure.data || figure.data.length === 0) {
            return;
        }

        const total = figure.data.reduce(
            (sum, item) => sum + item.value,
            0
        );

        if (total === 0) {
            return;
        }

        let startAngle = -Math.PI / 2;

        for (const item of figure.data) {
            if (item.value === 0) {
                continue;
            }

            const endAngle = startAngle + (item.value / total) * Math.PI * 2;

            this._ctx.beginPath();
            this._ctx.moveTo(figure.x, figure.y);
            this._ctx.arc(figure.x, figure.y, figure.radius, startAngle, endAngle);
            this._ctx.closePath();

            this._ctx.fillStyle = this._randomColor();
            this._ctx.fill();
            this._ctx.stroke();

            startAngle = endAngle;
        }
    }

    _randomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    connectedCallback() {
        this._btnLoad.onclick  = this._onLoadClick.bind(this);
        this._btnClear.onclick = this._onClearClick.bind(this);
    }

    disconnectedCallback() {
        this._btnLoad.onclick  = null;
        this._btnClear.onclick = null;
    }
}

customElements.define('x-view', View);


class Controller {

    constructor(view, model) {
        this._view = view;
        this._model = model;

        this._onModelChanged = this.onModelChanged.bind(this);
        this._onViewRequest  = this.onViewRequest.bind(this);
    }

    enable() {
        this._model.addEventListener('changed', this._onModelChanged);
        this._view.addEventListener('request', this._onViewRequest);

        this.onModelChanged();
    }

    disable() {
        this._model.removeEventListener('changed', this._onModelChanged);
        this._view.removeEventListener('request', this._onViewRequest);
    }

    onModelChanged() {
        this._view.render(this._model.figures);
    }

    onViewRequest(event) {
        const { action, figure, lineStyle, lineWidth, figureType } = event.detail;

        if (action === 'loadFigure') {
            if (figureType !== undefined) {
                figure.type = figureType;
            }

            if (lineStyle !== undefined) {
                figure.lineStyle = lineStyle;
                figure.lineWidth = lineWidth;
            }

            this._model.addFigure(figure);

        } else if (action === 'clear') {
            this._model.clearFigures();
        }
    }
}