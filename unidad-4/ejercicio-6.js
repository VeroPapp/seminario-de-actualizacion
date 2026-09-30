import { Model, View, Controller } from './MVCCanvas.js';


function drawCircle(ctx, figure) {

    ctx.beginPath();

    ctx.arc(figure.x, figure.y, figure.radius, 0, 2 * Math.PI);

    ctx.stroke();
}


function drawPolygon(ctx, figure) {

    ctx.beginPath();

    ctx.moveTo(
        figure.points[0].x + figure.x, 
        figure.points[0].y + figure.y
    );

    for (let i = 1; i < figure.points.length; i++) {

        ctx.lineTo(
            figure.points[i].x + figure.x, 
            figure.points[i].y + figure.y);
    }

    ctx.closePath();
    ctx.stroke();
}


function drawFigure(ctx, figure) {

    if (figure.type === 'circle') {
        drawCircle(ctx, figure);
    }

    if (figure.type === 'polygon') {
        drawPolygon(ctx, figure);
    }
}


function main() {

    const model = new Model();
    const view = new View(drawFigure);
    const controller = new Controller(view, model, drawFigure);

    controller.enable();

    document.body.appendChild(view);
}


window.onload = main;