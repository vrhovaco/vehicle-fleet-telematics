import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const fleetData = [
 {id:'falcon-xr',name:'Falcon XR',route:'Sarajevo • Urban Core',driver:'A. Kovacevic',status:'En Route',health:'ok',speed:86,fuel:72,range:418,consumption:6.8,temp:91,oil:4.7,battery:13.9,efficiency:92,uptime:'99.94%',latency:'18 ms',eta:'17 min',distance:'24.8 km',stops:'03',geofence:'Within zone',harshBrakes:1,idle:'11 min',rpm:'2,160',tire:'89%',lastSync:'2 sec ago',accent:'#6ee7f9',telemetry:{speed:[78,79,81,80,83,84,85,82,86,88,86,84,87,85,86,89,91,88,86,87],fuel:[78,78,77,77,76,76,75,75,75,74,74,73,73,73,72,72,72,72,72,72],temp:[84,85,86,86,87,88,87,88,89,90,91,91,92,92,91,91,90,91,91,91]},routePoints:[[60,218],[110,184],[160,192],[212,152],[274,148],[322,172],[380,130],[452,112],[514,88]],projectedPoints:[[514,88],[548,72],[582,66]]},
 {id:'vector-gt',name:'Vector GT',route:'Banja Luka • Ring Route',driver:'M. Jovanovic',status:'Maintenance Warning',health:'warning',speed:62,fuel:54,range:286,consumption:7.4,temp:96,oil:4.2,battery:13.5,efficiency:81,uptime:'99.12%',latency:'24 ms',eta:'28 min',distance:'31.2 km',stops:'04',geofence:'Deviation 0.8 km',harshBrakes:3,idle:'18 min',rpm:'2,480',tire:'78%',lastSync:'4 sec ago',accent:'#fbbf24',telemetry:{speed:[58,60,59,61,63,64,62,61,60,62,63,65,64,66,65,63,62,61,63,62],fuel:[61,60,60,59,59,58,58,58,57,57,56,56,56,55,55,55,54,54,54,54],temp:[90,91,92,92,93,94,94,95,95,96,96,97,97,96,96,95,95,96,96,96]},routePoints:[[56,190],[96,176],[142,154],[194,132],[244,124],[288,146],[338,162],[392,150],[458,142],[520,122]],projectedPoints:[[520,122],[552,118],[584,110]]},
 {id:'nova-rs',name:'Nova RS',route:'Mostar • South Corridor',driver:'T. Petrovic',status:'Critical Alert',health:'critical',speed:104,fuel:33,range:149,consumption:8.6,temp:101,oil:3.8,battery:13.2,efficiency:68,uptime:'97.86%',latency:'31 ms',eta:'11 min',distance:'18.9 km',stops:'01',geofence:'Within zone',harshBrakes:5,idle:'6 min',rpm:'2,940',tire:'71%',lastSync:'1 sec ago',accent:'#fb7185',telemetry:{speed:[94,96,98,101,99,102,104,106,103,101,104,103,105,107,106,104,103,104,105,104],fuel:[42,42,41,40,40,39,39,38,38,37,37,36,36,35,35,35,34,34,33,33],temp:[94,95,96,97,97,98,99,100,99,99,100,101,101,102,102,101,101,100,101,101]},routePoints:[[72,226],[112,210],[150,194],[194,164],[248,136],[304,126],[370,122],[430,108],[488,82],[540,68]],projectedPoints:[[540,68],[565,58],[590,44]]},
 {id:'atlas-q8',name:'Atlas Q8',route:'Tuzla • East Link',driver:'S. Hadzic',status:'En Route',health:'ok',speed:73,fuel:81,range:492,consumption:6.1,temp:88,oil:4.9,battery:14.1,efficiency:95,uptime:'99.98%',latency:'15 ms',eta:'22 min',distance:'27.3 km',stops:'02',geofence:'Within zone',harshBrakes:0,idle:'8 min',rpm:'1,980',tire:'93%',lastSync:'3 sec ago',accent:'#34d399',telemetry:{speed:[69,68,70,71,72,74,75,74,73,72,74,75,76,74,73,72,73,74,73,73],fuel:[87,87,86,86,86,85,85,85,84,84,84,83,83,82,82,82,81,81,81,81],temp:[84,84,85,85,86,86,87,87,88,88,88,89,89,89,88,88,88,88,88,88]},routePoints:[[58,210],[96,198],[140,176],[190,150],[250,144],[306,154],[360,140],[420,124],[486,110],[540,96]],projectedPoints:[[540,96],[562,89],[585,80]]}
];

const alertsByVehicle = {
 'falcon-xr':[{severity:'medium',title:'Fuel trend anomaly',description:'Consumption increased by 6% over the last 14 minutes.',time:'1 min ago'},{severity:'low',title:'Route optimization ready',description:'Alternative path available with 3 minutes faster ETA.',time:'3 min ago'},{severity:'low',title:'Driver score stable',description:'No aggressive acceleration detected on current segment.',time:'6 min ago'}],
 'vector-gt':[{severity:'high',title:'Brake pad wear threshold',description:'Predictive wear model crossed maintenance threshold on rear axle.',time:'Just now'},{severity:'medium',title:'Route deviation',description:'Vehicle exceeded planned corridor by 0.8 km.',time:'2 min ago'},{severity:'low',title:'Idle event closed',description:'Idle event lasted 4 minutes at dispatch checkpoint.',time:'5 min ago'}],
 'nova-rs':[{severity:'high',title:'Engine temperature spike',description:'Coolant system trending above recommended sustained limit.',time:'Just now'},{severity:'high',title:'Low fuel reserve',description:'Projected range below safe threshold for scheduled delivery path.',time:'1 min ago'},{severity:'medium',title:'Driver behavior flag',description:'Multiple harsh brake events recorded during the last segment.',time:'4 min ago'}],
 'atlas-q8':[{severity:'low',title:'Performance nominal',description:'All telemetry values within expected operational envelope.',time:'30 sec ago'},{severity:'low',title:'Tire pressure stable',description:'Pressure variance remains below 1.2%.',time:'4 min ago'},{severity:'low',title:'ETA unchanged',description:'Traffic and routing conditions remain favorable.',time:'8 min ago'}]
};

const state = {selectedVehicleId:fleetData[0].id,selectedSeries:'speed',autoRotate:true,tick:0};
const dom = {
 vehicleList:document.getElementById('vehicleList'),
 activeVehiclesCount:document.getElementById('activeVehiclesCount'),
 criticalAlertsCount:document.getElementById('criticalAlertsCount'),
 avgFuelHealth:document.getElementById('avgFuelHealth'),
 routeEfficiency:document.getElementById('routeEfficiency'),
 topbarVehicleName:document.getElementById('topbarVehicleName'),
 viewerTitle:document.getElementById('viewerTitle'),
 vehicleStatus:document.getElementById('vehicleStatus'),
 driverName:document.getElementById('driverName'),
 lastSync:document.getElementById('lastSync'),
 uptimeValue:document.getElementById('uptimeValue'),
 latencyValue:document.getElementById('latencyValue'),
 syncValue:document.getElementById('syncValue'),
 speedValue:document.getElementById('speedValue'),
 speedGaugeCenter:document.getElementById('speedGaugeCenter'),
 speedGaugeFill:document.getElementById('speedGaugeFill'),
 fuelValue:document.getElementById('fuelValue'),
 fuelBar:document.getElementById('fuelBar'),
 tempValue:document.getElementById('tempValue'),
 tempBar:document.getElementById('tempBar'),
 rangeValue:document.getElementById('rangeValue'),
 consumptionValue:document.getElementById('consumptionValue'),
 oilValue:document.getElementById('oilValue'),
 batteryValue:document.getElementById('batteryValue'),
 efficiencyValue:document.getElementById('efficiencyValue'),
 etaValue:document.getElementById('etaValue'),
 distanceValue:document.getElementById('distanceValue'),
 stopsValue:document.getElementById('stopsValue'),
 geofenceValue:document.getElementById('geofenceValue'),
 harshBrakeValue:document.getElementById('harshBrakeValue'),
 idleValue:document.getElementById('idleValue'),
 rpmValue:document.getElementById('rpmValue'),
 tireValue:document.getElementById('tireValue'),
 routePath:document.getElementById('routePath'),
 routeProjection:document.getElementById('routeProjection'),
 routeMarker:document.getElementById('routeMarker'),
 routeMap:document.getElementById('routeMap'),
 alertFeed:document.getElementById('alertFeed'),
 alertBadge:document.getElementById('alertBadge'),
 miniTrendChart:document.getElementById('miniTrendChart'),
 telemetryChart:document.getElementById('telemetryChart'),
 resetCameraBtn:document.getElementById('resetCameraBtn'),
 toggleRotateBtn:document.getElementById('toggleRotateBtn'),
 shuffleVehicleBtn:document.getElementById('shuffleVehicleBtn')
};

let renderer, scene, camera, controls, vehicleGroup, floorRing;
const wheelMeshes = [], headLights = [], rearLights = [];

const getSelectedVehicle = () => fleetData.find(v => v.id === state.selectedVehicleId);

function renderFleetList() {
 dom.vehicleList.innerHTML = fleetData.map(vehicle => `
  <article class="vehicle-card-item ${vehicle.id===state.selectedVehicleId?'active':''}" data-vehicle-id="${vehicle.id}">
   <div class="vehicle-card-top">
    <div><div class="vehicle-name">${vehicle.name}</div><div class="vehicle-meta">${vehicle.route}</div></div>
    <span class="status-pill status-${vehicle.health}">${vehicle.health==='ok'?'Optimal':vehicle.health==='warning'?'Attention':'Critical'}</span>
   </div>
   <div class="vehicle-card-bottom">
    <div class="vehicle-card-stats"><span>${vehicle.speed} km/h</span><span>•</span><span>${vehicle.fuel}% fuel</span></div>
    <div class="vehicle-card-stats"><span>${vehicle.driver}</span></div>
   </div>
  </article>`).join('');
 dom.vehicleList.querySelectorAll('[data-vehicle-id]').forEach(card => {
  card.addEventListener('click', () => { state.selectedVehicleId = card.dataset.vehicleId; updateDashboard(); });
 });
}

function updateFleetSummary() {
 dom.activeVehiclesCount.textContent = String(fleetData.length + 8);
 dom.criticalAlertsCount.textContent = String(fleetData.filter(v => v.health==='critical').length + 1);
 dom.avgFuelHealth.textContent = `${Math.round(fleetData.reduce((s,v) => s + v.fuel,0) / fleetData.length)}%`;
 dom.routeEfficiency.textContent = `${(fleetData.reduce((s,v) => s + v.efficiency,0) / fleetData.length).toFixed(1)}%`;
}

function updateMetrics() {
 const vehicle = getSelectedVehicle();
 dom.topbarVehicleName.textContent = `${vehicle.name} • ${vehicle.route}`;
 dom.viewerTitle.textContent = vehicle.name;
 dom.vehicleStatus.textContent = vehicle.status;
 dom.driverName.textContent = vehicle.driver;
 dom.lastSync.textContent = vehicle.lastSync;
 dom.uptimeValue.textContent = vehicle.uptime;
 dom.latencyValue.textContent = vehicle.latency;
 dom.syncValue.textContent = 'Real-time';
 dom.speedValue.textContent = `${vehicle.speed} km/h`;
 dom.speedGaugeCenter.textContent = String(vehicle.speed);
 dom.speedGaugeFill.style.setProperty('--deg', `${Math.max(32, Math.min(270, vehicle.speed * 2.35))}deg`);
 dom.fuelValue.textContent = `${vehicle.fuel}%`;
 dom.fuelBar.style.width = `${vehicle.fuel}%`;
 dom.rangeValue.textContent = `Range ${vehicle.range} km`;
 dom.consumptionValue.textContent = `${vehicle.consumption.toFixed(1)} L / 100km`;
 dom.tempValue.textContent = `${vehicle.temp}°C`;
 dom.tempBar.style.width = `${Math.min(100, vehicle.temp)}%`;
 dom.oilValue.textContent = `Oil ${vehicle.oil.toFixed(1)} bar`;
 dom.batteryValue.textContent = `Battery ${vehicle.battery.toFixed(1)}V`;
 dom.efficiencyValue.textContent = `${vehicle.efficiency} / 100`;
 dom.etaValue.textContent = vehicle.eta;
 dom.distanceValue.textContent = vehicle.distance;
 dom.stopsValue.textContent = vehicle.stops;
 dom.geofenceValue.textContent = vehicle.geofence;
 dom.harshBrakeValue.textContent = String(vehicle.harshBrakes);
 dom.idleValue.textContent = vehicle.idle;
 dom.rpmValue.textContent = vehicle.rpm;
 dom.tireValue.textContent = vehicle.tire;
}

function renderAlerts() {
 const alerts = alertsByVehicle[getSelectedVehicle().id];
 const highCount = alerts.filter(a => a.severity === 'high').length;
 dom.alertBadge.textContent = highCount > 0 ? `${highCount} High` : 'Stable';
 dom.alertFeed.innerHTML = alerts.map(alert => `
  <article class="alert-item ${alert.severity}">
   <div class="alert-top"><div class="alert-title">${alert.title}</div><div class="alert-time">${alert.time}</div></div>
   <div class="alert-desc">${alert.description}</div>
  </article>`).join('');
}

function createMapGrid() {
 const gridGroup = dom.routeMap.querySelector('.map-grid');
 let lines = '';
 for (let x=0; x<=600; x+=40) lines += `<line x1="${x}" y1="0" x2="${x}" y2="280"></line>`;
 for (let y=0; y<=280; y+=40) lines += `<line x1="0" y1="${y}" x2="600" y2="${y}"></line>`;
 gridGroup.innerHTML = lines;
}

const pointsToString = points => points.map(([x,y]) => `${x},${y}`).join(' ');
const lerp = (a,b,t) => a + (b-a)*t;

function getPointAlongPolyline(points, t) {
 const segments = [];
 let totalLength = 0;
 for (let i=0; i<points.length-1; i++) {
  const [x1,y1] = points[i], [x2,y2] = points[i+1];
  const length = Math.hypot(x2-x1, y2-y1);
  segments.push({length, from:points[i], to:points[i+1]});
  totalLength += length;
 }
 const target = totalLength * t;
 let traversed = 0;
 for (const segment of segments) {
  if (traversed + segment.length >= target) {
   const localT = (target - traversed) / segment.length;
   return [lerp(segment.from[0], segment.to[0], localT), lerp(segment.from[1], segment.to[1], localT)];
  }
  traversed += segment.length;
 }
 return points[points.length - 1];
}

function updateRouteMap() {
 const vehicle = getSelectedVehicle();
 dom.routePath.setAttribute('points', pointsToString(vehicle.routePoints));
 dom.routeProjection.setAttribute('points', pointsToString(vehicle.projectedPoints));
 const markerPoint = getPointAlongPolyline(vehicle.routePoints, (Math.sin(state.tick * 0.015) + 1) / 2);
 dom.routeMarker.setAttribute('cx', markerPoint[0]);
 dom.routeMarker.setAttribute('cy', markerPoint[1]);
}

function setupThreeScene() {
 const canvas = document.getElementById('vehicleCanvas');
 renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 scene = new THREE.Scene();
 camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
 camera.position.set(6.4, 3.1, 7.2);
 controls = new OrbitControls(camera, canvas);
 controls.enableDamping = true;
 controls.enablePan = false;
 controls.minDistance = 5;
 controls.maxDistance = 11;
 controls.maxPolarAngle = Math.PI / 2.05;
 controls.autoRotate = state.autoRotate;
 controls.autoRotateSpeed = 1.6;
 controls.target.set(0, 0.9, 0);
 scene.add(new THREE.HemisphereLight(0xe6faff, 0x0b1020, 1.25));
 const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
 keyLight.position.set(5, 8, 5);
 scene.add(keyLight);
 const rimLight = new THREE.PointLight(0x8b5cf6, 26, 30);
 rimLight.position.set(-5, 3, -4);
 scene.add(rimLight);
 const floor = new THREE.Mesh(new THREE.CircleGeometry(6.5, 64), new THREE.MeshPhysicalMaterial({color:0x0b1224, metalness:.65, roughness:.4, transparent:true, opacity:.86}));
 floor.rotation.x = -Math.PI / 2;
 floor.position.y = -.82;
 scene.add(floor);
 floorRing = new THREE.Mesh(new THREE.RingGeometry(4.7, 5.1, 96), new THREE.MeshBasicMaterial({color:0x6ee7f9, transparent:true, opacity:.45, side:THREE.DoubleSide}));
 floorRing.rotation.x = -Math.PI / 2;
 floorRing.position.y = -.8;
 scene.add(floorRing);
 buildVehicleModel();
 resizeThreeScene();
 new ResizeObserver(resizeThreeScene).observe(canvas.parentElement);
}

function buildVehicleModel() {
 vehicleGroup = new THREE.Group();
 scene.add(vehicleGroup);
 const glassMaterial = new THREE.MeshPhysicalMaterial({color:0xbbe7ff, transparent:true, opacity:.18, transmission:.8, roughness:.08, metalness:.12});
 const bodyMaterial = new THREE.MeshPhysicalMaterial({color:new THREE.Color(getSelectedVehicle().accent), metalness:.7, roughness:.24, clearcoat:1, clearcoatRoughness:.16});
 const darkMaterial = new THREE.MeshStandardMaterial({color:0x0b1120, metalness:.5, roughness:.35});
 const bodyBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, .9, 1.82), bodyMaterial);
 bodyBase.position.y = .12;
 bodyBase.scale.z = .96;
 vehicleGroup.add(bodyBase);
 const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, .72, 1.44), bodyMaterial);
 cabin.position.set(-.08, .78, 0);
 vehicleGroup.add(cabin);
 const roofGlass = new THREE.Mesh(new THREE.BoxGeometry(1.52, .56, 1.28), glassMaterial);
 roofGlass.position.set(-.08, .8, 0);
 vehicleGroup.add(roofGlass);
 const hood = new THREE.Mesh(new THREE.BoxGeometry(1.02, .22, 1.6), bodyMaterial);
 hood.position.set(1.23, .56, 0);
 hood.rotation.z = -.08;
 vehicleGroup.add(hood);
 const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(.95, .28, 1.54), bodyMaterial);
 rearDeck.position.set(-1.22, .58, 0);
 rearDeck.rotation.z = .08;
 vehicleGroup.add(rearDeck);
 const splitter = new THREE.Mesh(new THREE.BoxGeometry(.48,.14,1.6), darkMaterial);
 splitter.position.set(1.83, -.08, 0);
 vehicleGroup.add(splitter);
 const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(.45,.12,1.46), darkMaterial);
 rearDiffuser.position.set(-1.82, -.12, 0);
 vehicleGroup.add(rearDiffuser);
 const skirtGeometry = new THREE.BoxGeometry(3.0, .12, .16);
 const skirtLeft = new THREE.Mesh(skirtGeometry, darkMaterial);
 skirtLeft.position.set(0, -.22, .88);
 vehicleGroup.add(skirtLeft);
 const skirtRight = skirtLeft.clone();
 skirtRight.position.z = -.88;
 vehicleGroup.add(skirtRight);
 const wheelMaterial = new THREE.MeshStandardMaterial({color:0x141926, roughness:.48, metalness:.42});
 const rimMaterial = new THREE.MeshStandardMaterial({color:0xd9f0ff, roughness:.22, metalness:.84});
 [[1.1,-.33,.97],[1.1,-.33,-.97],[-1.12,-.33,.97],[-1.12,-.33,-.97]].forEach(([x,y,z]) => {
  const group = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.34,32), wheelMaterial);
  tire.rotation.z = Math.PI/2;
  group.add(tire);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.36,16), rimMaterial);
  rim.rotation.z = Math.PI/2;
  group.add(rim);
  group.position.set(x,y,z);
  vehicleGroup.add(group);
  wheelMeshes.push(group);
 });
 [0.55,-0.55].forEach(z => {
  const light = new THREE.Mesh(new THREE.BoxGeometry(.15,.12,.32), new THREE.MeshBasicMaterial({color:0xcffafe}));
  light.position.set(1.73,.28,z);
  vehicleGroup.add(light);
  headLights.push(light);
 });
 [0.54,-0.54].forEach(z => {
  const light = new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.36), new THREE.MeshBasicMaterial({color:0xfb7185}));
  light.position.set(-1.74,.26,z);
  vehicleGroup.add(light);
  rearLights.push(light);
 });
 const underGlow = new THREE.Mesh(new THREE.CylinderGeometry(1.65,1.75,.03,48), new THREE.MeshBasicMaterial({color:0x6ee7f9, transparent:true, opacity:.18}));
 underGlow.position.y = -.48;
 vehicleGroup.add(underGlow);
 vehicleGroup.rotation.y = Math.PI * .18;
}

function resizeThreeScene() {
 const canvas = document.getElementById('vehicleCanvas');
 const {clientWidth, clientHeight} = canvas;
 renderer.setSize(clientWidth, clientHeight, false);
 camera.aspect = clientWidth / clientHeight;
 camera.updateProjectionMatrix();
}

function updateVehicleModelAppearance() {
 const vehicle = getSelectedVehicle();
 const color = new THREE.Color(vehicle.accent);
 vehicleGroup.traverse(child => {
  if (child.isMesh && child.material instanceof THREE.MeshPhysicalMaterial && child.material.opacity === 1) {
   child.material.color.copy(color);
  }
 });
 headLights.forEach(light => { light.material.color.setHex(vehicle.health === 'critical' ? 0xffd7b8 : 0xcffafe); });
 rearLights.forEach(light => { light.material.color.setHex(vehicle.health === 'critical' ? 0xff4d6d : 0xfb7185); });
 floorRing.material.color.set(color);
 floorRing.material.opacity = vehicle.health === 'critical' ? .78 : vehicle.health === 'warning' ? .56 : .4;
}

function drawLineChart(canvas, values, accent, lineWidth=3) {
 const dpi = Math.min(window.devicePixelRatio || 1, 2);
 const width = canvas.clientWidth || 300;
 const height = canvas.clientHeight || 180;
 canvas.width = width * dpi;
 canvas.height = height * dpi;
 const ctx = canvas.getContext('2d');
 ctx.setTransform(dpi,0,0,dpi,0,0);
 ctx.clearRect(0,0,width,height);
 const pad = {top:18,right:16,bottom:22,left:16};
 const chartWidth = width - pad.left - pad.right;
 const chartHeight = height - pad.top - pad.bottom;
 const min = Math.min(...values) - 2;
 const max = Math.max(...values) + 2;
 ctx.strokeStyle = 'rgba(255,255,255,.08)';
 ctx.lineWidth = 1;
 for (let row=0; row<4; row++) {
  const y = pad.top + (chartHeight / 3) * row;
  ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
 }
 const points = values.map((value, index) => ({
  x: pad.left + (chartWidth / (values.length - 1)) * index,
  y: pad.top + chartHeight - ((value - min) / (max - min || 1)) * chartHeight
 }));
 const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
 gradient.addColorStop(0, `${accent}aa`);
 gradient.addColorStop(1, `${accent}08`);
 ctx.beginPath();
 ctx.moveTo(points[0].x, height - pad.bottom);
 points.forEach((point, index) => {
  if (index === 0) ctx.lineTo(point.x, point.y);
  else {
   const prev = points[index - 1];
   const cpX = (prev.x + point.x) / 2;
   ctx.bezierCurveTo(cpX, prev.y, cpX, point.y, point.x, point.y);
  }
 });
 ctx.lineTo(points[points.length - 1].x, height - pad.bottom);
 ctx.closePath();
 ctx.fillStyle = gradient;
 ctx.fill();
 ctx.beginPath();
 points.forEach((point, index) => {
  if (index === 0) ctx.moveTo(point.x, point.y);
  else {
   const prev = points[index - 1];
   const cpX = (prev.x + point.x) / 2;
   ctx.bezierCurveTo(cpX, prev.y, cpX, point.y, point.x, point.y);
  }
 });
 ctx.strokeStyle = accent;
 ctx.lineWidth = lineWidth;
 ctx.stroke();
 const last = points[points.length - 1];
 ctx.beginPath();
 ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
 ctx.fillStyle = accent;
 ctx.fill();
}

function renderCharts() {
 const vehicle = getSelectedVehicle();
 drawLineChart(dom.miniTrendChart, vehicle.telemetry.speed.slice(-12), vehicle.accent, 2.6);
 drawLineChart(dom.telemetryChart, vehicle.telemetry[state.selectedSeries], vehicle.accent, 3.4);
}

function updateDashboard() {
 renderFleetList();
 updateFleetSummary();
 updateMetrics();
 renderAlerts();
 updateRouteMap();
 updateVehicleModelAppearance();
 renderCharts();
}

function simulateTelemetry() {
 state.tick += 1;
 fleetData.forEach(vehicle => {
  vehicle.speed = Math.max(28, Math.min(126, vehicle.speed + Math.round((Math.random() - .5) * 6)));
  vehicle.fuel = Math.max(14, Math.min(100, vehicle.fuel - Math.random() * .18));
  vehicle.temp = Math.max(76, Math.min(108, vehicle.temp + (Math.random() - .48) * 1.4));
  vehicle.range = Math.max(72, Math.round(vehicle.range - vehicle.speed * .008 + Math.random() * 1.2));
  vehicle.consumption = Math.max(5.4, Math.min(9.4, vehicle.consumption + (Math.random() - .5) * .12));
  vehicle.oil = Math.max(3.4, Math.min(5.2, vehicle.oil + (Math.random() - .5) * .03));
  vehicle.battery = Math.max(12.9, Math.min(14.4, vehicle.battery + (Math.random() - .5) * .04));
  vehicle.efficiency = Math.max(58, Math.min(98, Math.round(vehicle.efficiency + (Math.random() - .5) * 2)));
  vehicle.harshBrakes = Math.max(0, Math.min(7, vehicle.harshBrakes + (Math.random() > .94 ? 1 : 0)));
  vehicle.lastSync = 'just now';
  Object.keys(vehicle.telemetry).forEach(key => {
   const series = vehicle.telemetry[key];
   let nextValue = series[series.length - 1];
   if (key === 'speed') nextValue = vehicle.speed + (Math.random() - .5) * 4;
   if (key === 'fuel') nextValue = Math.max(10, vehicle.fuel + (Math.random() - .5) * .5);
   if (key === 'temp') nextValue = vehicle.temp + (Math.random() - .5) * 1.2;
   series.push(Number(nextValue.toFixed(1)));
   if (series.length > 20) series.shift();
  });
 });
 updateRouteMap();
 updateMetrics();
 renderCharts();
 renderFleetList();
}

function animate() {
 requestAnimationFrame(animate);
 const vehicle = getSelectedVehicle();
 const pulse = (Math.sin(state.tick * .06) + 1) / 2;
 wheelMeshes.forEach((wheel, index) => {
  wheel.rotation.x += vehicle.speed * .0009;
  if (index < 2) wheel.rotation.y = Math.sin(state.tick * .015) * .06;
 });
 vehicleGroup.position.y = Math.sin(state.tick * .025) * .03;
 vehicleGroup.rotation.z = Math.sin(state.tick * .018) * .012;
 floorRing.material.opacity = (vehicle.health === 'critical' ? .65 : .32) + pulse * .08;
 controls.autoRotate = state.autoRotate;
 controls.update();
 renderer.render(scene, camera);
}

function bindInteractions() {
 document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
   document.querySelectorAll('.tab-button').forEach(item => item.classList.remove('active'));
   button.classList.add('active');
   state.selectedSeries = button.dataset.series;
   renderCharts();
  });
 });
 dom.resetCameraBtn.addEventListener('click', () => {
  camera.position.set(6.4, 3.1, 7.2);
  controls.target.set(0, .9, 0);
  controls.update();
 });
 dom.toggleRotateBtn.addEventListener('click', () => {
  state.autoRotate = !state.autoRotate;
  dom.toggleRotateBtn.textContent = state.autoRotate ? 'Auto Rotate' : 'Manual View';
 });
 dom.shuffleVehicleBtn.addEventListener('click', () => {
  const idx = fleetData.findIndex(v => v.id === state.selectedVehicleId);
  state.selectedVehicleId = fleetData[(idx + 1) % fleetData.length].id;
  updateDashboard();
 });
 window.addEventListener('resize', renderCharts);
}

function init() {
 createMapGrid();
 setupThreeScene();
 bindInteractions();
 updateDashboard();
 animate();
 setInterval(simulateTelemetry, 1400);
}

init();
