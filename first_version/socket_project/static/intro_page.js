

export function drawText(t, x, y, color, c, size) {
    c.fillStyle = color;
    c.font = size +"px Arial";
    c.fillText(t,x,y);
}

export function drawText_2(t, x, y, color, c, size) {
    c.fillStyle = color;
    c.font = size;
    c.fillText(t,x,y);
}


export function drawRect(x,y,w,h,color,c) {
    c.fillStyle = color;
    c.fillRect(x,y,w,h);
}

export function drawCircle(x,y,r,color,c) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x,y,r,0,Math.PI*2,false);
    c.closePath();
    c.fill();
}

