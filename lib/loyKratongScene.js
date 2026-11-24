import * as THREE from "three";

export function initLoyKratongScene() {

  const avatars = [
    {
      id: "pie",
      name: "พี่พาย",
      desc: "เสื้อฟ้า • ท่ากอดอกมาดเข้ม",
      color: "#38bdf8",
      shirtHex: 0x7dd3fc,
      pantsHex: 0x475569,
      texFile: "/pie.jpg",
      pose: "crossed"
    },
    {
      id: "pond",
      name: "พี่ปอนด์",
      desc: "เสื้อแดง • ท่าล้วงกระเป๋าสุดเท่",
      color: "#f87171",
      shirtHex: 0xdc2626,
      pantsHex: 0x1e293b,
      texFile: "/pond.jpg",
      pose: "pocket"
    }
  ];

  const krathongTypes = [
    {
      style: "banana",
      name: "กระทงใบตองพับกลีบ",
      desc: "ใบตองพับซ้อนกันเป็นชั้น ประดับดาวเรืองกลมๆ",
      baseColor: 0x3e2723,
      petalColor: 0x43a047,
      accentColor: 0xffb300
    },
    {
      style: "lotus",
      name: "กระทงบัวหลวงบาน",
      desc: "กลีบบัวซ้อน 3 ชั้น เกสรเหลืองน่ารัก",
      baseColor: 0xad1457,
      petalColor: 0xf48fb1,
      accentColor: 0xfff59d
    },
    {
      style: "swan",
      name: "กระทงหงส์ทองมงคล",
      desc: "หงส์ทองคำคอโค้ง มีเหรียญทองและหนามมงคล",
      baseColor: 0xb28704,
      petalColor: 0xffd54f,
      accentColor: 0xfffde7
    },
    {
      style: "galaxy",
      name: "กระทงคริสตัลกาแล็กซี่",
      desc: "ผลึกม่วงเรืองแสง มีห่วงดาวโคจรรอบ",
      baseColor: 0x311b92,
      petalColor: 0x7c4dff,
      accentColor: 0x00e5ff
    },
    {
      style: "cat",
      name: "กระทงน้องแมวเก๋ไก๋",
      desc: "ชามกลมหูแมว หางงุ้ม มีลูกบอลไหมพรม",
      baseColor: 0xffe0b2,
      petalColor: 0xffcc80,
      accentColor: 0xff8a65
    },
    {
      style: "heart",
      name: "กระทงหัวใจกุหลาบ",
      desc: "ทรงหัวใจพองๆ กุหลาบซ้อน โบว์น่ารัก",
      baseColor: 0xc2185b,
      petalColor: 0xec407a,
      accentColor: 0xffcdd2
    }
  ];

  let currentStep = 1;
  let selectedAvatarIdx = 0;
  let selectedKrathongIdx = 0;
  let userName = "";
  let isLit = false;
  let isFloating = false;
  let nukePower = 0;
  let rafId = 0;
  let cancelled = false;

  const canvas = document.getElementById("canvas3d");
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x131b3a, 0.014);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 150);
  camera.position.set(0, 3.2, 7.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const textureLoader = new THREE.TextureLoader();
  const disposables = [];

  function track(obj) {
    disposables.push(obj);
    return obj;
  }

  function createSkyTexture() {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 512;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, "#07051a");
    grad.addColorStop(0.35, "#161b47");
    grad.addColorStop(0.48, "#2b3978");
    grad.addColorStop(0.51, "#4c5c96");
    grad.addColorStop(0.55, "#07142e");
    grad.addColorStop(1.0, "#030817");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 512);
    return track(new THREE.CanvasTexture(c));
  }

  scene.add(
    new THREE.Mesh(
      track(new THREE.SphereGeometry(95, 32, 32)),
      track(new THREE.MeshBasicMaterial({ map: createSkyTexture(), side: THREE.BackSide, fog: false }))
    )
  );

  const farShoreGroup = new THREE.Group();
  const shoreMat = track(new THREE.MeshBasicMaterial({ color: 0x060b19, fog: false }));
  const shoreBase = new THREE.Mesh(track(new THREE.BoxGeometry(160, 1.4, 2)), shoreMat);
  shoreBase.position.set(0, 0.6, -48);
  farShoreGroup.add(shoreBase);
  for (let i = -75; i <= 75; i += 3.5) {
    const treeH = 1.8 + Math.sin(i * 1.7) * 0.9 + Math.cos(i * 0.8) * 0.6;
    const tree = new THREE.Mesh(track(new THREE.ConeGeometry(1.8, treeH, 7)), shoreMat);
    tree.position.set(i, 1.2 + treeH * 0.4, -47.5);
    farShoreGroup.add(tree);
  }
  scene.add(farShoreGroup);

  const starGeo = track(new THREE.BufferGeometry());
  const starPositions = [];
  for (let i = 0; i < 250; i++) {
    starPositions.push((Math.random() - 0.5) * 140, Math.random() * 45 + 6, -30 - Math.random() * 55);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(
    new THREE.Points(starGeo, track(new THREE.PointsMaterial({ color: 0xfff8dc, size: 0.35, fog: false })))
  );

  scene.add(new THREE.AmbientLight(0x64748b, 1.4));
  const moonLight = new THREE.DirectionalLight(0xffd54f, 1.9);
  moonLight.position.set(8, 16, -20);
  scene.add(moonLight);

  function createRealisticMoonTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(110, 110, 20, 128, 128, 128);
    grad.addColorStop(0, "#fff59d");
    grad.addColorStop(0.55, "#ffd54f");
    grad.addColorStop(0.85, "#fbc02d");
    grad.addColorStop(1, "#f57f17");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    [
      [90, 85, 28],
      [150, 75, 20],
      [135, 145, 34],
      [80, 155, 18],
      [175, 125, 22]
    ].forEach(([cx, cy, cr]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(214, 137, 16, 0.22)";
      ctx.fill();
    });
    return track(new THREE.CanvasTexture(c));
  }

  const moonGroup = new THREE.Group();
  moonGroup.add(
    new THREE.Mesh(
      track(new THREE.SphereGeometry(3.4, 36, 36)),
      track(new THREE.MeshBasicMaterial({ map: createRealisticMoonTexture(), fog: false }))
    ),
    new THREE.Mesh(
      track(new THREE.SphereGeometry(4.2, 32, 32)),
      track(new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.22, fog: false }))
    )
  );
  moonGroup.position.set(7.5, 11.5, -42);
  scene.add(moonGroup);

  const moonReflection = new THREE.Mesh(
    track(new THREE.PlaneGeometry(5.5, 42)),
    track(new THREE.MeshBasicMaterial({ color: 0xffca28, transparent: true, opacity: 0.18 }))
  );
  moonReflection.rotation.x = -Math.PI / 2;
  moonReflection.position.set(6.8, 0.03, -22);
  scene.add(moonReflection);

  const waterGeo = track(new THREE.PlaneGeometry(160, 110, 72, 72));
  const water = new THREE.Mesh(
    waterGeo,
    track(new THREE.MeshStandardMaterial({ color: 0x091938, roughness: 0.18, metalness: 0.82 }))
  );
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  const pierGroup = new THREE.Group();
  const deck = new THREE.Mesh(
    track(new THREE.BoxGeometry(4.2, 0.25, 5.5)),
    track(new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 }))
  );
  deck.position.set(-2.4, 0.45, 2.2);
  pierGroup.add(deck);
  [
    [-4.2, 0.2],
    [-0.6, 0.2],
    [-4.2, 3.8],
    [-0.6, 3.8]
  ].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 12)),
      track(new THREE.MeshStandardMaterial({ color: 0x3e2723 }))
    );
    pillar.position.set(px, 0.3, pz);
    pierGroup.add(pillar);
  });
  scene.add(pierGroup);

  function createMaleAvatar(cfg) {
    const group = new THREE.Group();
    const skinMat = track(new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.5 }));
    const shirtMat = track(new THREE.MeshStandardMaterial({ color: cfg.shirtHex, roughness: 0.45 }));
    const pantsMat = track(new THREE.MeshStandardMaterial({ color: cfg.pantsHex, roughness: 0.7 }));
    const hairMat = track(new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 }));

    const leftLeg = new THREE.Mesh(track(new THREE.CylinderGeometry(0.11, 0.09, 0.85, 12)), pantsMat);
    leftLeg.position.set(-0.14, 0.42, 0);
    const rightLeg = new THREE.Mesh(track(new THREE.CylinderGeometry(0.11, 0.09, 0.85, 12)), pantsMat);
    rightLeg.position.set(0.14, 0.42, 0);

    const torso = new THREE.Mesh(track(new THREE.CylinderGeometry(0.26, 0.23, 0.78, 16)), shirtMat);
    torso.position.set(0, 1.18, 0);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.76, 0);

    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 24, 24)), skinMat);
    head.position.set(0, 0, -0.06);
    head.visible = false;

    const faceTex = textureLoader.load(cfg.texFile);
    track(faceTex);
    const faceDisc = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.28, 32)),
      track(
        new THREE.MeshBasicMaterial({
          map: faceTex,
          depthTest: true,
          depthWrite: true
        })
      )
    );
    faceDisc.position.set(0, 0.02, 0.28);
    faceDisc.renderOrder = 2;

    const hair = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.28, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.42)),
      hairMat
    );
    hair.position.set(0, 0.14, -0.08);

    const armGeo = track(new THREE.CylinderGeometry(0.075, 0.065, 0.62, 12));
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    const rightArm = new THREE.Mesh(armGeo, skinMat);

    if (cfg.pose === "crossed") {
      leftArm.position.set(-0.14, 1.18, 0.24);
      leftArm.rotation.set(1.35, 0, -1.25);
      rightArm.position.set(0.14, 1.24, 0.26);
      rightArm.rotation.set(1.35, 0, 1.25);
    } else {
      leftArm.position.set(-0.28, 1.05, 0.05);
      leftArm.rotation.set(0.15, 0, -0.25);
      rightArm.position.set(0.28, 1.05, 0.05);
      rightArm.rotation.set(0.15, 0, 0.25);
    }

    const nameAnchor = new THREE.Object3D();
    nameAnchor.position.set(0, 2.25, 0);

    headGroup.add(head, faceDisc, hair);
    group.add(leftLeg, rightLeg, torso, headGroup, leftArm, rightArm, nameAnchor);
    group.userData = { leftLeg, rightLeg, torso, head: headGroup, faceDisc, hair, leftArm, rightArm, nameAnchor, cfg };
    return group;
  }

  function createFemaleAvatar() {
    const group = new THREE.Group();
    const skinMat = track(new THREE.MeshStandardMaterial({ color: 0xfde2c4, roughness: 0.45 }));
    const dressMat = track(new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }));
    const skirtMat = track(new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.6 }));
    const hairMat = track(new THREE.MeshStandardMaterial({ color: 0x271914, roughness: 0.7 }));

    const skirt = new THREE.Mesh(track(new THREE.CylinderGeometry(0.24, 0.38, 0.35, 16)), skirtMat);
    skirt.position.set(0, 0.18, 0);
    const torso = new THREE.Mesh(track(new THREE.CylinderGeometry(0.19, 0.23, 0.62, 16)), dressMat);
    torso.position.set(0, 0.62, 0.05);
    torso.rotation.x = 0.22;
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.21, 20, 20)), skinMat);
    head.position.set(0, 1.06, 0.14);
    const hairTop = new THREE.Mesh(track(new THREE.SphereGeometry(0.225, 20, 16)), hairMat);
    hairTop.position.set(0, 1.09, 0.1);
    const longHairBack = new THREE.Mesh(track(new THREE.CylinderGeometry(0.21, 0.25, 0.65, 16)), hairMat);
    longHairBack.position.set(0, 0.78, -0.04);
    const flowerPin = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.05, 8, 8)),
      track(new THREE.MeshBasicMaterial({ color: 0xffd54f }))
    );
    flowerPin.position.set(0.2, 1.12, 0.18);

    const armGeo = track(new THREE.CylinderGeometry(0.055, 0.05, 0.52, 12));
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(-0.22, 0.65, 0.32);
    leftArm.rotation.set(1.0, 0, -0.2);
    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(0.22, 0.65, 0.32);
    rightArm.rotation.set(1.0, 0, 0.2);

    const nameAnchor = new THREE.Object3D();
    nameAnchor.position.set(0, 1.48, 0.14);

    group.add(skirt, torso, head, hairTop, longHairBack, flowerPin, leftArm, rightArm, nameAnchor);
    group.userData = { torso, nameAnchor };
    return group;
  }

  const avatarCarousel = new THREE.Group();
  scene.add(avatarCarousel);

  const maleAvatars = [];
  const avatarSpacing = 4.2;
  avatars.forEach((cfg, idx) => {
    const av = createMaleAvatar(cfg);
    av.position.set(idx * avatarSpacing, 0.55, 1.8);
    avatarCarousel.add(av);
    maleAvatars.push(av);
  });

  const femaleAvatar = createFemaleAvatar();
  femaleAvatar.position.set(-1.35, 0.58, 1.15);
  femaleAvatar.rotation.y = 1.25;
  femaleAvatar.visible = false;
  scene.add(femaleAvatar);

  const nukeGroup = new THREE.Group();
  nukeGroup.visible = false;
  scene.add(nukeGroup);

  function nukeMat(color, opacity = 0.9) {
    return track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  }

  const shockwaveRing = new THREE.Mesh(track(new THREE.RingGeometry(0.2, 1.3, 48)), nukeMat(0xffea00, 0.95));
  shockwaveRing.rotation.x = -Math.PI / 2;
  shockwaveRing.position.y = 0.16;

  const shockwaveRing2 = new THREE.Mesh(track(new THREE.RingGeometry(0.1, 0.9, 48)), nukeMat(0xff5722, 0.9));
  shockwaveRing2.rotation.x = -Math.PI / 2;
  shockwaveRing2.position.y = 0.22;

  const shockwaveRing3 = new THREE.Mesh(track(new THREE.RingGeometry(0.15, 0.7, 40)), nukeMat(0xffffff, 0.7));
  shockwaveRing3.rotation.x = -Math.PI / 2;
  shockwaveRing3.position.y = 0.28;

  const groundFire = new THREE.Mesh(track(new THREE.CircleGeometry(1.2, 32)), nukeMat(0xff6d00, 0.75));
  groundFire.rotation.x = -Math.PI / 2;
  groundFire.position.y = 0.12;

  const mushroomStem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.28, 1.15, 1, 22, 1, true)), nukeMat(0xff6d00, 0.78));
  const mushroomStemCore = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.55, 1, 16, 1, true)), nukeMat(0xfff59d, 0.88));
  const mushroomStemWhite = new THREE.Mesh(track(new THREE.CylinderGeometry(0.06, 0.22, 1, 12, 1, true)), nukeMat(0xffffff, 0.9));

  const mushroomCap = new THREE.Mesh(track(new THREE.SphereGeometry(1, 28, 18)), nukeMat(0xff3d00, 0.82));
  const mushroomCapHot = new THREE.Mesh(track(new THREE.SphereGeometry(0.72, 22, 16)), nukeMat(0xffd54f, 0.8));
  const mushroomCapCore = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 16, 12)), nukeMat(0xffffff, 0.85));
  const mushroomRim = new THREE.Mesh(track(new THREE.TorusGeometry(1.05, 0.28, 12, 36)), nukeMat(0xff9100, 0.8));
  const mushroomSkirt = new THREE.Mesh(track(new THREE.TorusGeometry(1.35, 0.18, 10, 36)), nukeMat(0xff6d00, 0.55));
  mushroomRim.rotation.x = Math.PI / 2;
  mushroomSkirt.rotation.x = Math.PI / 2;

  const nukeCoreSphere = new THREE.Mesh(track(new THREE.SphereGeometry(0.9, 24, 24)), nukeMat(0xffffff, 0.95));
  nukeCoreSphere.position.y = 1.1;

  const capLobes = [];
  for (let i = 0; i < 16; i++) {
    const lobe = new THREE.Mesh(
      track(new THREE.ConeGeometry(0.32, 1.1, 10)),
      nukeMat(i % 2 ? 0xff9100 : 0xff3d00, 0.88)
    );
    lobe.userData.baseAngle = (i / 16) * Math.PI * 2;
    nukeGroup.add(lobe);
    capLobes.push(lobe);
  }

  const stemLobes = [];
  for (let i = 0; i < 10; i++) {
    const lobe = new THREE.Mesh(
      track(new THREE.ConeGeometry(0.22, 1.4, 8)),
      nukeMat(i % 2 ? 0xffd54f : 0xff6d00, 0.8)
    );
    lobe.userData.baseAngle = (i / 10) * Math.PI * 2;
    nukeGroup.add(lobe);
    stemLobes.push(lobe);
  }

  const sparkParticles = [];
  const sparkColors = [0xffd54f, 0xff6d00, 0xffffff, 0xff3d00];
  for (let i = 0; i < 90; i++) {
    const sp = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.07 + Math.random() * 0.06, 6, 6)),
      nukeMat(sparkColors[i % sparkColors.length], 0.95)
    );
    sp.userData = { vx: 0, vy: 0, vz: 0, spread: Math.random() };
    nukeGroup.add(sp);
    sparkParticles.push(sp);
  }

  nukeGroup.add(
    shockwaveRing,
    shockwaveRing2,
    shockwaveRing3,
    groundFire,
    mushroomStem,
    mushroomStemCore,
    mushroomStemWhite,
    mushroomCap,
    mushroomCapHot,
    mushroomCapCore,
    mushroomRim,
    mushroomSkirt,
    nukeCoreSphere
  );

  const clickableBodies = [];
  const clickableIncenseTips = [];

  function matStd(color, extras = {}) {
    return track(
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        emissive: color,
        emissiveIntensity: 0.28,
        ...extras
      })
    );
  }

  function matGlow(color, opacity = 0.9) {
    return track(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide }));
  }

  function createMegaFlame(isMega = true) {
    const flameGroup = new THREE.Group();
    const m = isMega ? 1.55 : 0.85;
    const tongues = [];
    const specs = [
      { color: 0xff2d00, h: 0.92, r: 0.2, ox: 0, oz: 0, phase: 0 },
      { color: 0xff6d00, h: 0.78, r: 0.15, ox: 0.05, oz: 0.03, phase: 1.2 },
      { color: 0xff9100, h: 0.7, r: 0.13, ox: -0.04, oz: -0.02, phase: 2.1 },
      { color: 0xffd54f, h: 0.52, r: 0.09, ox: 0.015, oz: -0.03, phase: 0.6 },
      { color: 0xfffde7, h: 0.34, r: 0.055, ox: 0, oz: 0.01, phase: 1.7 }
    ];

    specs.forEach((spec) => {
      const geo = track(new THREE.ConeGeometry(spec.r * m, spec.h * m, 14));
      geo.translate(0, (spec.h * m) / 2, 0);
      const mesh = new THREE.Mesh(geo, matGlow(spec.color, 0.88));
      mesh.position.set(spec.ox * m, 0, spec.oz * m);
      mesh.userData.phase = spec.phase;
      flameGroup.add(mesh);
      tongues.push(mesh);
    });

    const baseBulb = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.16 * m, 14, 14)),
      matGlow(0xff6d00, 0.9)
    );
    baseBulb.scale.set(1.15, 0.7, 1.15);
    flameGroup.add(baseBulb);

    const glow = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.42 * m, 16, 16)),
      matGlow(0xff9100, 0.28)
    );
    glow.position.y = 0.18 * m;
    flameGroup.add(glow);

    const embers = [];
    for (let i = 0; i < 10; i++) {
      const ember = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.018 * m, 6, 6)),
        matGlow(i % 2 ? 0xffd54f : 0xff6d00, 0.95)
      );
      ember.userData.life = Math.random();
      ember.userData.speed = 0.012 + Math.random() * 0.02;
      ember.userData.ox = (Math.random() - 0.5) * 0.12 * m;
      ember.userData.oz = (Math.random() - 0.5) * 0.12 * m;
      flameGroup.add(ember);
      embers.push(ember);
    }

    flameGroup.userData = { tongues, embers, glow, ignite: 0 };
    return flameGroup;
  }

  function animateFlame(flame, t, extraBoost = 0) {
    if (!flame || !flame.userData.tongues) return;
    if (flame.userData.ignite > 0) {
      flame.userData.ignite = Math.max(0, flame.userData.ignite - 0.018);
    }
    const ignite = flame.userData.ignite;
    const boost = 1 + extraBoost + ignite * 1.6;

    flame.userData.tongues.forEach((tongue, i) => {
      const p = tongue.userData.phase;
      const flicker = 0.82 + Math.sin(t * (13 + i * 2.4) + p) * 0.16 + Math.sin(t * 27 + p) * 0.07;
      tongue.scale.set(flicker * 0.92, flicker * boost, flicker * 0.92);
      tongue.rotation.z = Math.sin(t * 8.5 + p) * 0.2;
      tongue.rotation.x = Math.cos(t * 6.5 + p) * 0.12;
    });

    if (flame.userData.glow) {
      const g = 0.9 + Math.sin(t * 11) * 0.12 + ignite * 0.4;
      flame.userData.glow.scale.setScalar(g * (1 + extraBoost * 0.35));
    }

    flame.userData.embers.forEach((ember) => {
      ember.userData.life += ember.userData.speed;
      if (ember.userData.life > 1) {
        ember.userData.life = 0;
        ember.userData.ox = (Math.random() - 0.5) * 0.14;
        ember.userData.oz = (Math.random() - 0.5) * 0.14;
      }
      const life = ember.userData.life;
      ember.position.set(ember.userData.ox * (1 + life), life * 0.85 * boost, ember.userData.oz * (1 + life));
      ember.scale.setScalar(1.1 - life);
      ember.material.opacity = 0.95 * (1 - life);
    });
  }

  function buildBananaKrathong(group, config) {
    const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.55, 0.7, 0.28, 12)), matStd(config.baseColor, { roughness: 0.85 }));
    stem.position.y = 0.14;
    group.add(stem);

    const leafMat = matStd(config.petalColor, { roughness: 0.7, side: THREE.DoubleSide });
    const darkLeaf = matStd(0x2e7d32, { roughness: 0.75, side: THREE.DoubleSide });
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const leaf = new THREE.Mesh(track(new THREE.BoxGeometry(0.42, 0.025, 1.05)), i % 2 ? leafMat : darkLeaf);
      leaf.position.set(Math.cos(angle) * 0.42, 0.34, Math.sin(angle) * 0.42);
      leaf.rotation.y = -angle;
      leaf.rotation.x = -0.72;
      leaf.rotation.z = (i % 2 ? 0.18 : -0.12);
      group.add(leaf);
    }

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const marigold = new THREE.Mesh(track(new THREE.SphereGeometry(0.11, 10, 8)), matStd(config.accentColor, { roughness: 0.55 }));
      marigold.position.set(Math.cos(angle) * 0.38, 0.42, Math.sin(angle) * 0.38);
      marigold.scale.set(1, 0.7, 1);
      group.add(marigold);
      const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.045, 8, 8)), matStd(0xff6f00));
      core.position.copy(marigold.position);
      core.position.y += 0.05;
      group.add(core);
    }
  }

  function buildLotusKrathong(group, config) {
    const base = new THREE.Mesh(track(new THREE.CylinderGeometry(0.42, 0.55, 0.22, 16)), matStd(config.baseColor));
    base.position.y = 0.12;
    group.add(base);

    const petalMat = matStd(config.petalColor, { roughness: 0.35 });
    const innerMat = matStd(0xf8bbd0, { roughness: 0.3 });
    const layers = [
      { count: 10, radius: 0.72, y: 0.28, sx: 0.28, sy: 0.55, sz: 0.1, tilt: 1.05, mat: petalMat },
      { count: 10, radius: 0.5, y: 0.4, sx: 0.22, sy: 0.48, sz: 0.09, tilt: 0.78, mat: innerMat },
      { count: 8, radius: 0.28, y: 0.5, sx: 0.16, sy: 0.38, sz: 0.08, tilt: 0.45, mat: petalMat }
    ];
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layer.y > 0.35 ? 0.2 : 0);
        const petal = new THREE.Mesh(track(new THREE.SphereGeometry(1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.7)), layer.mat);
        petal.scale.set(layer.sx, layer.sy, layer.sz);
        petal.position.set(Math.cos(angle) * layer.radius, layer.y, Math.sin(angle) * layer.radius);
        petal.lookAt(0, layer.y + 0.8, 0);
        petal.rotateX(layer.tilt);
        group.add(petal);
      }
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const stamen = new THREE.Mesh(track(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6)), matStd(config.accentColor));
      stamen.position.set(Math.cos(angle) * 0.08, 0.68, Math.sin(angle) * 0.08);
      group.add(stamen);
      const tip = new THREE.Mesh(track(new THREE.SphereGeometry(0.025, 8, 8)), matStd(0xffca28));
      tip.position.set(stamen.position.x, 0.8, stamen.position.z);
      group.add(tip);
    }
  }

  function buildSwanKrathong(group, config) {
    const bowl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.7, 0.82, 0.26, 16)), matStd(config.baseColor, { metalness: 0.65, roughness: 0.25 }));
    bowl.position.y = 0.14;
    group.add(bowl);

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const spike = new THREE.Mesh(track(new THREE.ConeGeometry(0.08, 0.42, 6)), matStd(config.petalColor, { metalness: 0.7, roughness: 0.2 }));
      spike.position.set(Math.cos(angle) * 0.78, 0.38, Math.sin(angle) * 0.78);
      spike.rotation.z = -Math.cos(angle) * 0.7;
      spike.rotation.x = Math.sin(angle) * 0.7;
      group.add(spike);
    }

    const body = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 14, 14)), matStd(config.accentColor, { metalness: 0.55, roughness: 0.3 }));
    body.position.set(0.12, 0.48, 0);
    body.scale.set(1.15, 0.85, 0.8);
    group.add(body);

    const neck = new THREE.Mesh(
      track(new THREE.TorusGeometry(0.22, 0.045, 8, 18, Math.PI * 1.15)),
      matStd(config.petalColor, { metalness: 0.6, roughness: 0.25 })
    );
    neck.position.set(-0.05, 0.68, 0);
    neck.rotation.set(0, Math.PI / 2, Math.PI * 0.15);
    group.add(neck);

    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.09, 10, 10)), matStd(config.accentColor, { metalness: 0.5 }));
    head.position.set(-0.28, 0.92, 0);
    group.add(head);
    const beak = new THREE.Mesh(track(new THREE.ConeGeometry(0.025, 0.12, 6)), matStd(0xff8f00));
    beak.position.set(-0.38, 0.9, 0);
    beak.rotation.z = Math.PI / 2;
    group.add(beak);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const coin = new THREE.Mesh(track(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16)), matStd(0xffecb3, { metalness: 0.85, roughness: 0.15 }));
      coin.position.set(Math.cos(angle) * 0.42, 0.3, Math.sin(angle) * 0.42);
      coin.rotation.x = Math.PI / 2;
      group.add(coin);
    }
  }

  function buildGalaxyKrathong(group, config) {
    const core = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.38, 0)), matGlow(config.petalColor, 0.92));
    core.position.y = 0.42;
    group.add(core);

    const bowl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.55, 0.7, 0.2, 6)), matStd(config.baseColor, { metalness: 0.4 }));
    bowl.position.y = 0.12;
    group.add(bowl);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const shard = new THREE.Mesh(track(new THREE.TetrahedronGeometry(0.16)), matGlow(i % 2 ? config.accentColor : config.petalColor, 0.85));
      shard.position.set(Math.cos(angle) * 0.72, 0.32 + (i % 2) * 0.12, Math.sin(angle) * 0.72);
      shard.rotation.set(angle, i, angle * 0.5);
      group.add(shard);
    }

    const ring1 = new THREE.Mesh(track(new THREE.TorusGeometry(0.7, 0.03, 8, 32)), matGlow(config.accentColor, 0.8));
    ring1.position.y = 0.48;
    ring1.rotation.x = Math.PI / 2.6;
    group.add(ring1);
    const ring2 = new THREE.Mesh(track(new THREE.TorusGeometry(0.55, 0.02, 8, 28)), matGlow(0xea80fc, 0.75));
    ring2.position.y = 0.55;
    ring2.rotation.z = 0.6;
    group.add(ring2);
    group.userData.orbitRings = [ring1, ring2];

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 6, 6)), matGlow(0xffffff, 0.95));
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * 0.9, 0.4 + Math.sin(i) * 0.15, Math.sin(a) * 0.9);
      group.add(star);
    }
  }

  function buildCatKrathong(group, config) {
    const bowl = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.82, 0.58, 0.34, 20)),
      matStd(config.petalColor, { roughness: 0.5 })
    );
    bowl.position.y = 0.18;
    group.add(bowl);
    const inner = new THREE.Mesh(track(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 20)), matStd(config.baseColor));
    inner.position.y = 0.32;
    group.add(inner);

    const earMat = matStd(config.accentColor);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(track(new THREE.ConeGeometry(0.16, 0.38, 8)), earMat);
      ear.position.set(side * 0.34, 0.58, -0.22);
      ear.rotation.z = side * -0.35;
      ear.rotation.x = -0.35;
      group.add(ear);
      const innerEar = new THREE.Mesh(track(new THREE.ConeGeometry(0.08, 0.22, 8)), matStd(0xffcdd2));
      innerEar.position.set(side * 0.34, 0.56, -0.18);
      innerEar.rotation.copy(ear.rotation);
      group.add(innerEar);
    });

    const tail = new THREE.Mesh(track(new THREE.TorusGeometry(0.26, 0.05, 8, 16, Math.PI * 1.25)), matStd(config.accentColor));
    tail.position.set(0.62, 0.28, 0.05);
    tail.rotation.set(0.2, 0.9, 0.15);
    group.add(tail);

    const yarn = new THREE.Mesh(track(new THREE.SphereGeometry(0.13, 10, 10)), matStd(0x80deea));
    yarn.position.set(-0.42, 0.4, 0.28);
    group.add(yarn);
    const nose = new THREE.Mesh(track(new THREE.SphereGeometry(0.045, 8, 8)), matStd(0xf48fb1));
    nose.position.set(0, 0.42, 0.62);
    group.add(nose);
  }

  function buildHeartKrathong(group, config) {
    const bowl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.55, 0.7, 0.22, 16)), matStd(config.baseColor));
    bowl.position.y = 0.12;
    group.add(bowl);

    const heartMat = matStd(config.petalColor, { roughness: 0.35 });
    const left = new THREE.Mesh(track(new THREE.SphereGeometry(0.32, 14, 14)), heartMat);
    left.position.set(-0.2, 0.52, 0);
    group.add(left);
    const right = new THREE.Mesh(track(new THREE.SphereGeometry(0.32, 14, 14)), heartMat);
    right.position.set(0.2, 0.52, 0);
    group.add(right);
    const tip = new THREE.Mesh(track(new THREE.ConeGeometry(0.42, 0.55, 10)), heartMat);
    tip.position.set(0, 0.22, 0);
    tip.rotation.x = Math.PI;
    group.add(tip);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rose = new THREE.Mesh(track(new THREE.SphereGeometry(0.1, 10, 8)), matStd(i % 2 ? 0xf06292 : 0xffcdd2));
      rose.position.set(Math.cos(angle) * 0.7, 0.32, Math.sin(angle) * 0.7);
      rose.scale.set(1, 0.7, 1);
      group.add(rose);
    }

    const bow = new THREE.Mesh(track(new THREE.TorusGeometry(0.09, 0.035, 8, 16)), matStd(config.accentColor));
    bow.position.set(0, 0.82, 0.18);
    bow.rotation.y = Math.PI / 2;
    group.add(bow);
  }

  function createKrathongModel(config, index, scaleSize = 1, isPlayer = true) {
    const group = new THREE.Group();
    const builders = {
      banana: buildBananaKrathong,
      lotus: buildLotusKrathong,
      swan: buildSwanKrathong,
      galaxy: buildGalaxyKrathong,
      cat: buildCatKrathong,
      heart: buildHeartKrathong
    };
    (builders[config.style] || buildBananaKrathong)(group, config);

    const candle = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.07, 0.075, 0.55, 14)),
      matStd(0xfff176, { roughness: 0.35 })
    );
    candle.position.y = 0.72;
    group.add(candle);
    const wick = new THREE.Mesh(track(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6)), matStd(0x3e2723));
    wick.position.y = 1.02;
    group.add(wick);

    const flame = createMegaFlame(isPlayer);
    flame.position.y = 1.08;
    flame.visible = false;
    group.add(flame);

    const incenseMat = matGlow(0xd7ccc8, 1);
    const incenseGlows = [];
    const incenseFlames = [];
    [-0.16, 0, 0.16].forEach((ox, idx) => {
      const oz = idx === 1 ? -0.12 : 0.07;
      const inc = new THREE.Mesh(track(new THREE.CylinderGeometry(0.016, 0.016, 0.95, 8)), incenseMat);
      inc.position.set(ox, 0.9, oz);
      group.add(inc);

      const tipGlow = new THREE.Mesh(track(new THREE.SphereGeometry(0.04, 10, 10)), matGlow(0xff3d00, 1));
      tipGlow.position.set(ox, 1.38, oz);
      tipGlow.visible = false;
      group.add(tipGlow);
      incenseGlows.push(tipGlow);

      const tipFlame = new THREE.Mesh(track(new THREE.ConeGeometry(0.035, 0.14, 8)), matGlow(0xffd54f, 0.9));
      tipFlame.position.set(ox, 1.46, oz);
      tipFlame.visible = false;
      group.add(tipFlame);
      incenseFlames.push(tipFlame);
    });

    const incenseAnchor = new THREE.Object3D();
    incenseAnchor.position.set(0, 1.38, 0);
    group.add(incenseAnchor);

    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.set(0, 1.75, 0);
    group.add(labelAnchor);

    const candleLight = new THREE.PointLight(0xff9100, 0, 16);
    candleLight.position.set(0, 1.25, 0);
    group.add(candleLight);

    const rippleMesh = new THREE.Mesh(
      track(new THREE.RingGeometry(0.95, 1.12, 32)),
      matGlow(0xffd54f, 0.45)
    );
    rippleMesh.rotation.x = -Math.PI / 2;
    rippleMesh.position.y = 0.04;
    group.add(rippleMesh);

    if (isPlayer) {
      const bodyHitbox = new THREE.Mesh(
        track(new THREE.CylinderGeometry(1.15, 1.15, 1.1, 16)),
        track(new THREE.MeshBasicMaterial({ visible: false }))
      );
      bodyHitbox.position.y = 0.5;
      bodyHitbox.userData = { krathongIndex: index };
      group.add(bodyHitbox);
      clickableBodies.push(bodyHitbox);

      const incenseHitbox = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.5, 12, 12)),
        track(new THREE.MeshBasicMaterial({ visible: false }))
      );
      incenseHitbox.position.set(0, 1.38, 0);
      incenseHitbox.userData = { krathongIndex: index };
      group.add(incenseHitbox);
      clickableIncenseTips.push(incenseHitbox);
    }

    group.scale.set(scaleSize, scaleSize, scaleSize);
    group.userData = {
      flame,
      incenseGlows,
      incenseFlames,
      incenseAnchor,
      labelAnchor,
      candleLight,
      rippleMesh,
      orbitRings: group.userData.orbitRings || [],
      bounceAnim: 0
    };
    return group;
  }

  const krathongCarousel = new THREE.Group();
  const kCarouselX = 2.05;
  const kCarouselZ = 0.55;
  const kSpacing = 2.65;
  krathongCarousel.position.set(kCarouselX, 0, kCarouselZ);
  krathongCarousel.visible = false;
  scene.add(krathongCarousel);

  const krathongMeshes = [];
  krathongTypes.forEach((cfg, idx) => {
    const kMesh = createKrathongModel(cfg, idx, 0.95, true);
    kMesh.position.set(idx * kSpacing, 0, 0);
    krathongCarousel.add(kMesh);
    krathongMeshes.push(kMesh);
  });

  const otherKrathongs = [];
  const npcTagsContainer = document.getElementById("npcTagsContainer");
  const nongList = [
    { name: "น้องเบล", cfg: krathongTypes[1], x: -7.5, z: -3.8, speed: 0.015 },
    { name: "น้องกัส", cfg: krathongTypes[0], x: 2.5, z: -5.2, speed: 0.013 },
    { name: "น้องทราย", cfg: krathongTypes[2], x: -3.0, z: -7.0, speed: 0.012 },
    { name: "น้องมด", cfg: krathongTypes[3], x: 8.5, z: -8.8, speed: 0.014 },
    { name: "น้องแคท", cfg: krathongTypes[4], x: -11.0, z: -10.5, speed: 0.011 },
    { name: "น้องน้ำฝน", cfg: krathongTypes[5], x: 5.0, z: -12.5, speed: 0.01 },
    { name: "น้องเค้ก", cfg: krathongTypes[2], x: -6.0, z: -14.8, speed: 0.012 },
    { name: "น้องมายด์", cfg: krathongTypes[3], x: 11.5, z: -17.0, speed: 0.009 },
    { name: "น้องนิต้า", cfg: krathongTypes[2], x: -1.5, z: -19.5, speed: 0.011 }
  ];

  nongList.forEach((item) => {
    const npcMesh = createKrathongModel(item.cfg, -1, 0.78, false);
    npcMesh.position.set(item.x, 0, item.z);
    npcMesh.userData.flame.visible = true;
    npcMesh.userData.incenseGlows.forEach((g) => {
      g.visible = true;
    });
    npcMesh.userData.incenseFlames.forEach((f) => {
      f.visible = true;
    });
    npcMesh.userData.candleLight.intensity = 1.8;
    npcMesh.visible = false;
    scene.add(npcMesh);

    const tagEl = document.createElement("div");
    tagEl.className = "npc-tag";
    tagEl.innerText = `🪷 ${item.name}`;
    npcTagsContainer.appendChild(tagEl);

    otherKrathongs.push({ mesh: npcMesh, speed: item.speed, tagEl });
  });

  const lanterns = [];
  const lanternGeo = track(new THREE.CylinderGeometry(0.24, 0.16, 0.42, 12));
  const lanternMat = track(new THREE.MeshBasicMaterial({ color: 0xffb74d, fog: false }));
  for (let i = 0; i < 18; i++) {
    const l = new THREE.Mesh(lanternGeo, lanternMat);
    l.position.set((Math.random() - 0.5) * 45, Math.random() * 16 + 3, -15 - Math.random() * 25);
    scene.add(l);
    lanterns.push(l);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDownPos = { x: 0, y: 0 };

  function onPointerDown(e) {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e) {
    const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);

    if (moveDist > 30) {
      const dx = e.clientX - pointerDownPos.x;
      if (currentStep === "stepAvatar") slideAvatar(dx < 0 ? 1 : -1);
      else if (currentStep === "stepKrathong") slideKrathong(dx < 0 ? 1 : -1);
      return;
    }

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    if (currentStep === "stepKrathong") {
      const hits = raycaster.intersectObjects(clickableBodies);
      if (hits.length > 0) {
        selectedKrathongIdx = hits[0].object.userData.krathongIndex;
        updateKrathongUI();
        selectThisKrathong();
      }
    } else if (currentStep === "stepIncense") {
      const hits = raycaster.intersectObjects(clickableIncenseTips);
      if (hits.length > 0 && hits[0].object.userData.krathongIndex === selectedKrathongIdx) {
        igniteSlowMoNuclear();
      }
    }
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  function slideAvatar(dir) {
    selectedAvatarIdx = (selectedAvatarIdx + dir + avatars.length) % avatars.length;
    const avInfo = avatars[selectedAvatarIdx];
    document.getElementById("avatarNameTitle").innerText = avInfo.name;
    document.getElementById("avatarNameTitle").style.color = avInfo.color;
    document.getElementById("avatarPoseDesc").innerText = avInfo.desc;

    const guyTag = document.getElementById("guyNameTag");
    guyTag.innerText = avInfo.name;
    guyTag.style.borderColor = avInfo.color;
    guyTag.style.color = avInfo.color;
  }

  function confirmAvatar() {
    const chosenGuy = maleAvatars[selectedAvatarIdx];
    const otherGuy = maleAvatars[1 - selectedAvatarIdx];
    otherGuy.visible = false;

    // ตัวละครชายที่เลือกมานั่งริมท่าน้ำเคียงข้างตัวละครหญิง
    chosenGuy.visible = true;
    avatarCarousel.position.x = 0;
    chosenGuy.position.set(-1.35, 0.58, 0.25);
    chosenGuy.rotation.y = 1.15;
    chosenGuy.userData.leftLeg.visible = false;
    chosenGuy.userData.rightLeg.visible = false;
    chosenGuy.userData.torso.position.y = 0.58;
    chosenGuy.userData.torso.rotation.x = 0.25;
    chosenGuy.userData.head.position.set(0, 1.08, 0.18);
    chosenGuy.userData.nameAnchor.position.set(0, 1.55, 0.18);

    chosenGuy.userData.leftArm.position.set(-0.26, 0.62, 0.36);
    chosenGuy.userData.leftArm.rotation.set(1.0, 0, -0.2);
    chosenGuy.userData.rightArm.position.set(0.26, 0.62, 0.36);
    chosenGuy.userData.rightArm.rotation.set(1.0, 0, 0.2);

    femaleAvatar.visible = true;
    document.getElementById("girlNameTag").innerText = userName;
    document.getElementById("girlNameTag").classList.remove("hidden");

    krathongCarousel.visible = true;
    goToStep("stepKrathong");
  }

  function slideKrathong(dir) {
    selectedKrathongIdx = (selectedKrathongIdx + dir + krathongTypes.length) % krathongTypes.length;
    updateKrathongUI();
  }

  function updateKrathongUI() {
    const info = krathongTypes[selectedKrathongIdx];
    document.getElementById("kTitle").innerText = info.name;
    document.getElementById("kDesc").innerText = info.desc;
    document.querySelectorAll(".dot").forEach((d, idx) => d.classList.toggle("active", idx === selectedKrathongIdx));
  }

  function selectThisKrathong() {
    krathongMeshes.forEach((m, i) => {
      if (i !== selectedKrathongIdx) m.visible = false;
    });
    krathongMeshes[selectedKrathongIdx].userData.bounceAnim = 1.0;
    goToStep("stepIncense");
  }

  function igniteSlowMoNuclear() {
    isLit = true;
    nukePower = 1.0;

    const flash = document.getElementById("nukeFlash");
    flash.style.opacity = "1";
    setTimeout(() => {
      if (!cancelled) flash.style.opacity = "0";
    }, 700);

    const chosenMesh = krathongMeshes[selectedKrathongIdx];
    chosenMesh.userData.incenseGlows.forEach((g) => {
      g.visible = true;
    });
    chosenMesh.userData.incenseFlames.forEach((f) => {
      f.visible = true;
    });
    chosenMesh.userData.flame.visible = true;
    chosenMesh.userData.flame.userData.ignite = 1;
    chosenMesh.userData.candleLight.intensity = 10.0;
    chosenMesh.userData.bounceAnim = 1.0;

    nukeGroup.position.set(kCarouselX, 0, kCarouselZ);
    nukeGroup.visible = true;
    shockwaveRing.scale.set(0.3, 0.3, 1);
    shockwaveRing2.scale.set(0.15, 0.15, 1);
    shockwaveRing3.scale.set(0.1, 0.1, 1);
    groundFire.scale.set(0.4, 0.4, 1);
    mushroomStem.scale.set(1, 0.4, 1);
    mushroomStem.position.y = 0.2;
    mushroomStemCore.scale.set(1, 0.4, 1);
    mushroomStemCore.position.y = 0.2;
    mushroomStemWhite.scale.set(1, 0.4, 1);
    mushroomStemWhite.position.y = 0.2;
    mushroomCap.position.y = 1.2;
    mushroomCap.scale.set(0.25, 0.12, 0.25);
    mushroomCapHot.position.y = 1.2;
    mushroomCapHot.scale.set(0.2, 0.1, 0.2);
    mushroomCapCore.position.y = 1.2;
    mushroomCapCore.scale.set(0.15, 0.08, 0.15);
    mushroomRim.position.y = 1.1;
    mushroomRim.scale.set(0.2, 0.2, 0.2);
    mushroomSkirt.position.y = 0.95;
    mushroomSkirt.scale.set(0.15, 0.15, 0.15);
    nukeCoreSphere.scale.set(0.6, 0.6, 0.6);

    sparkParticles.forEach((sp) => {
      sp.position.set(0, 0.6, 0);
      const angle = Math.random() * Math.PI * 2;
      const up = 0.12 + Math.random() * 0.2;
      sp.userData.vx = Math.cos(angle) * 0.02;
      sp.userData.vy = up;
      sp.userData.vz = Math.sin(angle) * 0.02;
      sp.userData.spread = 0.4 + Math.random() * 0.8;
    });

    document.getElementById("incenseTargetRing").classList.add("hidden");
    goToStep("stepWish");
  }

  function goToStep(stepId) {
    document.querySelectorAll(".step-screen").forEach((el) => el.classList.add("hidden"));
    const targetId = typeof stepId === "number" ? "step" + stepId : stepId;
    document.getElementById(targetId).classList.remove("hidden");
    currentStep = stepId;

    if (["stepAvatar", "stepKrathong", "stepIncense", "stepWish", "stepFloat"].includes(stepId)) {
      document.getElementById("guyNameTag").classList.remove("hidden");
    } else {
      document.getElementById("guyNameTag").classList.add("hidden");
    }

    if (stepId === "stepIncense") {
      document.getElementById("incenseTargetRing").classList.remove("hidden");
    } else {
      document.getElementById("incenseTargetRing").classList.add("hidden");
    }
  }

  function confirmName() {
    const val = document.getElementById("userNameInput").value.trim();
    if (!val) {
      alert("กรุณาใส่ชื่อของคุณก่อนนะครับ");
      return;
    }
    userName = val;
    goToStep("stepAvatar");
  }

  function launchKrathong() {
    const wish = document.getElementById("userWishInput").value.trim();
    const chosenType = krathongTypes[selectedKrathongIdx].name;
    const partnerName = avatars[selectedAvatarIdx].name;

    fetch("/api/float", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        krathong: chosenType,
        wish: wish || "-",
        partner: partnerName
      })
    }).catch(() => {});

    isFloating = true;

    otherKrathongs.forEach((item) => {
      item.mesh.visible = true;
    });

    goToStep("stepFloat");

    const label = document.getElementById("floatingLabel");
    label.innerHTML = `<strong>💖 ${userName} & ${partnerName}</strong>${wish ? "<br><small>\"" + wish + "\"</small>" : ""}`;
    label.classList.remove("hidden");

    document.getElementById("finalSummary").innerText =
      `คุณ ${userName} ลอยคู่กับ ${partnerName} (${chosenType}) ${wish ? "— \"" + wish + "\"" : ""}`;
  }

  function resetAll() {
    isLit = false;
    isFloating = false;
    nukePower = 0;
    nukeGroup.visible = false;
    document.getElementById("floatingLabel").classList.add("hidden");
    document.getElementById("userWishInput").value = "";

    otherKrathongs.forEach((item) => {
      item.mesh.visible = false;
      item.tagEl.style.display = "none";
    });

    krathongMeshes.forEach((m, idx) => {
      m.visible = true;
      m.position.set(idx * kSpacing, 0, 0);
      m.userData.flame.visible = false;
      m.userData.flame.userData.ignite = 0;
      m.userData.incenseGlows.forEach((g) => {
        g.visible = false;
      });
      m.userData.incenseFlames.forEach((f) => {
        f.visible = false;
      });
      m.userData.candleLight.intensity = 0;
    });
    krathongCarousel.position.set(kCarouselX - selectedKrathongIdx * kSpacing, 0, kCarouselZ);
    goToStep("stepKrathong");
  }

  const clock = new THREE.Clock();
  const tempVec = new THREE.Vector3();
  const guyNameVec = new THREE.Vector3();
  const girlNameVec = new THREE.Vector3();
  const npcVec = new THREE.Vector3();

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (cancelled) return;
    const t = clock.getElapsedTime();

    const blastWaveBoost = nukePower * 0.42;
    const pos = water.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(
        i,
        Math.sin(x * 0.55 + t * 3.2) * (0.12 + blastWaveBoost) +
          Math.cos(y * 0.65 + t * 2.6) * (0.11 + blastWaveBoost)
      );
    }
    pos.needsUpdate = true;
    water.geometry.computeVertexNormals();

    if (nukePower > 0) {
      nukePower = Math.max(0, nukePower - 0.0032);
      const progress = 1 - nukePower;
      const capGrow = Math.max(0, (progress - 0.18) / 0.82);
      const stemH = 1.4 + progress * 9.2;
      const capY = stemH * 0.92;
      const capW = 0.35 + capGrow * 3.4;
      const capH = 0.16 + capGrow * 1.15;
      const fade = Math.min(1, nukePower / 0.35);

      shockwaveRing.scale.set(progress * 26 + 0.5, progress * 26 + 0.5, 1);
      shockwaveRing.material.opacity = nukePower * 0.9;
      shockwaveRing2.scale.set(progress * 18 + 0.3, progress * 18 + 0.3, 1);
      shockwaveRing2.material.opacity = nukePower * 0.75;
      shockwaveRing3.scale.set(progress * 10 + 0.2, progress * 10 + 0.2, 1);
      shockwaveRing3.material.opacity = nukePower * 0.55;

      const gFire = 1.2 + progress * 6.5;
      groundFire.scale.set(gFire, gFire, 1);
      groundFire.material.opacity = nukePower * 0.55;

      mushroomStem.scale.set(1 + progress * 1.15, stemH, 1 + progress * 1.15);
      mushroomStem.position.y = stemH / 2;
      mushroomStem.material.opacity = 0.78 * fade;
      mushroomStemCore.scale.set(1 + progress * 0.9, stemH, 1 + progress * 0.9);
      mushroomStemCore.position.y = stemH / 2;
      mushroomStemCore.material.opacity = 0.88 * fade;
      mushroomStemWhite.scale.set(1 + progress * 0.6, stemH * 0.92, 1 + progress * 0.6);
      mushroomStemWhite.position.y = stemH / 2;
      mushroomStemWhite.material.opacity = 0.8 * fade;

      mushroomCap.position.y = capY;
      mushroomCap.scale.set(capW, capH, capW);
      mushroomCap.material.opacity = 0.82 * fade;
      mushroomCap.rotation.y += 0.01;
      mushroomCapHot.position.y = capY + 0.05;
      mushroomCapHot.scale.set(capW * 0.72, capH * 0.75, capW * 0.72);
      mushroomCapHot.material.opacity = 0.78 * fade;
      mushroomCapCore.position.y = capY + 0.08;
      mushroomCapCore.scale.set(capW * 0.38, capH * 0.55, capW * 0.38);
      mushroomCapCore.material.opacity = 0.7 * fade;

      mushroomRim.position.y = capY - capH * 0.15;
      mushroomRim.scale.set(capW * 0.95, capW * 0.95, capH * 1.4);
      mushroomRim.material.opacity = 0.8 * fade;
      mushroomSkirt.position.y = capY - capH * 0.55;
      mushroomSkirt.scale.set(capW * 1.15, capW * 1.15, capH);
      mushroomSkirt.material.opacity = 0.5 * fade;

      const coreSize = 0.7 + progress * 2.4 * (1 - capGrow * 0.4);
      nukeCoreSphere.position.y = 0.9 + progress * 1.2;
      nukeCoreSphere.scale.set(coreSize, coreSize, coreSize);
      nukeCoreSphere.material.opacity = nukePower * 0.85;

      capLobes.forEach((lobe, i) => {
        const a = lobe.userData.baseAngle + t * 0.35;
        const r = capW * 0.85;
        lobe.position.set(Math.cos(a) * r, capY - capH * 0.2, Math.sin(a) * r);
        lobe.lookAt(lobe.position.x * 2, capY - 2.4, lobe.position.z * 2);
        const flick = 0.85 + Math.sin(t * 9 + i) * 0.18;
        lobe.scale.set(flick * capGrow * 1.6, flick * (0.6 + capGrow * 1.8), flick * capGrow * 1.6);
        lobe.material.opacity = 0.88 * fade * Math.min(1, capGrow * 2);
      });

      stemLobes.forEach((lobe, i) => {
        const a = lobe.userData.baseAngle + t * 1.6;
        const h = (0.15 + ((i * 0.11 + t * 0.2) % 0.7)) * stemH;
        const r = 0.35 + (h / stemH) * (0.15 + progress * 0.35);
        lobe.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
        lobe.rotation.z = Math.sin(t * 7 + i) * 0.25;
        lobe.scale.set(0.8, 0.9 + Math.sin(t * 11 + i) * 0.25, 0.8);
        lobe.material.opacity = 0.75 * fade;
      });

      sparkParticles.forEach((sp) => {
        const lift = Math.min(1, sp.position.y / Math.max(1.2, capY));
        sp.userData.vx += (sp.position.x >= 0 ? 1 : -1) * 0.00035 * lift * sp.userData.spread;
        sp.userData.vz += (sp.position.z >= 0 ? 1 : -1) * 0.00035 * lift * sp.userData.spread;
        sp.position.x += sp.userData.vx * 0.55;
        sp.position.y += sp.userData.vy * 0.55;
        sp.position.z += sp.userData.vz * 0.55;
        sp.userData.vy *= 0.992;
        if (sp.position.y > capY) {
          sp.userData.vy *= 0.9;
          sp.position.y = capY + (sp.position.y - capY) * 0.4;
        }
        sp.material.opacity = 0.95 * fade;
      });

      if (nukePower === 0) nukeGroup.visible = false;
    }

    const shakeX = nukePower > 0 ? Math.sin(t * 35) * nukePower * 0.38 : 0;
    const shakeY = nukePower > 0 ? Math.cos(t * 28) * nukePower * 0.38 : 0;

    if (currentStep === "stepAvatar") {
      const targetAvX = -selectedAvatarIdx * avatarSpacing;
      avatarCarousel.position.x += (targetAvX - avatarCarousel.position.x) * 0.12;

      camera.position.x += (0 - camera.position.x) * 0.08;
      camera.position.y += (2.3 - camera.position.y) * 0.08;
      camera.position.z += (5.2 - camera.position.z) * 0.08;
      camera.lookAt(0, 1.55, 1.8);

      maleAvatars.forEach((av, idx) => {
        av.rotation.y = Math.sin(t * 1.8 + idx) * 0.25;
        av.userData.torso.rotation.z = Math.sin(t * 2.2) * 0.04;
        av.userData.head.rotation.y = -Math.sin(t * 1.8 + idx) * 0.15;
        av.userData.head.rotation.x = Math.sin(t * 3.0) * 0.05;
      });
    } else {
      // คงตำแหน่ง Avatar ชายที่เลือกและ Avatar หญิงให้นั่งคู่กันริมท่าน้ำเสมอ
      avatarCarousel.position.x = 0;
      const chosenGuy = maleAvatars[selectedAvatarIdx];
      chosenGuy.position.y = 0.58 + Math.sin(t * 2.0) * 0.015;
      chosenGuy.userData.torso.rotation.x = 0.25 + Math.sin(t * 2.0) * 0.03;

      femaleAvatar.position.y = 0.58 + Math.sin(t * 2.0 + 0.6) * 0.015;
      femaleAvatar.userData.torso.rotation.x = 0.22 + Math.sin(t * 2.0 + 0.6) * 0.03;

      const targetKX = kCarouselX - selectedKrathongIdx * kSpacing;
      krathongCarousel.position.x += (targetKX - krathongCarousel.position.x) * 0.12;

      if (currentStep === "stepKrathong") {
        camera.position.x += (1.35 - camera.position.x) * 0.08;
        camera.position.y += (2.85 - camera.position.y) * 0.08;
        camera.position.z += (7.9 - camera.position.z) * 0.08;
      } else if (currentStep === "stepIncense") {
        camera.position.x += (2.05 - camera.position.x) * 0.08 + shakeX;
        camera.position.y += (2.3 - camera.position.y) * 0.08 + shakeY;
        camera.position.z += (4.6 - camera.position.z) * 0.08;
      } else if (!isFloating) {
        const targetCamZ = nukePower > 0 ? 13.2 : 6.8;
        const targetCamY = nukePower > 0 ? 6.4 : 3.3;
        const targetCamX = nukePower > 0 ? 4.4 : 1.5;
        camera.position.x += (targetCamX - camera.position.x) * 0.06 + shakeX;
        camera.position.y += (targetCamY - camera.position.y) * 0.06 + shakeY;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      }
    }

    const activeGuy = maleAvatars[selectedAvatarIdx];
    activeGuy.userData.nameAnchor.getWorldPosition(guyNameVec);
    guyNameVec.project(camera);
    const guyTag = document.getElementById("guyNameTag");
    if (guyTag && guyNameVec.z < 1) {
      guyTag.style.left = (guyNameVec.x * 0.5 + 0.5) * window.innerWidth + "px";
      guyTag.style.top = (-guyNameVec.y * 0.5 + 0.5) * window.innerHeight + "px";
    }

    if (femaleAvatar.visible) {
      femaleAvatar.userData.nameAnchor.getWorldPosition(girlNameVec);
      girlNameVec.project(camera);
      const girlTag = document.getElementById("girlNameTag");
      if (girlTag && girlNameVec.z < 1) {
        girlTag.style.left = (girlNameVec.x * 0.5 + 0.5) * window.innerWidth + "px";
        girlTag.style.top = (-girlNameVec.y * 0.5 + 0.5) * window.innerHeight + "px";
      }
    }

    krathongMeshes.forEach((m, idx) => {
      m.rotation.y += 0.008;
      let bounceOffset = 0;
      if (m.userData.bounceAnim > 0) {
        bounceOffset = Math.sin(m.userData.bounceAnim * Math.PI) * 0.45;
        m.userData.bounceAnim = Math.max(0, m.userData.bounceAnim - 0.025);
      }
      m.position.y = Math.sin(t * 3.2 + idx) * 0.07 + bounceOffset;
      m.rotation.z = Math.sin(t * 2.8 + idx) * 0.06;

      const browsing = currentStep === "stepKrathong";
      const targetScale = browsing ? (idx === selectedKrathongIdx ? 1.02 : 0.7) : 0.95;
      const nextScale = m.scale.x + (targetScale - m.scale.x) * 0.14;
      m.scale.set(nextScale, nextScale, nextScale);

      const ripScale = 1 + ((t * 0.8 + idx * 0.3) % 1) * 1.1;
      m.userData.rippleMesh.scale.set(ripScale, ripScale, 1);
      m.userData.rippleMesh.material.opacity = 0.5 * (1 - ((t * 0.8 + idx * 0.3) % 1));

      if (m.userData.orbitRings) {
        m.userData.orbitRings.forEach((ring, ri) => {
          ring.rotation.y += 0.012 + ri * 0.006;
          ring.rotation.z += 0.004;
        });
      }

      if (m.userData.flame && m.userData.flame.visible) {
        animateFlame(m.userData.flame, t, idx === selectedKrathongIdx ? nukePower * 1.2 : 0.15);
        m.userData.incenseFlames.forEach((tip, ti) => {
          if (!tip.visible) return;
          const flick = 0.85 + Math.sin(t * 16 + ti) * 0.2;
          tip.scale.set(flick, 0.9 + Math.sin(t * 20 + ti) * 0.25, flick);
        });
      }

      if (isLit && idx === selectedKrathongIdx) {
        m.userData.candleLight.intensity = 5.5 + Math.sin(t * 16) * 1.2 + nukePower * 8.0;
      }
    });

    if (currentStep === "stepIncense") {
      const activeMesh = krathongMeshes[selectedKrathongIdx];
      activeMesh.userData.incenseAnchor.getWorldPosition(tempVec);
      tempVec.project(camera);
      const ring = document.getElementById("incenseTargetRing");
      ring.style.left = (tempVec.x * 0.5 + 0.5) * window.innerWidth + "px";
      ring.style.top = (-tempVec.y * 0.5 + 0.5) * window.innerHeight + "px";
    }

    otherKrathongs.forEach((item, i) => {
      if (!isFloating) {
        item.tagEl.style.display = "none";
        return;
      }

      item.mesh.position.x += item.speed;
      if (item.mesh.position.x > 16) item.mesh.position.x = -16;
      item.mesh.position.y = Math.sin(t * 3.0 + i) * 0.07;
      item.mesh.rotation.z = Math.cos(t * 2.5 + i) * 0.06;
      item.mesh.rotation.y += 0.005;
      animateFlame(item.mesh.userData.flame, t, 0.12);
      if (item.mesh.userData.orbitRings) {
        item.mesh.userData.orbitRings.forEach((ring, ri) => {
          ring.rotation.y += 0.01 + ri * 0.005;
        });
      }

      item.mesh.userData.labelAnchor.getWorldPosition(npcVec);
      npcVec.project(camera);
      if (npcVec.z < 1) {
        item.tagEl.style.display = "block";
        item.tagEl.style.left = (npcVec.x * 0.5 + 0.5) * window.innerWidth + "px";
        item.tagEl.style.top = (-npcVec.y * 0.5 + 0.5) * window.innerHeight + "px";
      } else {
        item.tagEl.style.display = "none";
      }
    });

    if (currentStep !== "stepAvatar") {
      if (isFloating) {
        const activeKrathong = krathongMeshes[selectedKrathongIdx];
        activeKrathong.position.z -= 0.022;
        activeKrathong.position.x += 0.008 + Math.sin(t * 1.5) * 0.004;
        // คงมุมกล้องให้ยังเห็นทั้งคู่ที่นั่งริมท่าน้ำและกระทงที่ลอยออกไปพร้อมกัน
        camera.position.x += (0.8 - camera.position.x) * 0.02;
        camera.position.y += (3.8 - camera.position.y) * 0.02;
        camera.position.z += (7.5 - camera.position.z) * 0.02;
        camera.lookAt(-0.2, 0.7, activeKrathong.position.z * 0.5);
      } else if (currentStep === "stepKrathong") {
        camera.lookAt(kCarouselX, 0.42, kCarouselZ);
      } else if (currentStep === "stepIncense") {
        camera.lookAt(kCarouselX, 0.95, kCarouselZ);
      } else if (nukePower > 0) {
        camera.lookAt(kCarouselX, 2.2 + (1 - nukePower) * 5.5, kCarouselZ);
      } else {
        camera.lookAt(0.15, 0.85, 0.45);
      }
    }

    lanterns.forEach((l) => {
      l.position.y += 0.015;
      if (l.position.y > 18) l.position.y = 1;
    });

    renderer.render(scene, camera);
  }

  animate();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onResize);

  function destroy() {
    cancelled = true;
    cancelAnimationFrame(rafId);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("resize", onResize);
    if (npcTagsContainer) npcTagsContainer.innerHTML = "";
    disposables.forEach((obj) => {
      if (obj && typeof obj.dispose === "function") obj.dispose();
    });
    renderer.dispose();
  }

  return {
    goToStep,
    slideAvatar,
    confirmAvatar,
    confirmName,
    launchKrathong,
    resetAll,
    destroy
  };
}
