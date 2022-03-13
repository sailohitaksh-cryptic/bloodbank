/*
*	All code written by Erik Lehmann
*	Last Update: 24.12.2022
*
*	In Case of Error, please contact LehmannEV@outlook.com
*/

let rotation = 0;
let newFrame = false;
let topSpeed = 0.1;
let pageYDistance = 0;
let ClickCounter = 0;
let offsetWidth = 10;
let offsetHeight = 10;
let barClicked = false;
const totalPageHeight = document.body.scrollHeight - window.innerHeight;
let focused = false;
let val = 0.0;

//Animated Background - Canvas
let canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth + offsetWidth;
canvas.height = window.innerHeight + offsetHeight;
let ctx = canvas.getContext("2d");
let ctxEmpty = canvas.getContext("2d");
let canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//Animated Background - Point-Initialisation
var points = [{ x: -10, y: -10, targetx: -10, targety: -10, cooldown: 0, velocityX: 0, velocityY: 0, name:"00", distance: 0 }];
for(let count = 1; count <= 120; count++)
{
	const wx = Math.round(Math.random() * canvas.width);
	const wy = Math.round(Math.random() * 500);
	points.push({ x: wx, y: wy, targetx: wx, targety: wy, cooldown: 0, velocityX: wx, velocityY: wy, name: count.toString(), distance: 0 });
}
//Cursor Position-Object
let mousePos =
{
	x: -10,
	y: -10
};
//Scrollbar (Progressbar-Style)
const progressBarContainer = document.querySelector("#progressBarContainer");
progressBarContainer.addEventListener("click", onScrollBarClick);
progressBarContainer.addEventListener("mousedown", onScrollBarMouseDown);
window.addEventListener("mouseup", onScrollBarMouseUp);
progressBarContainer.addEventListener("mousemove", onMouseMove)
const progressBar = document.querySelector("#progressBar");
//Global EventHandlers
document.onmousemove = onMouseMove;
window.addEventListener("scroll", onScroll);
//CategoryGrid-Objects and EventHandlers
const EE = document.querySelector("#Mugshot");
EE.addEventListener("click", onEasterEgg);
const CatGrid = document.querySelector("#CatGrid");
const CatL = document.querySelector("#CategoriesL");
CatL.addEventListener("click", onCatLClick);
const CatA = document.querySelector("#CategoriesA");
CatA.addEventListener("click", onCatAClick);
const CatM = document.querySelector("#CategoriesM");
CatM.addEventListener("click", onCatMClick);
const TBG = document.querySelector("#TopicBackdrop");
const gridL = document.querySelector("#LGrid");
const gridA = document.querySelector("#AGrid");
const gridM = document.querySelector("#MGrid");

/*
var h = document.createElement("H1");
var t = document.createTextNode("Hello World");
h.appendChild(t);
document.body.appendChild(h);
*/


/*
*
*	Start of Loop
*
*/

window.requestAnimationFrame(loop);
function loop()
{
	draw();
	window.requestAnimationFrame(loop);
}

function draw()
{
	rescale(canvas, window.innerWidth, window.innerHeight, offsetWidth, offsetHeight);

	//Draw Background
	let grd = ctx.createRadialGradient(canvas.width, canvas.height, 5, canvas.width, canvas.height, canvas.width * 1.5);
	grd.addColorStop(0, rgb(255, 0, 0));
	grd.addColorStop(1, rgb(255, 0, 0));
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, canvas.width, canvas.height);


	//Draw MouseCursor
	let pos = mousePos;
	let mouseGrd = ctx.createRadialGradient(pos.x + 1, pos.y + 1, 3, pos.x, pos.y, 30);
	ctx.beginPath();
	mouseGrd.addColorStop(0, rgb(255, 255, 255));
	mouseGrd.addColorStop(1, rgba(255, 255, 255, 0));
	ctx.fillStyle = mouseGrd;
	ctx.arc(pos.x, pos.y, 30, 0, 360, false);
	ctx.fill();


	//Draw lines between points
	var lines;
	var distances;
	var cursor;
	var closest1 = { distance: 1000 };
	var closest2 = { distance: 1000 };
	for (let item of points)
	{
		//Calculate Lines
		for (let innerItem of points)
		{
			let dis = getDistance(innerItem.x, innerItem.y, item.x, item.y);
			if (dis < 1000 && dis < (closest1.distance * 0.666666) && dis > 30)
			{
				innerItem.distance = getDistance(innerItem.x, innerItem.y, item.x, item.y);
				closest1 = innerItem;
			}
			else if (dis < 1000 && dis < (closest2.distance * 0.666666) && dis > 30)
			{
				innerItem.distance = getDistance(innerItem.x, innerItem.y, item.x, item.y);
				closest2 = innerItem;
			}
		}

		//Draw Lines
		ctx.beginPath();
		ctx.strokeStyle = rgb(45, 35, 195);
		ctx.moveTo(closest1.x, closest1.y);
		ctx.lineTo(item.x, item.y);
		ctx.stroke();
		ctx.lineTo(closest2.x, closest2.y);
		ctx.stroke();

		closest1.distance = 1000.0;
		closest2.distance = 1000.0;
	}

	//Draw points and move them around
	for (let item of points)
	{
		ctx.beginPath();
		var pointGrd = ctx.createRadialGradient(item.x - 1, item.y - 1, 1, item.x, item.y, 10);
		pointGrd.addColorStop(0, rgb(255, 255, 255));
		pointGrd.addColorStop(1, rgb(255, 255, 255));
		ctx.fillStyle = pointGrd;
		ctx.arc(item.x, item.y, 10, 0, 360, false);
		ctx.fill();
		ctx.strokeStyle = rgb(0, 0, 30);
		ctx.stroke();

		//Cooldown at 0 -> New Targets get set
		if (item.cooldown <= 0)
		{
			item.cooldown = Math.round(Math.random() * 200 + 100);

			if (item.targetx <= 20)
				item.targetx += Math.random() * 40;
			else if (item.targetx >= canvas.width - 80 - item.y)
				item.targetx += Math.random() * 40 - 42;
			else
				item.targetx += Math.random() * 40 - 20;
			if (item.targety <= 20)
				item.targety += Math.random() * 40;
			else if (item.targety >= 500)
				item.targety += Math.random() * 40 - 42;
			else
				item.targety += Math.random() * 40 - 20;
		}

		//Set Velocity to reach Target
		item.velocityX = clamp(item.velocityX + (item.targetx - item.x) / 2000.0, -topSpeed, topSpeed);
		item.velocityY = clamp(item.velocityY + (item.targety - item.y) / 2000.0, -topSpeed, topSpeed);

		//Avoid Mouse Position
		let toMouseDis = getDistance(item.x, item.y, pos.x, pos.y);
		if (toMouseDis < 100 && toMouseDis > 0)
		{
			let vX = (((item.x - pos.x) * (1 / toMouseDis)));
			let vY = (((item.y - pos.y) * (1 / toMouseDis)));
			let fac = 4 - map(toMouseDis, 0, 100, 0, 4);
			item.velocityX += vX * fac;
			item.velocityY += vY * fac;
		}

		//Avoid other points
		for (let innerItem of points)
		{
			let toPointDis = getDistance(item.x, item.y, innerItem.x, innerItem.y);
			if (toPointDis < 50 && toPointDis > 0)
			{
				let veX = (((item.x - innerItem.x) * (1 / toPointDis)));
				let veY = (((item.y - innerItem.y) * (1 / toPointDis)));
				let fact = 0.2 - map(toPointDis, 0, 50, 0, 0.2);
				item.velocityX += veX * fact;
				item.velocityY += veY * fact;
			}
		}

		//Move the points
		item.x += item.velocityX;
		item.y += item.velocityY;

		item.cooldown--;

		/*
		ctx.fillStyle = rgb(255, 255, 255);
		ctx.font = "30px Arial";
		//ctx.fillText(window.pageYOffset.toString(10), 100 , 100 + window.pageYOffset);

		if(true)//item.name == "1")
		{
			ctx.beginPath();
			ctx.fillStyle = rgb(255, 0, 0);
			ctx.arc(item.targetx, item.targety, 2, 0, 360, false);
			ctx.fill();
		}
		*/
	}
}

//Focus on the L Category
function focusL(obj, from, to)
{
	const InfoHeight = gridL.offsetHeight;
	gridA.style.visibility = "hidden";
	gridM.style.visibility = "hidden";
	
	if (!focused)
	{
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "100% 0% 0%";
			CatA.style.visibility = "hidden";
			CatM.style.visibility = "hidden";
			focused = true;
			gridL.style.visibility = "visible";
			gridL.style.gridTemplateRows = "auto";
			unfoldContent(gridL, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin((from / 200.0) * Math.PI) * Math.sin((from / 200.0) * Math.PI) * 100;
			obj.style.gridTemplateColumns = val + "% " +
				((100 - val) / 2) + "% " + ((100 - val) / 2) + "%";
			setTimeout(function ()
			{
				focusL(obj, from + 1, to);
			}, 1);
		}
	}
	else
	{
		CatA.style.visibility = "visible";
		CatM.style.visibility = "visible";
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "33.3% 33.4% 33.3%";
			focused = false;
			unfoldContent(gridL, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin(((from + 60.7) / 200.0) * Math.PI) * Math.sin(((from + 60.7) / 200.0) * Math.PI) * 100;
			obj.style.gridTemplateColumns = val + "% " +
				((100 - val) / 2) + "% " + ((100 - val) / 2) + "%";
			setTimeout(function ()
			{
				focusL(obj, from + 1, to);
			}, 1);
		}
	}
}
//Focus on the A Category
function focusA(obj, from, to)
{
	const InfoHeight = gridA.offsetHeight;
	gridL.style.visibility = "hidden";
	gridM.style.visibility = "hidden";
	
	if (!focused)
	{
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "0% 100% 0%";
			CatL.style.visibility = 'hidden';
			CatM.style.visibility = 'hidden';
			focused = true;
			gridA.style.visibility = "visible";
			gridA.style.gridTemplateRows = "auto";
			unfoldContent(gridA, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin((from / 200.0) * Math.PI) * Math.sin((from / 200.0) * Math.PI) * 100;
			obj.style.gridTemplateColumns = ((100 - val) / 2) + "% " + val + "% " + ((100 - val) / 2) + "%";
			setTimeout(function ()
			{
				focusA(obj, from + 1, to);
			}, 1);
		}
	}
	else
	{
		CatL.style.visibility = 'visible';
		CatM.style.visibility = 'visible';
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "33.3% 33.4% 33.3%";
			focused = false;
			unfoldContent(gridA, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin(((from + 60.7) / 200.0) * Math.PI) * Math.sin(((from + 60.7) / 200.0) * Math.PI) * 100;
			obj.style.gridTemplateColumns = ((100 - val) / 2) + "% " + val + "% " + ((100 - val) / 2) + "%";
			setTimeout(function ()
			{
				focusA(obj, from + 1, to);
			}, 1);
		}
	}
}
//Focus on the M Category
function focusM(obj, from, to)
{
	const InfoHeight = gridM.offsetHeight;
	gridL.style.visibility = "hidden";
	gridA.style.visibility = "hidden";
	
	if (!focused)
	{
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "0% 0% 100%";
			CatL.style.visibility = 'hidden';
			CatA.style.visibility = 'hidden';
			focused = true;
			gridM.style.visibility = "visible";
			gridM.style.gridTemplateRows = "auto";
			unfoldContent(gridM, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin((from / 200.0) * Math.PI) * Math.sin((from / 200.0) * Math.PI) * 100;
		}
	}
	else
	{
		CatL.style.visibility = 'visible';
		CatA.style.visibility = 'visible';
		if (from >= to)
		{
			obj.style.gridTemplateColumns = "33.3% 33.4% 33.3%";
			focused = false;
			unfoldContent(gridM, 0, InfoHeight);
			return;
		}
		else
		{
			val = Math.sin(((from + 60.7) / 200.0) * Math.PI) * Math.sin(((from + 60.7) / 200.0) * Math.PI) * 100;
		}
	}

	obj.style.gridTemplateColumns = ((100 - val) / 2) + "% " + ((100 - val) / 2) + "% " + val + "%";
	setTimeout(function ()
	{
		focusM(obj, from + 1, to);
	}, 1);
}
//Unfolds te Content
function unfoldContent(obj, at, fullHeight)
{
	if (at >= 100)
	{
		if (!focused)
		{
			obj.style.visibility = "hidden";
			obj.style.gridTemplateRows = "0%";
		}
		return;
	}

	if (focused)
		val = Math.sin((at / 200.0) * Math.PI) * Math.sin((at / 200.0) * Math.PI) * 100;
	else
		val = Math.sin(((at + 100) / 200.0) * Math.PI) * Math.sin(((at + 100) / 200.0) * Math.PI) * 100;

	TBG.style.height = (val / 100.0) * fullHeight + "px";

	onScroll();

	setTimeout(function ()
	{
		unfoldContent(obj, at + 1, fullHeight);
	}, 1);
}


/*
*
*	EventListeners
*
*/
function onScroll()
{
	progressBar.style.transform = `scale(1,${window.pageYOffset / (document.body.scrollHeight - window.innerHeight)})`;
}

function onScrollBarClick(event)
{
	let scrlTo = ((event.pageY - window.pageYOffset) / progressBarContainer.offsetHeight) * (document.body.scrollHeight - progressBarContainer.offsetHeight);

	window.scroll({
		top: scrlTo,
		left: 0,
		behavior: "smooth"
	});
}
function onScrollBarMouseDown(event)
{
	barClicked = true;
}
function onScrollBarMouseUp(event)
{
	barClicked = false;
}

function onMouseMove(event)
{
	event = event || window.event;

	mousePos =
	{
		x: event.pageX,
		y: event.pageY - window.pageYOffset
	};

	if (barClicked)
		window.scrollTo(0, ((event.pageY - window.pageYOffset) / progressBarContainer.offsetHeight) * (document.body.scrollHeight - progressBarContainer.offsetHeight));
}

function onCatLClick(event)
{
	focusL(CatGrid, 39.3, 100);
}
function onCatAClick(event)
{
	focusA(CatGrid, 39.3, 100);
}
function onCatMClick(event)
{
	focusM(CatGrid, 39.3, 100);
}

function onEasterEgg(event)
{
	ClickCounter++;
	if (ClickCounter >= 20)
	{
		EE.src = "Cheeky Bloke.png";
    }
}


/*
*
*	Util
*
*/

//Remaps a value from a given Field to a new Field
function map(val, srcFloor, srcCeil, destFloor, destCeil)
{
	return destFloor + ((destCeil - destFloor) * ((val - srcFloor) / (srcCeil - srcFloor)));
}

//Limits a value to the floor minimum and the ceil maximum
function clamp(val, floor, ceil)
{
	if (val < floor)
		return floor;
	else if (val > ceil)
		return ceil;
	else
		return val;
}

///Rescale Canvas to the destined width and heigt with a offset
function rescale(canv, wid, hei, o_wid, o_hei)
{
	if (canv.width != wid + offsetWidth)
	{
		canv.width = wid + o_wid;
		canv.height = hei + o_hei;
	}
}

//Create a HTML Hex Color from rgb values
function rgb(r, g, b)
{
	return "#" + clamp(r, 0, 255).toString(16).padStart(2, '0') + clamp(g, 0, 255).toString(16).padStart(2, '0') + clamp(b, 0, 255).toString(16).padStart(2, '0');
}

//Create a HTML Hex Color from rgba values
function rgba(r, g, b, a)
{
	return rgb(r, g, b) + clamp(a, 0, 255).toString(16).padStart(2, '0');
}

//Calculate the Distance between two 2D-Points
function getDistance(x1, y1, x2, y2)
{
	return Math.sqrt(((x1 - x2) * (x1 - x2))
		+ ((y1 - y2) * (y1 - y2)));
}