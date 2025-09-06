let ctx = null;
let size = 100;
let boardSize = 16;
let grassState = [[]];
let animalState = [[]];
let hungerState = [[]];
let plantIcon = null;
let zebraIcon = null;
let lionIcon = null;
let day = 0;
let configs = {
	"plants": { "name": "<img class='icon' src='./images/potted_plant_3d.png'>植物の繫殖の速さ", "min": 0, "max": 8, "default": 0, 'type': 'green' },
	"g_num": { "name": "<img class='icon' src='./images/zebra_3d.png'>草食動物の数", "min": 1, "max": 100, "default": 50, 'type': 'blue' },
	"g_child": { "name": "　子供をうむまでの日数", "min": 1, "max": 50, "default": 10, 'type': 'blue' },
	"g_live": { "name": "　えさなしで生きる日数", "min": 1, "max": 20, "default": 1, 'type': 'blue' },
	"m_num": { "name": "<img class='icon' src='./images/lion_3d.png'>肉食動物の数", "min": 1, "max": 100, "default": 50, 'type': 'red' },
	"m_child": { "name": "　子供をうむまでの日数", "min": 1, "max": 50, "default": 10, 'type': 'red' },
	"m_live": { "name": "　えさなしで生きる日数", "min": 1, "max": 20, "default": 1, 'type': 'red' },
	"m_full": { "name": "　満腹でえさをとらない日数", "min": 1, "max": 5, "default": 1, 'type': 'red' },
	"m_rate": { "name": "　えさをとる確率(割)", "min": 1, "max": 10, "default": 5, 'type': 'red' },

}
function getConfig(id) {
	return parseInt(configs[id].element.value);
}
window.onload = function () {
	const config = document.getElementById('config');
	for (let key of Object.keys(configs)) {
		const c = configs[key];
		const elem = document.createElement('tr');
		elem.innerHTML = `<td>${c.name} (${c.min}~${c.max})</td><td></td>`;
		const inp = document.createElement('input');
		inp.type = 'number';
		inp.min = c.min;
		inp.max = c.max;
		inp.name = c.name;
		inp.value = c.default;
		elem.children[1].appendChild(inp);
		c.element = inp;
		elem.className += (c.type);
		config.insertAdjacentElement('beforebegin', elem);
	}
	plantIcon = document.getElementById('plant_icon');
	zebraIcon = document.getElementById('zebra_icon');
	lionIcon = document.getElementById('lion_icon');
	const canvas = document.getElementById('canvas');
	const onResize = function () {
		const left = document.getElementById('left');
		size = Math.min(left.clientWidth, left.clientHeight * 0.8);
		canvas.width = size;
		canvas.height = size;
		draw();
	};
	window.addEventListener('resize', onResize);
	ctx = canvas.getContext('2d');
	init();
	onResize();
	initGraph();
	speedChange(5);
};
let g = [];
function countToY(count) {
	return 300 - (count + 22);
}
let gctx;
function initGraph() {
	gctx = document.getElementById('graph').getContext('2d');
	gctx.fillStyle = 'white';
	gctx.fillRect(0, 0, 500, 300);
	gctx.fillStyle = 'black';
	gctx.font = '20px sans';
	for (let i = 0; i <= 250; i += 50) {
		gctx.fillText(i, 20, countToY(i));
		gctx.beginPath();
		gctx.moveTo(20, countToY(i));
		gctx.lineTo(500, countToY(i));
		gctx.closePath();
		gctx.stroke();
	}
}
let currentG = 0;
function addDataGraph(red, blue) {
	let off = currentG;
	const wid = 2.5;
	const l = (function (val) {
		const s = 2;
		gctx.fillRect(60 - s + off * wid, countToY(val) - s, s * 2, s * 2);
	});
	gctx.fillStyle = 'red';
	l(red);
	gctx.fillStyle = 'blue';
	l(blue);
	currentG++;
	const w = 144;
	if (currentG % w == w - 1) {
		currentG = 0;
		initGraph();
	}
}
function placeRandom(arr, target, type) {
	let placed = 0;
	while (placed < target) {
		const x = Math.floor(Math.random() * boardSize);
		const y = Math.floor(Math.random() * boardSize);
		if (arr[x][y] === 0) {
			arr[x][y] = type;
			placed++;
		}
	}
}
function init() {
	const gen = function (n) {
		return [...Array(boardSize)].map(_ => Array(boardSize).fill(n));
	}
	grassState = [...Array(boardSize)].map(_ => Array(boardSize).fill(0).map(_ => parseInt(Math.random() * 3)));
	animalState = gen(0);
	hungerState = gen(0);
	placeRandom(animalState, getConfig("g_num"), 1);
	placeRandom(animalState, getConfig("m_num"), 2);
	initGraph();
	day = 0;
	currentG = 0;
}
function draw() {
	ctx.clearRect(0, 0, size, size);
	const pixelSize = size / boardSize;
	for (let i in grassState) {
		for (let j in grassState[i]) {
			ctx.fillStyle = grassState[i][j] ? (grassState[i][j] == 2 ? '#3aad34' : '#67e660') : '#8f5a00';
			ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
		}
	}
	for (let i in animalState) {
		for (let j in animalState[i]) {
			const type = animalState[i][j];
			if (type >= 1) {
				ctx.font = (pixelSize / 3 * 2) + "px serif";
				ctx.drawImage(type == 1 ? zebraIcon : lionIcon, i * pixelSize, j * pixelSize, pixelSize, pixelSize);
			}
		}
	}
}
function lookAround(x, y, callback) {
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			if (dx === 0 && dy === 0) continue;
			let nx = x + dx, ny = y + dy;
			if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
				callback(nx, ny);
			}
		}
	}
}
function lookRandomly(x, y, con) {
	let p = [];
	lookAround(x, y, (nx, ny) => {
		if (con(nx, ny)) {
			p.push([nx, ny]);
		}
	});
	if (p.length == 0) return null;
	return p[Math.floor(Math.random() * (p.length))];
}
function step() {
	day++;
	document.getElementById('days').innerText = day + '日';
	const plantGrowthRate = parseInt(getConfig("plants")) || 0;
	for (let i in grassState) {
		for (let j in grassState[i]) {
			if (Math.random() * 10 < plantGrowthRate && grassState[i][j] != 2) {
				grassState[i][j]++;
			}
		}
	}
	for (let x = 0; x < boardSize; x++) {
		for (let y = 0; y < boardSize; y++) {
			if (animalState[x][y] === 1) {
				let best = { gx: x, gy: y, level: grassState[x][y] };
				lookAround(x, y, (nx, ny) => {
					if (animalState[nx][ny] === 0 && grassState[nx][ny] > best.level) {
						best = { gx: nx, gy: ny, level: grassState[nx][ny] };
					}
				});
				if (best.gx !== x || best.gy !== y) {
					animalState[best.gx][best.gy] = 1;
					animalState[x][y] = 0;
					hungerState[best.gx][best.gy] = 0;
					if (grassState[best.gx][best.gy] > 0) grassState[best.gx][best.gy]--;
					else hungerState[best.gx][best.gy] = 1;
				} else {
					if (grassState[x][y] > 0) {
						grassState[x][y]--;
						hungerState[x][y] = 0;
					} else {
						hungerState[x][y] += 1;
						if (hungerState[x][y] >= getConfig("g_live")) {
							console.log("death");
							animalState[x][y] = 0;
						}
					}
				}
				// 繁殖
				if (1 / getConfig('g_child') > Math.random()) {
					let a = lookRandomly(x, y, (nx, ny) => (animalState[nx][ny] === 0));
					if (a === null) continue;
					animalState[a[0]][a[1]] = 1;
					hungerState[a[0]][a[1]] = 0;
				}
			} else if (animalState[x][y] === 2) {
				hungerState[x][y]++;
				if (hungerState[x][y] >= getConfig('m_live')) {
					animalState[x][y] = 0;
				} else if (hungerState[x][y] >= getConfig('m_full')) {
					let a = lookRandomly(x, y, (nx, ny) => (animalState[nx][ny] === 1));
					if (a === null) continue;
					if (1 / getConfig('m_rate') > Math.random()) {
						animalState[x][y] = 0;
						animalState[a[0]][a[1]] = 2;
						hungerState[a[0]][a[1]] = 0;
					}
				}
				if (1 / getConfig('m_child') > Math.random()) {
					let a = lookRandomly(x, y, (nx, ny) => (animalState[nx][ny] === 0));
					if (a === null) continue;
					animalState[a[0]][a[1]] = 2;
					hungerState[a[0]][a[1]] = 0;
				}
			}
		}
	}

	let zebra = 0;
	let lion = 0;
	for (let i in animalState) {
		for (let j in animalState[i]) {
			if (animalState[i][j] == 1) {
				zebra++;
			} else if (animalState[i][j] == 2) {
				lion++;
			}
		}
	}
	if (zebra == 0 || lion == 0) {
		stopSim();
	}
	addDataGraph(lion, zebra);
	document.getElementById('info').innerHTML = '<span class="blue">草食の数</span> ' + zebra + ' <span class="red">肉食の数</span> ' + lion;
	draw();
}
let simulationId = -1;
let speed = 5;
let simInterval = 160;
function startSim() {
	if (simulationId == -1) simulationId = setInterval(step, simInterval);
	for (const c of Object.values(configs)) {
		c.element.disabled = true;
	}
}
function stopSim() {
	if (simulationId == -1) return;
	clearInterval(simulationId);
	simulationId = -1;

	for (const c of Object.values(configs)) {
		c.element.disabled = false;
	}
}
function speedChange(nspeed) {
	speed = nspeed;
	simInterval = 800 / speed;
	if (simulationId != -1) {
		stopSim();
		startSim();
	}
}