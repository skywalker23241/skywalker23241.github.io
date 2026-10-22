/**
 * Abo Memoji avatar v2: fully modeled facial geometry and animated greeting.
 * No image-plane deformation, external CDN, or additional runtime downloads.
 * Original PNG remains in the page as a fallback.
 */
import {
  Group, Mesh, SphereGeometry, TubeGeometry, CatmullRomCurve3,
  Vector3, MeshStandardMaterial, MeshBasicMaterial, BufferGeometry,
  Float32BufferAttribute, Scene, OrthographicCamera, WebGLRenderer,
  HemisphereLight, DirectionalLight, DoubleSide,
} from './avatar-renderer.js';

export const DURATIONS = Object.freeze({ intro: 1.7, full: 4.8 });
const clamp = (x, a=0, b=1) => Math.min(b, Math.max(a, x));
const smooth = t => { t = clamp(t); return t*t*(3-2*t); };
const pulse = (t,a,b) => (t<=a||t>=b)?0:Math.sin(Math.PI*(t-a)/(b-a))**2;
const keys = (t,points) => {
  for(let i=1;i<points.length;i++){
    if(t<=points[i][0]){
      const [a,v]=points[i-1], [b,w]=points[i];
      return v+(w-v)*smooth((t-a)/(b-a));
    }
  }
  return points[points.length-1][1];
};
export function sampleGreeting(time,kind='full'){
  const full=kind==='full', length=DURATIONS[full?'full':'intro'], t=clamp(time,0,length);
  const envelope=smooth(t/.33)*smooth((length-t)/.32);
  const hand=full?keys(t,[[0,0],[2.18,0],[2.75,1],[4.06,1],[4.65,0],[4.8,0]]):0;
  return {
    pitch:.115*pulse(t,.20,1.08)-.025*pulse(t,1.12,1.58),
    yaw:full?keys(t,[[0,0],[1.12,0],[1.61,-.16],[2.02,.15],[2.42,0],[4.8,0]]):0,
    roll:.02*Math.sin(t*4.4)*envelope,
    lift:.012*envelope,
    blink:Math.max(pulse(t,.71,.94),full?pulse(t,2.28,2.51):0,full?pulse(t,4.05,4.28):0),
    handLift:hand,
    wave:full?.27*Math.sin((t-2.7)*Math.PI*4.5)*pulse(t,2.55,4.20):0,
    fingerCurl:hand*(.04+.018*Math.sin(t*4)),
    smile:full?.08*pulse(t,1.85,3.05):0,
  };
}

const material=(color,options={})=>new MeshStandardMaterial({color,roughness:.77,metalness:0,...options});
const skin=material('#e9b99d');
const skinHigh=material('#f1c3a6',{roughness:.81});
const earInner=material('#cd8f80',{roughness:.9});
const hair=material('#241b19',{roughness:.73});
const locks=['#302320','#291f1d','#352824','#251c1a','#382b25','#2a201d']
  .map(c=>material(c,{roughness:.72,side:DoubleSide}));
const sheen=material('#49362f',{roughness:.8});
const white=material('#fff6ea',{roughness:.49});
const iris=material('#684130',{roughness:.38});
const pupilMat=material('#201614',{roughness:.18});
const glintMat=new MeshBasicMaterial({color:'#ffffff'});
const brow=material('#312321',{roughness:.85});
const rim=material('#272729',{roughness:.33,metalness:.14});
const hinge=material('#514c4d',{roughness:.4,metalness:.45});
const cavity=material('#552b30',{roughness:.9,side:DoubleSide});
const teeth=material('#fff3eb',{roughness:.68,side:DoubleSide});
const tongue=material('#c57a80',{roughness:.84});
const lip=material('#be8279',{roughness:.86});
const sphere=new SphereGeometry(1,32,22);

function orb(group,name,mat,position,scale,geom=sphere){
  const mesh=new Mesh(geom,mat);
  mesh.name=name;mesh.position.set(...position);mesh.scale.set(...scale);
  group.add(mesh);return mesh;
}
function tube(group,name,coords,radius,mat,segments=36){
  const curve=new CatmullRomCurve3(coords.map(p=>new Vector3(...p)));
  const mesh=new Mesh(new TubeGeometry(curve,segments,radius,8,false),mat);
  mesh.name=name;group.add(mesh);return mesh;
}
function strand(points,maxWidth,mat){
  const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)));
  const positions=[],indices=[],steps=18,across=8;
  for(let i=0;i<=steps;i++){
    const t=i/steps,c=curve.getPoint(t),v=curve.getTangent(t);
    const n=new Vector3(v.y,-v.x,0).normalize();
    const w=maxWidth*Math.pow(Math.sin(Math.PI*Math.max(.001,t)),.62)*(1-.35*t);
    for(let j=0;j<=across;j++){
      const u=j/across*2-1;
      positions.push(c.x+n.x*w*u,c.y+n.y*w*u,c.z+(1-u*u)*w*.36);
      if(i<steps&&j<across){
        const a=i*(across+1)+j,b=a+across+1;
        indices.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  const geo=new BufferGeometry();
  geo.setAttribute('position',new Float32BufferAttribute(positions,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  return new Mesh(geo,mat);
}
function headGeo(){
  const geo=new SphereGeometry(1,56,40),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),jaw=Math.max(0,-y);
    const width=.83*(1-.21*Math.pow(jaw,1.7));
    const cheek=Math.exp(-Math.pow((y+.28)/.38,2))*.023;
    p.setXYZ(i,x*(width+cheek),y*1.005-.12,z*(.635-.075*jaw)+.025);
  }
  geo.computeVertexNormals();return geo;
}
function frontZ(x,y){
  const nx=x/.83,ny=(y+.12)/1.005;
  return .025+(.635-.075*Math.max(0,-ny))*Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
}
function oval(cx,cy,rx,ry,z,segments=44){
  const pts=[];
  for(let i=0;i<=segments;i++){
    const a=2*Math.PI*i/segments,x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a);
    pts.push([x,y,z-.095*Math.abs(x)]);
  }
  return pts;
}
function makeModel(){
  const root=new Group();root.name='AboTrue3DMemoji';
  const head=new Group();head.name='AnimatedHead';root.add(head);
  const features=new Group();features.name='FacialFeatures';head.add(features);
  const face=new Mesh(headGeo(),skin);face.name='True3DHeadNotImagePlane';head.add(face);
  [-1,1].forEach(sign=>{
    orb(head,'Ear',skin,[sign*.775,-.195,-.055],[.165,.235,.105]);
    orb(head,'EarConcha',earInner,[sign*.881,-.218,.026],[.045,.127,.026]);
    orb(head,'EarInnerHighlight',skinHigh,[sign*.873,-.255,.05],[.021,.063,.015]);
  });
  const cap=new SphereGeometry(1,56,26,0,Math.PI*2,0,Math.PI*.66);
  orb(head,'VolumetricHairCap',hair,[0,.435,-.035],[.865,.69,.697],cap);
  orb(head,'SideHairLeft',hair,[-.667,.49,.02],[.203,.435,.39]);
  orb(head,'SideHairRight',hair,[.667,.46,.012],[.204,.421,.39]);

  const bangs=[
    [[-.73,.79,.40],[-.60,.62,.66],[-.57,.38,.69]],
    [[-.64,.98,.47],[-.43,.78,.704],[-.28,.425,.69]],
    [[-.53,1.047,.52],[-.24,.86,.758],[.015,.463,.725]],
    [[-.41,1.083,.53],[-.11,.875,.775],[.20,.455,.733]],
    [[-.29,1.086,.49],[.03,.842,.78],[.35,.449,.721]],
    [[-.16,1.070,.46],[.18,.826,.766],[.48,.417,.681]],
    [[-.025,1.026,.43],[.35,.781,.724],[.625,.390,.609]],
    [[.115,.962,.405],[.464,.738,.692],[.748,.396,.50]],
  ];
  bangs.forEach((p,i)=>{
    const lock=strand(p,.106-i*.0035,locks[i%locks.length]);
    lock.name='LayeredSideSweptLock'+(i+1);head.add(lock);
  });
  for(let i=0;i<13;i++){
    const t=i/12,x=-.66+t*.9;
    tube(head,'HairHighlight'+i,[
      [x,.965-t*.085,.61],[x+.14,.837-t*.07,.752],
      [x+.34,.632-t*.075,.763],[x+.40,.510-t*.06,.722]
    ],.0038,sheen,15);
  }

  const lids=[],eyes=[],glints=[];
  [-1,1].forEach((sign,index)=>{
    const cx=sign*.317,cy=-.008,z=frontZ(cx,cy);
    orb(features,'EyeSocket'+index,skinHigh,[cx,cy+.013,z+.03],[.247,.188,.062]);
    orb(features,'Sclera'+index,white,[cx,cy,z+.073],[.206,.147,.081]);
    const irisMesh=orb(features,'BrownIris'+index,iris,[cx-.008,cy,z+.153],[.107,.119,.025]);
    const pupil=orb(features,'DarkPupil'+index,pupilMat,[cx-.008,cy,z+.176],[.059,.075,.017]);
    const glint=orb(features,'IrisCatchlight'+index,glintMat,[cx-.045,cy+.061,z+.193],[.023,.026,.01]);
    orb(features,'SmallCatchlight'+index,glintMat,[cx+.041,cy-.036,z+.191],[.01,.012,.006]);
    const lid=orb(features,'ArticulatedEyelid'+index,skin,[cx,cy+.15,z+.197],[.215,.002,.049]);
    lids.push({lid,cy});eyes.push({irisMesh,pupil,cx,cy});glints.push(glint);
    tube(features,'3DEyebrow'+index,[
      [cx-.195,.322,frontZ(cx-.195,.325)+.05],
      [cx-.094,.377,frontZ(cx-.094,.37)+.075],
      [cx+.060,.383,frontZ(cx+.060,.375)+.072],
      [cx+.181,.34,frontZ(cx+.181,.34)+.04]
    ],.027,brow,30);
    tube(features,'RoundEyeglassesRim'+index,oval(cx,.018,.255,.213,.894),.028,rim,55);
  });
  tube(features,'RoundEyeglassesBridge',[
    [-.073,.092,.870],[-.036,.12,.89],[0,.126,.898],[.036,.12,.89],[.073,.092,.870]
  ],.026,rim,18);
  [-1,1].forEach(s=>{
    orb(features,'GlassesHinge',hinge,[s*.58,.057,.84],[.041,.032,.032]);
    tube(features,'3DGlassesTemple',[
      [s*.565,.06,.84],[s*.69,.048,.64],[s*.83,.025,.31]
    ],.022,rim,24);
  });
  orb(features,'NoseBridge',skinHigh,[0,-.315,.611],[.075,.175,.082]);
  orb(features,'NoseTip',skinHigh,[0,-.405,.680],[.12,.07,.075]);
  orb(features,'NostrilWingL',skin,[-.096,-.422,.635],[.057,.044,.033]);
  orb(features,'NostrilWingR',skin,[.096,-.422,.635],[.057,.044,.033]);

  const smile=new Group();smile.name='3DOpenSmile';features.add(smile);
  const mouthPoints=[],teethPoints=[],upperLine=[],lowerLine=[],steps=32,w=.255;
  for(let i=0;i<=steps;i++){
    const t=-1+2*i/steps,x=w*t,upper=-.623+.077*t*t;
    const opening=.16*Math.pow(Math.max(0,1-t*t),.74);
    const z=frontZ(x,upper)+.042;
    mouthPoints.push(x,upper,z+.011,x,upper-opening,z+.011);
    teethPoints.push(x,upper-.011,z+.019,x,upper-.046*(1-t*t),z+.019);
    upperLine.push([x,upper+.012,z+.022]);
    lowerLine.push([x,upper-opening-.005,z+.015]);
  }
  function ribbon(name,coords,mat){
    const geo=new BufferGeometry(),idx=[];
    for(let i=0;i<steps;i++){const j=i*2;idx.push(j,j+1,j+2,j+1,j+3,j+2);}
    geo.setAttribute('position',new Float32BufferAttribute(coords,3));
    geo.setIndex(idx);geo.computeVertexNormals();
    const mesh=new Mesh(geo,mat);mesh.name=name;smile.add(mesh);
  }
  ribbon('MouthCavity',mouthPoints,cavity);
  ribbon('UpperTeeth',teethPoints,teeth);
  tube(smile,'SmilingUpperLip',upperLine,.011,lip,40);
  tube(smile,'SmilingLowerLip',lowerLine,.01,lip,40);
  orb(smile,'Tongue',tongue,[0,-.741,.545],[.094,.032,.019]);

  const hand=new Group();hand.name='ArticulatedWavingHand';root.add(hand);
  orb(hand,'Wrist',skin,[0,-.205,0],[.078,.18,.064]);
  orb(hand,'Palm',skin,[0,0,0],[.143,.181,.072]);
  const fingers=[],lengths=[.228,.267,.248,.198];
  [-.105,-.034,.041,.110].forEach((x,i)=>{
    const f=new Group();f.position.set(x,.146,0);f.name='Finger'+(i+1);hand.add(f);
    orb(f,'FingerBody',skin,[0,lengths[i]*.46,0],[.031,lengths[i]*.55,.038]);
    orb(f,'FingerTip',skin,[0,lengths[i]*.94,0],[.03,.037,.037]);
    fingers.push(f);
  });
  const thumb=new Group();thumb.position.set(-.13,-.036,.018);thumb.rotation.z=.84;hand.add(thumb);
  orb(thumb,'Thumb',skin,[0,.103,0],[.048,.148,.055]);
  hand.visible=false;

  function applyPose(p){
    head.rotation.set(p.pitch||0,p.yaw||0,p.roll||0,'YXZ');
    head.position.y=p.lift||0;
    const blink=clamp(p.blink||0);
    lids.forEach(({lid,cy})=>{
      lid.position.y=cy+.15-.15*blink;
      lid.scale.y=.002+.157*blink;lid.visible=blink>.001;
    });
    const dx=clamp((p.yaw||0)*.085,-.02,.02);
    const dy=clamp(-(p.pitch||0)*.065,-.012,.012);
    eyes.forEach(({irisMesh,pupil,cx,cy})=>{
      irisMesh.position.x=pupil.position.x=cx-.008+dx;
      irisMesh.position.y=pupil.position.y=cy+dy;
    });
    glints.forEach((m,i)=>{
      m.position.x=eyes[i].cx-.045+dx;
      m.position.y=eyes[i].cy+.061+dy;
    });
    const amount=clamp(p.handLift||0);
    hand.visible=amount>.009;
    hand.position.set(1.015,-1.40+1.04*amount,.53);
    hand.rotation.set(-.12,-.18,-.10+(p.wave||0),'XYZ');
    hand.scale.setScalar(.88*smooth(amount/.20));
    fingers.forEach((f,i)=>{f.rotation.x=(p.fingerCurl||0)*(1+i*.16);});
    smile.scale.y=1+(p.smile||0);
  }
  return {root,applyPose};
}

export function createAvatarScene(canvas){
  const renderer=new WebGLRenderer({
    canvas,alpha:true,antialias:true,powerPreference:'low-power',
    premultipliedAlpha:false
  });
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace='srgb';
  const scene=new Scene();
  const camera=new OrthographicCamera(-1.34,1.34,1.34,-1.34,.1,12);
  camera.position.set(0,.035,6);camera.lookAt(0,.035,0);
  scene.add(new HemisphereLight(0xffffff,0x886c65,2.05));
  const key=new DirectionalLight(0xffeadd,2.55);key.position.set(-3,4.5,5);scene.add(key);
  const fill=new DirectionalLight(0xd8e4ff,.74);fill.position.set(4,1,3);scene.add(fill);
  const back=new DirectionalLight(0xffe3c4,.55);back.position.set(1,3,-4);scene.add(back);
  const model=makeModel();scene.add(model.root);
  let disposed=false;
  return {
    setSize(size){if(!disposed)renderer.setSize(size,size,false);},
    render(pose){if(!disposed){model.applyPose(pose);renderer.render(scene,camera);}},
    dispose(){if(disposed)return;disposed=true;
      const geoms=new Set(),mats=new Set();
      model.root.traverse(o=>{if(o.geometry)geoms.add(o.geometry);if(o.material)mats.add(o.material);});
      geoms.forEach(g=>{if(g!==sphere)g.dispose();});
      mats.forEach(m=>m.dispose());sphere.dispose();renderer.dispose();
    }
  };
}
