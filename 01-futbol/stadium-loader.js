/* LFO · Cargador de estadios (.lfos)
 *
 * Los estadios de /stadiums se exportaron de three.js con Object3D.toJSON; build-bin.mjs los convierte a .lfos
 * (header JSON + blob binario). El simulador trae una versión reducida de three.js sin ObjectLoader, así que
 * acá se reconstruye la escena con las clases que expone T3 (Mesh, InstancedMesh, Line, materiales, CanvasTexture…).
 *
 *   LFOStadiums.list                                   -> [{id, name}]
 *   LFOStadiums.pick(seedString)                       -> id determinista
 *   LFOStadiums.load(T3, id) -> Promise<handle>
 *   handle = { id, title, group, update(elapsed, energy, camera), setClubColors(primary, secondary, nombre), setDensity(0..1),
 *              goal(esLocal), kickoff(), dispose() }
 *   Alambrado, banderas y efectos de hinchada (bengalas, papelitos, globos): stadium-fx.js
 *
 * El campo "Campo_original_105x68" del export se descarta: el simulador ya tiene su propio césped, líneas y arcos.
 * Las animaciones (hinchada, banderas) las hace update(): el export pedía un stadium-runtime.js que no existe.
 */
(function (g) {
  'use strict';
  const LIST = [
    { id: '01_dos_anillos', name: 'Dos Anillos' },
    { id: '02_fortin_celeste', name: 'El Fortín Celeste' },
    { id: '03_margim', name: 'Estadio Margim' },
    { id: '04_la_darsena', name: 'La Dársena' },
  ];
  const CTORS = { Float32Array, Uint16Array, Uint32Array, Uint8Array, Int16Array, Int32Array, Int8Array };
  const cache = new Map(); // id -> Promise<ArrayBuffer>

  function hash(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }

  function fetchBuffer(id) {
    if (!cache.has(id)) {
      const p = fetch('stadiums/' + id + '.lfos').then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el estadio ' + id + ' (' + r.status + ')');
        return r.arrayBuffer();
      });
      p.catch(() => cache.delete(id));
      cache.set(id, p);
    }
    return cache.get(id);
  }

  async function build(T3, id, buf) {
    const dv = new DataView(buf);
    if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'LFOS') throw new Error('Formato de estadio inválido');
    const hl = dv.getUint32(4, true);
    const j = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl)).replace(/\0+$/, ''));
    const base = 8 + hl;
    const typed = (type, bin) => new CTORS[type](buf.slice(base + bin[0], base + bin[0] + bin[1] * CTORS[type].BYTES_PER_ELEMENT));

    // imágenes -> canvas (mismo trabajo que TextureLoader, pero desde bytes PNG)
    const canvases = new Map();
    await Promise.all(j.images.map(async (im) => {
      const bytes = new Uint8Array(buf, base + im.bin[0], im.bin[1]);
      const bmp = await createImageBitmap(new Blob([bytes], { type: im.mime || 'image/png' }));
      const c = document.createElement('canvas');
      c.width = bmp.width; c.height = bmp.height;
      c.getContext('2d').drawImage(bmp, 0, 0);
      if (bmp.close) bmp.close();
      canvases.set(im.uuid, c);
    }));

    const textures = new Map();
    for (const t of j.textures) {
      const tex = new T3.CanvasTexture(canvases.get(t.image));
      tex.name = t.name || '';
      tex.wrapS = t.wrap[0]; tex.wrapT = t.wrap[1];
      tex.repeat.set(t.repeat[0], t.repeat[1]);
      tex.offset.set(t.offset[0], t.offset[1]);
      tex.rotation = t.rotation || 0;
      tex.anisotropy = Math.min(4, t.anisotropy || 1);
      tex.colorSpace = t.colorSpace === 'srgb' ? T3.SRGBColorSpace : '';
      tex.needsUpdate = true;
      textures.set(t.uuid, tex);
    }

    const materials = new Map();
    for (const m of j.materials) {
      const p = {};
      if (m.color !== undefined) p.color = m.color;
      if (m.type === 'LineBasicMaterial') {
        p.linewidth = m.linewidth;
        if (m.opacity !== undefined && m.opacity < 1) { p.opacity = m.opacity; p.transparent = true; }
        materials.set(m.uuid, new T3.LineBasicMaterial(p));
        continue;
      }
      if (m.side !== undefined) p.side = m.side;
      if (m.opacity !== undefined && m.opacity < 1) p.opacity = m.opacity;
      if (m.transparent) p.transparent = true;
      if (m.depthWrite === false) p.depthWrite = false;
      if (m.vertexColors) p.vertexColors = true;
      if (m.alphaTest) p.alphaTest = m.alphaTest;
      if (m.map) p.map = textures.get(m.map);
      let mat;
      if (m.type === 'MeshBasicMaterial') {
        mat = new T3.MeshBasicMaterial(p);
      } else {
        p.roughness = m.roughness; p.metalness = m.metalness;
        if (m.emissive) { p.emissive = m.emissive; p.emissiveIntensity = m.emissiveIntensity ?? 1; }
        else if (m.emissiveIntensity && m.emissive === 0) p.emissive = 0;
        if (m.roughnessMap) p.roughnessMap = textures.get(m.roughnessMap);
        if (m.bumpMap) { p.bumpMap = textures.get(m.bumpMap); p.bumpScale = m.bumpScale ?? 1; }
        mat = new T3.MeshStandardMaterial(p);
      }
      mat.name = m.name || '';
      mat.userData = m.userData || {};
      materials.set(m.uuid, mat);
    }

    const geometries = new Map();
    for (const gd of j.geometries) {
      let geo;
      if (gd.type === 'BufferGeometry') {
        geo = new T3.BufferGeometry();
        for (const [name, a] of Object.entries(gd.data.attributes)) {
          geo.setAttribute(name, new T3.Float32BufferAttribute(typed(a.type, a.bin), a.itemSize));
        }
        if (gd.data.index) geo.setIndex(Array.from(typed(gd.data.index.type, gd.data.index.bin)));
      } else if (gd.type === 'PlaneGeometry') geo = new T3.PlaneGeometry(gd.width, gd.height, gd.widthSegments, gd.heightSegments);
      else if (gd.type === 'BoxGeometry') geo = new T3.BoxGeometry(gd.width, gd.height, gd.depth, gd.widthSegments, gd.heightSegments, gd.depthSegments);
      else if (gd.type === 'CylinderGeometry') geo = new T3.CylinderGeometry(gd.radiusTop, gd.radiusBottom, gd.height, gd.radialSegments, gd.heightSegments, gd.openEnded, gd.thetaStart, gd.thetaLength);
      else continue;
      geometries.set(gd.uuid, geo);
    }

    const crowd = [], flags = [], paints = [], seatList = [];
    const root = new T3.Group();
    root.name = 'stadium:' + id;

    function make(n) {
      if (n.userData && n.userData.animation === 'flag') return null;
      let o;
      if (n.type === 'Group' || n.type === 'Scene') o = new T3.Group();
      else if (n.type === 'Mesh') o = new T3.Mesh(geometries.get(n.geometry), materials.get(n.material));
      else if (n.type === 'Line') o = new T3.Line(geometries.get(n.geometry), materials.get(n.material));
      else if (n.type === 'InstancedMesh') {
        o = new T3.InstancedMesh(geometries.get(n.geometry), materials.get(n.material), n.count);
        o.instanceMatrix.array.set(typed(n.instanceMatrix.type, n.instanceMatrix.bin));
        o.instanceMatrix.needsUpdate = true;
        o.count = n.count;
        o.userData.fullCount = n.count;
        if (n.userData && n.userData.animation === 'crowd') {
          const im = o.instanceMatrix.array;
          for (let i = 0; i < n.count; i++) seatList.push(im[i * 16 + 12], im[i * 16 + 13], im[i * 16 + 14]);
        }
      } else return null;
      o.name = n.name || '';
      o.userData = Object.assign(o.userData || {}, n.userData || {});
      if (n.matrix) { o.matrixAutoUpdate = false; o.matrix.fromArray(n.matrix); o.userData.baseY = n.matrix[13]; o.userData.baseX = n.matrix[12]; o.userData.baseSX = n.matrix[0]; }
      o.castShadow = false; // el sol del simulador sólo cubre el campo; las tribunas no proyectan
      o.receiveShadow = !!n.receiveShadow;
      if (n.visible === false) o.visible = false;
      if (n.frustumCulled === false) o.frustumCulled = false;
      if (n.type === 'InstancedMesh') o.frustumCulled = false;
      const an = o.userData.animation;
      if (an === 'crowd') crowd.push(o);
      else if (an === 'flag') flags.push(o);
      if (o.material && o.material.name && /^Pintura club \d$/.test(o.material.name) && !paints.includes(o.material)) paints.push(o.material);
      for (const c of n.children || []) {
        if (c.userData && c.userData.preserved) continue; // Campo_original: se conserva el del simulador
        const co = make(c);
        if (co) o.add(co);
      }
      return o;
    }
    for (const c of j.object.children) {
      if (c.userData && c.userData.preserved) continue;
      const co = make(c);
      if (co) root.add(co);
    }

    // Cubierta: se parte en sectores angulares para poder ocultar (corte de transmisión) el techo del lado de la cámara,
    // que si no tapa la vista desde la posición habitual de la cámara de TV.
    const SECT = 12, roofParts = [];
    const roof = root.children.find((c) => c.name === 'Cubierta');
    if (roof) {
      for (const m of roof.children.slice()) {
        const geo = m.geometry;
        const pos = geo && geo.attributes && geo.attributes.position;
        if (!pos || geo.index || m.type !== 'Mesh') continue;
        const nor = geo.attributes.normal, uv = geo.attributes.uv;
        const buckets = Array.from({ length: SECT }, () => ({ p: [], n: [], u: [] }));
        for (let t = 0; t < pos.count; t += 3) {
          const cx = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3;
          const cz = (pos.getZ(t) + pos.getZ(t + 1) + pos.getZ(t + 2)) / 3;
          const k = Math.min(SECT - 1, Math.floor(((Math.atan2(cz, cx) + Math.PI) / (2 * Math.PI)) * SECT));
          const b = buckets[k];
          for (let v = 0; v < 3; v++) {
            b.p.push(pos.getX(t + v), pos.getY(t + v), pos.getZ(t + v));
            if (nor) b.n.push(nor.getX(t + v), nor.getY(t + v), nor.getZ(t + v));
            if (uv) b.u.push(uv.getX(t + v), uv.getY(t + v));
          }
        }
        const holder = new T3.Group();
        holder.name = m.name;
        holder.matrixAutoUpdate = false;
        holder.matrix.copy(m.matrix);
        m.matrixAutoUpdate = false;
        buckets.forEach((b, k) => {
          if (!b.p.length) return;
          const g2 = new T3.BufferGeometry();
          g2.setAttribute('position', new T3.Float32BufferAttribute(b.p, 3));
          if (b.n.length) g2.setAttribute('normal', new T3.Float32BufferAttribute(b.n, 3));
          if (b.u.length) g2.setAttribute('uv', new T3.Float32BufferAttribute(b.u, 2));
          const part = new T3.Mesh(g2, m.material);
          part.frustumCulled = false;
          part.receiveShadow = m.receiveShadow;
          part.userData.sector = k;
          holder.add(part);
          roofParts.push(part);
        });
        roof.remove(m);
        geo.dispose();
        roof.add(holder);
      }
    }

    const fx = g.LFOStadiumFX ? g.LFOStadiumFX.attach(T3, root, new Float32Array(seatList), hash(id)) : null;

    const info = j.object.userData || {};
    const handle = {
      id,
      title: info.title || id,
      info,
      group: root,
      camera: info.camera || null,
      update(elapsed, energy, camera) {
        if (camera && roofParts.length) {
          const cs = Math.min(SECT - 1, Math.floor(((Math.atan2(camera.position.z, camera.position.x) + Math.PI) / (2 * Math.PI)) * SECT));
          for (let i = 0; i < roofParts.length; i++) {
            let d = Math.abs(roofParts[i].userData.sector - cs);
            d = Math.min(d, SECT - d);
            roofParts[i].visible = d > 2;
          }
        }
        const e = 0.35 + 0.65 * Math.min(1, Math.max(0, energy || 0));
        for (let i = 0; i < crowd.length; i++) {
          const m = crowd[i].matrix.elements, ph = i * 0.9;
          m[13] = (crowd[i].userData.baseY || 0) + (Math.sin(elapsed * 3.1 + ph) * 0.07 + Math.sin(elapsed * 6.3 + ph * 1.7) * 0.03) * e;
        }
        for (let i = 0; i < flags.length; i++) {
          const f = flags[i], m = f.matrix.elements, ph = f.userData.phase || 0;
          m[0] = (f.userData.baseSX || 1) * (1 + Math.sin(elapsed * 2.4 + ph) * 0.05);
          m[12] = (f.userData.baseX || 0) + Math.sin(elapsed * 1.7 + ph) * 0.06;
          f.matrixWorldNeedsUpdate = true;
        }
        for (let i = 0; i < crowd.length; i++) crowd[i].matrixWorldNeedsUpdate = true;
        if (fx) fx.update(elapsed, energy, camera);
      },
      goal(esLocal) { if (fx) fx.goal(esLocal); },
      kickoff() { if (fx) fx.kickoff(); },
      setClubColors(primary, secondary, clubName) {
        if (fx) fx.setColors(primary, secondary, clubName);
        const p = new T3.Color(primary), s = new T3.Color(secondary);
        const dark = new T3.Color(primary).multiplyScalar(0.55);
        paints.forEach((m) => {
          const k = Number(m.name.slice(-1));
          m.color.copy(k === 0 ? p : k === 1 ? s : dark);
        });
      },
      setDensity(f) {
        if (fx) fx.setQuality(f);
        crowd.forEach((c) => { c.count = Math.max(1, Math.floor(c.userData.fullCount * f)); });
      },
      dispose() {
        if (fx) fx.dispose();
        root.traverse((o) => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); });
        materials.forEach((m) => m.dispose && m.dispose());
        textures.forEach((t) => t.dispose && t.dispose());
      },
    };
    return handle;
  }

  g.LFOStadiums = {
    list: LIST,
    pick(seed) { return LIST[hash(String(seed)) % LIST.length].id; },
    prefetch(id) { return fetchBuffer(id); },
    async load(T3, id) { return build(T3, id, await fetchBuffer(id)); },
  };
})(window);
