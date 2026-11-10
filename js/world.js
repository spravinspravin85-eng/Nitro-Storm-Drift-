import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWorld(scene, roadTexture) {
  const world = new THREE.Group(); scene.add(world);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300,900),new THREE.MeshStandardMaterial({color:0x17202b,roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.position.set(0,-0.13,-350); ground.receiveShadow=true; world.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({map:roadTexture,color:0xffffff,roughness:0.92});
  const road = new THREE.Mesh(new THREE.PlaneGeometry(18,900),roadMat);
  road.rotation.x=-Math.PI/2; road.position.set(0,0,-350); road.receiveShadow=true; world.add(road);

  const edgeMat = new THREE.MeshStandardMaterial({color:0xffa52b,emissive:0x331400});
  for (const x of [-8.65,8.65]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.16,900),edgeMat);
    edge.rotation.x=-Math.PI/2; edge.position.set(x,0.02,-350); world.add(edge);
  }
  const dashMat = new THREE.MeshBasicMaterial({color:0xe9edf1});
  for (let z=70;z>-800;z-=18) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.13,7),dashMat);
    dash.rotation.x=-Math.PI/2; dash.position.set(0,0.025,z); world.add(dash);
  }

  const buildingColors=[0x26364b,0x344357,0x202c3e,0x48546a,0x293044,0x3c4658];
  let seed=17;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<115;i++){
    const z=65-i*7.2;
    for(const side of [-1,1]){
      const w=6+rand()*8,h=12+rand()*38,d=6+rand()*7;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:buildingColors[i%buildingColors.length],roughness:.85,metalness:.12}));
      b.position.set(side*(17+w/2+rand()*8),h/2,z);b.castShadow=true;b.receiveShadow=true;world.add(b);
      const windowMat=new THREE.MeshBasicMaterial({color:i%3===0?0x00aaff:0xffc56b});
      for(let row=0;row<Math.min(7,Math.floor(h/5));row++){
        const win=new THREE.Mesh(new THREE.BoxGeometry(w*.65,.16,.07),windowMat);
        win.position.set(b.position.x,2+row*3.8,z+d/2+.05);world.add(win);
      }
    }
  }
  const poleMat=new THREE.MeshStandardMaterial({color:0x778899,metalness:.7,roughness:.35});
  for(let z=55;z>-800;z-=38) for(const side of [-1,1]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.11,6,8),poleMat);
    pole.position.set(side*10.5,3,z);world.add(pole);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.2,8,8),new THREE.MeshBasicMaterial({color:0x8adfff}));
    lamp.position.set(side*10.5,6.1,z);world.add(lamp);
  }
  return world;
}

export function createTraffic(scene) {
  const traffic=[];
  const colors=[0xffbd32,0xeeeeee,0x31a6ff,0xe34c43,0x888888];
  for(let i=0;i<9;i++){
    const group=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.75,.72,3.5),new THREE.MeshStandardMaterial({color:colors[i%colors.length],metalness:.45,roughness:.38}));
    body.position.y=.62;body.castShadow=true;group.add(body);
    const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.35,.62,1.65),new THREE.MeshStandardMaterial({color:0x172536,metalness:.4,roughness:.2}));
    cabin.position.set(0,1.18,.05);group.add(cabin);
    group.position.set([-5.5,-2.8,2.8,5.5][i%4],0,-35-i*46);
    scene.add(group);traffic.push(group);
  }
  return traffic;
}
